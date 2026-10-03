"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authEvents } from "@/src/lib/auth/auth-events";
import { inboxSyncBridge } from "@/src/lib/inbox-sync-bridge";
import { POLL_INTERVALS } from "@/src/lib/polling";
import { NOTIFICATIONS_QUERY_KEY } from "@/src/features/notifications/NotificationBell";
import {
  inboxService,
  type InboxCounts,
  type InboxGroup,
  type InboxHeader,
  type InboxListData,
  type InboxMe,
  type InboxMessage,
  type InboxRow,
  type InboxScope,
  type InboxUser,
  type OpenConversation,
  type PatientContext,
} from "./inbox";

const SYNC_VISIBLE_MS = POLL_INTERVALS.inboxSyncVisible;
const SYNC_HIDDEN_MS = POLL_INTERVALS.inboxSyncHidden;

interface OpenState extends Omit<OpenConversation, "now"> {
  loadingOlder: boolean;
}

interface State {
  scope: InboxScope;
  q: string;
  rows: Record<string, InboxRow>;
  next: Partial<Record<InboxGroup, string | null>>;
  loadedGroups: InboxGroup[];
  results: { ids: string[]; next: string | null } | null;
  counts: InboxCounts | null;
  users: InboxUser[];
  me: InboxMe | null;
  aiEnabled: boolean;
  cursor: number | null;
  listLoading: boolean;
  /** Set when the list request failed - the page shows an error + Retry, never an endless skeleton. */
  listError: string | null;
  openId: string | null;
  open: OpenState | null;
  openLoading: boolean;
  openError: string | null;
  /** Bumped by "Retry" to re-run the open-chat request. */
  openAttempt: number;
  now: number;
}

type Action =
  | { type: "scope"; scope: InboxScope }
  | { type: "query"; q: string }
  | { type: "listLoading" }
  | { type: "listError"; msg: string }
  | { type: "openError"; msg: string }
  | { type: "openRetry" }
  | { type: "list"; data: InboxListData; group?: InboxGroup; append?: boolean }
  | { type: "sync"; changed: InboxRow[]; messages: InboxMessage[]; conversation?: InboxHeader; presence?: { id: string; name: string }[]; counts: InboxCounts; now: number }
  | { type: "openStart"; id: string | null }
  | { type: "openLoaded"; data: OpenConversation }
  | { type: "olderLoading" }
  | { type: "olderLoaded"; messages: InboxMessage[]; has_more: boolean; before: number | null }
  | { type: "message"; message: InboxMessage }
  | { type: "header"; header: InboxHeader }
  | { type: "context"; context: PatientContext }
  | { type: "row"; row: InboxRow }
  | { type: "tick"; now: number };

function mergeMessages(list: InboxMessage[], incoming: InboxMessage[]): InboxMessage[] {
  const out = [...list];
  for (const m of incoming) {
    const i = out.findIndex((x) => x.id === m.id || (m.client_id && x.client_id === m.client_id));
    if (i >= 0) out[i] = { ...out[i], ...m, local: false };
    else out.push(m);
  }
  return out.sort((a, b) => a.at - b.at);
}

function headerToRow(header: InboxHeader): InboxRow {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { window, ...row } = header;
  return row;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "scope":
      return { ...state, scope: action.scope, next: {}, loadedGroups: [] };
    case "query":
      return { ...state, q: action.q, results: action.q ? state.results : null };
    case "listLoading":
      return { ...state, listLoading: true, listError: null };
    case "listError":
      return { ...state, listLoading: false, listError: action.msg };
    case "openError":
      return { ...state, openLoading: false, openError: action.msg };
    case "openRetry":
      return { ...state, openLoading: true, openError: null, openAttempt: state.openAttempt + 1 };
    case "list": {
      const { data } = action;
      const rows = { ...state.rows };
      const pages = data.results ? { results: data.results } : (data.groups ?? {});
      for (const page of Object.values(pages)) for (const r of page?.items ?? []) rows[r.id] = { ...rows[r.id], ...r };
      const next = { ...state.next };
      const loaded = new Set(state.loadedGroups);
      for (const [g, page] of Object.entries(data.groups ?? {})) {
        next[g as InboxGroup] = page?.next ?? null;
        loaded.add(g as InboxGroup);
      }
      const results = data.results
        ? {
            ids: action.append && state.results
              ? [...state.results.ids, ...data.results.items.map((r) => r.id)]
              : data.results.items.map((r) => r.id),
            next: data.results.next,
          }
        : action.group ? state.results : null;
      return {
        ...state,
        rows,
        next,
        loadedGroups: [...loaded],
        results,
        counts: data.counts,
        users: data.users ?? state.users,
        me: data.me ?? state.me,
        aiEnabled: data.ai_enabled ?? state.aiEnabled,
        cursor: state.cursor ?? data.now,
        listLoading: false,
        listError: null,
        now: data.now,
      };
    }
    case "sync": {
      const rows = { ...state.rows };
      for (const r of action.changed) rows[r.id] = r;
      let open = state.open;
      if (open && state.openId) {
        if (action.messages.length) open = { ...open, messages: mergeMessages(open.messages, action.messages) };
        if (action.conversation) open = { ...open, conversation: action.conversation };
        if (action.presence) open = { ...open, presence: action.presence };
        if (open !== state.open && rows[state.openId]) rows[state.openId] = { ...rows[state.openId], unread: 0 };
      }
      return { ...state, rows, open, counts: action.counts, cursor: action.now, now: action.now };
    }
    case "openStart":
      return {
        ...state,
        openId: action.id,
        open: action.id === state.openId ? state.open : null,
        openLoading: Boolean(action.id),
        openError: null,
      };
    case "openLoaded": {
      if (action.data.conversation.id !== state.openId) return state;
      const { now: _now, ...rest } = action.data; // eslint-disable-line @typescript-eslint/no-unused-vars
      const row = { ...headerToRow(action.data.conversation), unread: 0 };
      return {
        ...state,
        open: { ...rest, loadingOlder: false },
        openLoading: false,
        openError: null,
        rows: { ...state.rows, [row.id]: row },
      };
    }
    case "olderLoading":
      return state.open ? { ...state, open: { ...state.open, loadingOlder: true } } : state;
    case "olderLoaded":
      return state.open
        ? {
            ...state,
            open: {
              ...state.open,
              messages: mergeMessages(state.open.messages, action.messages),
              has_more: action.has_more,
              before: action.before,
              loadingOlder: false,
            },
          }
        : state;
    case "message":
      return state.open ? { ...state, open: { ...state.open, messages: mergeMessages(state.open.messages, [action.message]) } } : state;
    case "header": {
      const row = headerToRow(action.header);
      return {
        ...state,
        rows: { ...state.rows, [row.id]: { ...row, unread: state.rows[row.id]?.unread ?? 0 } },
        open: state.open && state.openId === row.id ? { ...state.open, conversation: action.header } : state.open,
      };
    }
    case "context":
      return state.open ? { ...state, open: { ...state.open, context: action.context } } : state;
    case "row":
      return { ...state, rows: { ...state.rows, [action.row.id]: action.row } };
    case "tick":
      return { ...state, now: action.now };
  }
}

/** Short, human reason for an error card ("Server error (500)", "No connection"...). */
export function errorMessage(err: unknown): string {
  const e = err as { status?: number; msg?: string } | undefined;
  if (!e?.status) return "No connection to the server.";
  if (e.status === 404) return "The inbox service wasn't found on this server (404).";
  if (e.status >= 500) return `Server error (${e.status}).`;
  return e.msg || `Request failed (${e.status}).`;
}

interface InboxContextValue {
  state: State;
  setScope: (scope: InboxScope) => void;
  setQuery: (q: string) => void;
  loadGroup: (group: InboxGroup, more?: boolean) => Promise<void>;
  loadMoreResults: () => Promise<void>;
  openChat: (id: string | null) => void;
  loadOlder: () => Promise<void>;
  putMessage: (m: InboxMessage) => void;
  putHeader: (h: InboxHeader) => void;
  putContext: (c: PatientContext) => void;
  syncNow: () => void;
  reload: () => Promise<void>;
  retryOpen: () => void;
}

const InboxContext = createContext<InboxContextValue | null>(null);

export function useInbox(): InboxContextValue {
  const ctx = useContext(InboxContext);
  if (!ctx) throw new Error("useInbox must be used inside <InboxProvider>");
  return ctx;
}

export function InboxProvider({ children, initialOpenId }: { children: React.ReactNode; initialOpenId?: string | null }) {
  const queryClient = useQueryClient();
  const [state, dispatch] = useReducer(reducer, {
    scope: "all",
    q: "",
    rows: {},
    next: {},
    loadedGroups: [],
    results: null,
    counts: null,
    users: [],
    me: null,
    aiEnabled: false,
    cursor: null,
    listLoading: true,
    listError: null,
    openId: initialOpenId ?? null,
    open: null,
    openLoading: Boolean(initialOpenId),
    openError: null,
    openAttempt: 0,
    now: Date.now(),
  });

  // Refs so the sync loop always reads the latest values without restarting.
  const stateRef = useRef(state);
  stateRef.current = state;
  const bellRef = useRef<number | null>(null);

  const fetchList = useCallback(async (scope: InboxScope, q: string, withUsers: boolean) => {
    dispatch({ type: "listLoading" });
    try {
      const res = await inboxService.list({ scope, q: q || undefined, include_users: withUsers || undefined });
      if (stateRef.current.scope === scope && stateRef.current.q === q) dispatch({ type: "list", data: res.data });
    } catch (err) {
      dispatch({ type: "listError", msg: errorMessage(err) });
    }
  }, []);

  // ---------- list ----------
  useEffect(() => {
    void fetchList(state.scope, state.q, !stateRef.current.me);
  }, [state.scope, state.q, fetchList]);

  const loadGroup = useCallback(async (group: InboxGroup, more = false) => {
    const { scope, next } = stateRef.current;
    const res = await inboxService.list({ scope, group, cursor: more ? (next[group] ?? undefined) : undefined });
    dispatch({ type: "list", data: res.data, group });
  }, []);

  const loadMoreResults = useCallback(async () => {
    const { scope, q, results } = stateRef.current;
    if (!results?.next) return;
    const res = await inboxService.list({ scope, q, cursor: results.next });
    dispatch({ type: "list", data: res.data, append: true });
  }, []);

  // ---------- open chat ----------
  const openChat = useCallback((id: string | null) => {
    dispatch({ type: "openStart", id });
  }, []);

  useEffect(() => {
    const id = state.openId;
    if (!id) return;
    let cancelled = false;
    inboxService
      .open(id)
      .then((res) => !cancelled && dispatch({ type: "openLoaded", data: res.data }))
      .catch((err) => !cancelled && dispatch({ type: "openError", msg: errorMessage(err) }));
    return () => {
      cancelled = true;
    };
  }, [state.openId, state.openAttempt]);

  const loadOlder = useCallback(async () => {
    const { openId, open } = stateRef.current;
    if (!openId || !open?.has_more || !open.before || open.loadingOlder) return;
    dispatch({ type: "olderLoading" });
    const res = await inboxService.older(openId, open.before);
    dispatch({ type: "olderLoaded", ...res.data });
  }, []);

  // ---------- sync loop ----------
  const timerRef = useRef<number | null>(null);
  const inFlightRef = useRef(false);
  const stoppedRef = useRef(false);

  const runSync = useCallback(async () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    const schedule = () => {
      if (stoppedRef.current) return;
      timerRef.current = window.setTimeout(runSync, document.hidden ? SYNC_HIDDEN_MS : SYNC_VISIBLE_MS);
    };
    const { cursor, scope, openId } = stateRef.current;
    if (stoppedRef.current || inFlightRef.current) return;
    if (cursor === null) return schedule();
    inFlightRef.current = true;
    try {
      const res = await inboxService.sync({ since: cursor, scope, open: openId ?? undefined });
      const d = res.data;
      if (d.reset) {
        await fetchList(stateRef.current.scope, stateRef.current.q, false);
      }
      dispatch({ type: "sync", changed: d.changed, messages: d.messages, conversation: d.conversation, presence: d.presence, counts: d.counts, now: d.now });
      if (bellRef.current !== null && bellRef.current !== d.bell) {
        queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      }
      bellRef.current = d.bell;
    } catch {
      // Network blip or expired session - the next tick retries; logout stops it.
    } finally {
      inFlightRef.current = false;
      schedule();
    }
  }, [fetchList, queryClient]);

  useEffect(() => {
    stoppedRef.current = false;
    inboxSyncBridge.setActive(true);
    timerRef.current = window.setTimeout(runSync, SYNC_VISIBLE_MS);
    const onVisible = () => {
      if (!document.hidden) runSync();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    const stop = () => {
      stoppedRef.current = true;
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    const offSession = authEvents.onSessionEnded(stop);
    return () => {
      stop();
      offSession();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      inboxSyncBridge.setActive(false);
    };
  }, [runSync]);

  // Re-render every 30s so waiting timers, reply-window labels and ended
  // snoozes update without any request.
  useEffect(() => {
    const id = window.setInterval(() => dispatch({ type: "tick", now: Date.now() }), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const value = useMemo<InboxContextValue>(
    () => ({
      state,
      setScope: (scope) => dispatch({ type: "scope", scope }),
      setQuery: (q) => dispatch({ type: "query", q }),
      loadGroup,
      loadMoreResults,
      openChat,
      loadOlder,
      putMessage: (message) => dispatch({ type: "message", message }),
      putHeader: (header) => dispatch({ type: "header", header }),
      putContext: (context) => dispatch({ type: "context", context }),
      syncNow: () => void runSync(),
      // Also re-asks for the staff list if the very first load never got it.
      reload: () => fetchList(stateRef.current.scope, stateRef.current.q, !stateRef.current.me),
      retryOpen: () => dispatch({ type: "openRetry" }),
    }),
    [state, loadGroup, loadMoreResults, openChat, loadOlder, runSync, fetchList]
  );

  return <InboxContext.Provider value={value}>{children}</InboxContext.Provider>;
}

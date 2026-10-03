"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, CheckCheck, ChevronRight, Hourglass, Loader2, Search, Timer, User, UserRound, AlarmClock, MessageCircle } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { avatarColor, initials } from "@/src/features/appointments/AppointmentRow";
import { cn } from "@/src/lib/utils";
import {
  COLLAPSED_GROUPS,
  GROUP_LABEL,
  GROUP_ORDER,
  displayName,
  groupOf,
  inScope,
  listTime,
  sortRows,
  waitingLabel,
  waitingTone,
  type InboxGroup,
  type InboxRow,
  type InboxScope,
} from "./inbox";
import { InboxErrorState } from "./InboxErrorState";
import { errorMessage, useInbox } from "./InboxProvider";
import { toast } from "@/src/lib/toast";

const SCOPES: { value: InboxScope; label: string }[] = [
  { value: "mine", label: "Mine" },
  { value: "team", label: "Team" },
  { value: "all", label: "All" },
];

const GROUP_ICON: Record<InboxGroup, React.ComponentType<{ className?: string }>> = {
  waiting: Hourglass,
  in_progress: MessageCircle,
  bot: Bot,
  snoozed: AlarmClock,
  done: CheckCheck,
};

export function ConversationList() {
  const { state, setScope, setQuery, loadGroup, loadMoreResults, openChat, reload } = useInbox();
  const [search, setSearch] = useState(state.q);
  const debounced = useDebouncedValue(search.trim(), 300);
  const [expanded, setExpanded] = useState<InboxGroup[]>([]);

  useEffect(() => {
    if (debounced !== state.q) setQuery(debounced);
  }, [debounced, state.q, setQuery]);

  const meId = state.me?.id;
  const grouped = useMemo(() => {
    const buckets = Object.fromEntries(GROUP_ORDER.map((g) => [g, [] as InboxRow[]])) as Record<InboxGroup, InboxRow[]>;
    for (const row of Object.values(state.rows)) {
      if (!row.last_at || !inScope(row, state.scope, meId)) continue;
      buckets[groupOf(row, state.now)].push(row);
    }
    for (const g of GROUP_ORDER) buckets[g] = sortRows(g, buckets[g]);
    return buckets;
  }, [state.rows, state.scope, state.now, meId]);

  const toggleGroup = (g: InboxGroup) => {
    const opening = !expanded.includes(g);
    setExpanded((cur) => (opening ? [...cur, g] : cur.filter((x) => x !== g)));
    if (opening && !state.loadedGroups.includes(g)) {
      loadGroup(g).catch((err) => toast.error(`Couldn't load ${GROUP_LABEL[g].toLowerCase()}`, errorMessage(err)));
    }
  };

  const counts = state.counts;
  const searching = Boolean(state.q);

  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <div className="space-y-3 border-b border-[#E3E9E5] px-4 pb-3 pt-4 dark:border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#17261F] dark:text-foreground">Conversations</h2>
          <span className="text-sm text-muted-foreground" data-testid="count-all">{counts?.scopes.all ?? ""}</span>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone or message"
            aria-label="Search conversations"
            className="h-10 pl-9"
          />
        </div>
        <div role="tablist" aria-label="Scope" className="grid grid-cols-3 rounded-lg bg-muted/60 p-1 text-sm">
          {SCOPES.map((s) => (
            <button
              key={s.value}
              role="tab"
              type="button"
              aria-selected={state.scope === s.value}
              onClick={() => setScope(s.value)}
              className={cn(
                "rounded-md px-2 py-1.5 transition-colors",
                state.scope === s.value
                  ? "bg-background font-semibold text-[#17261F] shadow-sm dark:text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s.label} · {counts?.scopes[s.value] ?? "–"}
            </button>
          ))}
        </div>
      </div>

      {state.listError && Object.keys(state.rows).length > 0 && (
        <div role="alert" className="flex items-center justify-between gap-2 border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          <span>Couldn&apos;t refresh conversations.</span>
          <button type="button" className="font-semibold underline" onClick={() => void reload()}>Retry</button>
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto" data-testid="conversation-list">
        {state.listError && !Object.keys(state.rows).length ? (
          <InboxErrorState title="Couldn't load conversations" detail={state.listError} onRetry={reload} testId="list-error" />
        ) : state.listLoading && !Object.keys(state.rows).length ? (
          <ListSkeleton />
        ) : searching ? (
          <SearchResults onOpen={openChat} onMore={loadMoreResults} />
        ) : (
          GROUP_ORDER.map((g) => {
            const collapsible = COLLAPSED_GROUPS.includes(g);
            const open = !collapsible || expanded.includes(g);
            const rows = grouped[g];
            const count = counts?.groups[g] ?? rows.length;
            if (g === "in_progress" && !count && !rows.length) return null;
            return (
              <section key={g} aria-label={GROUP_LABEL[g]} data-group={g}>
                <GroupHeader
                  group={g}
                  count={count}
                  collapsible={collapsible}
                  open={open}
                  onToggle={() => toggleGroup(g)}
                />
                {open && (
                  <>
                    {rows.map((row) => (
                      <ConversationRow key={row.id} row={row} now={state.now} selected={row.id === state.openId} onOpen={openChat} />
                    ))}
                    {!rows.length && (
                      <p className="px-4 py-3 text-sm text-muted-foreground">
                        {g === "waiting" ? "Nobody is waiting. 🎉" : "Nothing here."}
                      </p>
                    )}
                    {state.next[g] && (
                      <LoadMore onClick={() => loadGroup(g, true)} />
                    )}
                  </>
                )}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}

function GroupHeader({
  group,
  count,
  collapsible,
  open,
  onToggle,
}: {
  group: InboxGroup;
  count: number;
  collapsible: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  const Icon = GROUP_ICON[group];
  const tone =
    group === "waiting"
      ? "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"
      : "bg-muted/40 text-muted-foreground";
  const content = (
    <>
      <span className="flex items-center gap-2 font-semibold uppercase tracking-wide">
        <Icon className="h-3.5 w-3.5" />
        {GROUP_LABEL[group]} · {count}
      </span>
      {collapsible ? (
        <ChevronRight className={cn("h-4 w-4 transition-transform", open && "rotate-90")} />
      ) : (
        <span className="text-xs font-normal normal-case">
          {group === "waiting" ? "oldest first" : group === "bot" || group === "in_progress" ? "latest" : ""}
        </span>
      )}
    </>
  );
  const cls = cn("flex w-full items-center justify-between border-b border-[#E3E9E5] px-4 py-2.5 text-xs dark:border-border", tone);
  return collapsible ? (
    <button type="button" className={cls} onClick={onToggle} aria-expanded={open}>
      {content}
    </button>
  ) : (
    <div className={cls}>{content}</div>
  );
}

export function ConversationRow({
  row,
  now,
  selected,
  onOpen,
}: {
  row: InboxRow;
  now: number;
  selected: boolean;
  onOpen: (id: string) => void;
}) {
  const name = displayName(row);
  const known = Boolean(row.name || row.profile_name);
  const waiting = row.waiting_since && groupOf(row, now) === "waiting";
  const tone = waiting ? waitingTone(row.waiting_since!, now) : "normal";
  return (
    <button
      type="button"
      onClick={() => onOpen(row.id)}
      data-testid="conversation-row"
      data-id={row.id}
      aria-current={selected ? "true" : undefined}
      className={cn(
        "flex w-full gap-3 border-b border-l-4 border-b-[#E3E9E5] px-4 py-3 text-left transition-colors hover:bg-muted/40 dark:border-b-border",
        selected ? "border-l-[#1F7A4A] bg-[#1F7A4A]/[0.06] dark:border-l-primary dark:bg-primary/10" : "border-l-transparent"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
          known ? avatarColor(row.id) : "bg-muted text-muted-foreground"
        )}
        aria-hidden
      >
        {row.name ? initials(row.name) : row.profile_name ? initials(row.profile_name) : <UserRound className="h-5 w-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate font-semibold text-[#17261F] dark:text-foreground">
            {name}
            {row.name && row.profile_name && row.profile_name !== row.name && (
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">~{row.profile_name}</span>
            )}
          </p>
          {waiting ? (
            <span
              data-testid="waiting-time"
              data-tone={tone}
              className={cn(
                "flex shrink-0 items-center gap-1 text-xs font-semibold",
                tone === "red" ? "text-red-600 dark:text-red-400" : tone === "amber" ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
              )}
            >
              <Timer className="h-3 w-3" />
              {waitingLabel(row.waiting_since!, now)}
            </span>
          ) : (
            <span className="shrink-0 text-xs text-muted-foreground">{listTime(row.last_at, now)}</span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm text-muted-foreground">
            {row.preview_role === "bot" && row.preview_dir === "outbound" ? "Bot: " : ""}
            {(row.preview ?? "").replace(/[*_~]/g, "")}
          </p>
          {row.unread > 0 && (
            <span
              className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#25D366] px-1.5 text-[11px] font-semibold text-white"
              aria-label={`${row.unread} unread`}
            >
              {row.unread}
            </span>
          )}
        </div>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-[#25D366]" aria-hidden />
          WhatsApp
          <span aria-hidden>·</span>
          {row.assignee ? (
            <span className="flex items-center gap-1 truncate"><User className="h-3 w-3" />{row.assignee.name}</span>
          ) : (
            "Unassigned"
          )}
          {row.opted_out && <span className="ml-1 rounded bg-red-50 px-1 text-[10px] font-medium text-red-700 dark:bg-red-500/15 dark:text-red-300">STOP</span>}
        </p>
      </div>
    </button>
  );
}

function SearchResults({ onOpen, onMore }: { onOpen: (id: string) => void; onMore: () => void }) {
  const { state } = useInbox();
  if (state.listLoading && !state.results) return <ListSkeleton />;
  const rows = (state.results?.ids ?? []).map((id) => state.rows[id]).filter(Boolean);
  return (
    <section aria-label="Search results">
      <div className="border-b border-[#E3E9E5] bg-muted/40 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground dark:border-border">
        Results · {rows.length}
      </div>
      {rows.map((row) => (
        <ConversationRow key={row.id} row={row} now={state.now} selected={row.id === state.openId} onOpen={onOpen} />
      ))}
      {!rows.length && !state.listLoading && <p className="px-4 py-6 text-center text-sm text-muted-foreground">No conversations match.</p>}
      {state.results?.next && <LoadMore onClick={onMore} />}
    </section>
  );
}

function LoadMore({ onClick }: { onClick: () => Promise<void> | void }) {
  const [loading, setLoading] = useState(false);
  return (
    <button
      type="button"
      className="flex w-full items-center justify-center gap-2 py-3 text-sm font-medium text-[#1F7A4A] hover:bg-muted/40 dark:text-primary"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await onClick();
        } catch (err) {
          toast.error("Couldn't load more", errorMessage(err));
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      Load more
    </button>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-1 p-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-3 p-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

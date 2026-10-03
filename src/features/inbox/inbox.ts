import { http } from "@/src/services/http";
import { apiClient } from "@/src/services/api-client";
import { API_ENDPOINTS } from "@/src/config/endpoints";
import type { RawVisitSummary } from "@/src/features/patients/patient";

// ---------- Types ----------

export type InboxScope = "mine" | "team" | "all";
export type InboxGroup = "waiting" | "in_progress" | "bot" | "snoozed" | "done";

export interface Assignee {
  user_id: string;
  name: string | null;
}

/** One conversation row - also the base of the open chat's header. */
export interface InboxRow {
  id: string; // E.164 phone, e.g. "+919971240385"
  name: string | null; // linked patient record's name
  profile_name: string | null; // WhatsApp profile name
  patient_id: string | null;
  preview: string | null;
  preview_dir: "inbound" | "outbound" | null;
  preview_role: string | null;
  last_at: number | null;
  waiting_since: number | null;
  assignee: Assignee | null;
  mode: "bot" | "human";
  status: "open" | "done";
  snooze_until: number | null;
  done_at: number | null;
  tags: string[];
  opted_out: boolean;
  blocked: boolean;
  unread: number;
  group: InboxGroup;
}

export interface ReplyWindow {
  last_inbound_at: number | null;
  expires_at: number | null;
  open: boolean;
}

export interface InboxHeader extends InboxRow {
  window: ReplyWindow;
}

export interface InboxCounts {
  scopes: Record<InboxScope, number>;
  groups: Record<InboxGroup, number>;
}

export interface InboxUser {
  id: string;
  name: string;
  role: string;
}

export interface InboxMe {
  id: string;
  name: string;
  role: string;
  can_reply: boolean;
  can_manage: boolean;
}

export interface GroupPage {
  items: InboxRow[];
  next: string | null;
}

export interface InboxListData {
  now: number;
  scope: InboxScope;
  counts: InboxCounts;
  groups?: Partial<Record<InboxGroup, GroupPage>>;
  results?: GroupPage;
  users?: InboxUser[];
  me?: InboxMe;
  ai_enabled?: boolean;
}

export interface InboxMedia {
  mime: string | null;
  size: number | null;
  filename: string | null;
  caption: string | null;
  voice: boolean;
  duration: number | null;
  peaks: number[] | null;
  status: "pending" | "stored" | "failed" | "missing";
  transcode: "ok" | "failed" | "unavailable" | null;
  url: string | null;
  download_url: string | null;
}

export interface InboxMessage {
  id: string;
  client_id?: string | null;
  dir: "inbound" | "outbound" | "internal" | "system";
  type: string;
  at: number;
  status: "sending" | "sent" | "delivered" | "read" | "failed" | "internal" | "system" | string;
  error?: string | null;
  sender: { role: string | null; name: string | null; id: string | null };
  note: boolean;
  text: string | null;
  template?: { name: string | null; header: string | null; body: string | null; footer: string | null; buttons: string[] };
  media?: InboxMedia;
  buttons?: string[];
  list?: unknown;
  list_button?: string | null;
  location?: { lat: number; lng: number; name: string | null };
  event?: string;
  mentions?: { user_id: string; name: string }[];
  /** Client-only: optimistic bubble waiting for the server. */
  local?: boolean;
}

export interface PatientReport {
  id: string;
  name: string;
  completed_at: number | null;
  filename: string;
}

export interface ActivityEntry {
  at: number;
  kind: string;
  text: string;
}

export interface PatientContext {
  phone: string;
  profile_name: string | null;
  patient: {
    id: string;
    name: string;
    age: number | null;
    gender: string | null;
    uhid: string;
    phone: string;
    language: string;
    visit_summary: RawVisitSummary | null;
    visits: { completed: number; missed: number };
    last_doctor_id: string | null;
  } | null;
  reports?: PatientReport[];
  activity?: ActivityEntry[];
}

export interface OpenConversation {
  now: number;
  conversation: InboxHeader;
  messages: InboxMessage[];
  has_more: boolean;
  before: number | null;
  context: PatientContext;
  presence: { id: string; name: string }[];
  ai: { summary: string | null; suggested_reply: string | null } | null;
}

export interface SyncData {
  now: number;
  changed: InboxRow[];
  messages: InboxMessage[];
  reset: boolean;
  conversation?: InboxHeader;
  presence?: { id: string; name: string }[];
  counts: InboxCounts;
  bell: number;
}

export interface SavedReply {
  id: string;
  key: string | null;
  title: string;
  text: string;
  icon: string | null;
  pinned: boolean;
  needs_setup: boolean;
}

export type InboxAction =
  | { type: "assign"; user_id: string | null }
  | { type: "snooze"; until: number }
  | { type: "unsnooze" | "done" | "reopen" | "take_over" | "hand_back" | "mark_read" | "mark_unread" }
  | { type: "block" | "unblock" | "unlink_patient" }
  | { type: "set_tags"; tags: string[] }
  | { type: "link_patient"; patient_id: string }
  | { type: "book"; doctor_id: string; slot_id: string }
  | { type: "send_report"; lab_order_id: string; client_id?: string };

export interface ActionResult {
  conversation: InboxHeader;
  context?: PatientContext;
  message?: InboxMessage;
  appointment?: { id: string; datetime: string; reference_code: string | null };
}

// ---------- Service ----------

export const inboxService = {
  list: (params: { scope: InboxScope; group?: InboxGroup; q?: string; cursor?: string; include_users?: boolean }) =>
    http.get<InboxListData>(API_ENDPOINTS.inbox.conversations, { params }),

  open: (id: string) => http.get<OpenConversation>(API_ENDPOINTS.inbox.conversation(id)),

  older: (id: string, before: number) =>
    http.get<{ messages: InboxMessage[]; has_more: boolean; before: number | null }>(API_ENDPOINTS.inbox.messages(id), {
      params: { before },
    }),

  send: (
    id: string,
    input: { client_id: string; kind: "text" | "template" | "media"; text?: string; template_name?: string; language?: string; variables?: string[]; file?: File }
  ) => {
    const form = new FormData();
    form.append("client_id", input.client_id);
    form.append("kind", input.kind);
    if (input.text) form.append("text", input.text);
    if (input.template_name) form.append("template_name", input.template_name);
    if (input.language) form.append("language", input.language);
    if (input.variables) form.append("variables", JSON.stringify(input.variables));
    if (input.file) form.append("file", input.file);
    return http.post<{ message: InboxMessage; duplicate?: boolean }>(API_ENDPOINTS.inbox.messages(id), form);
  },

  note: (id: string, text: string, mentions: string[], client_id: string) =>
    http.post<{ message: InboxMessage }>(API_ENDPOINTS.inbox.notes(id), { text, mentions, client_id }),

  action: (id: string, action: InboxAction) => http.post<ActionResult>(API_ENDPOINTS.inbox.actions(id), action),

  sync: (params: { since: number; scope: InboxScope; open?: string }) =>
    http.get<SyncData>(API_ENDPOINTS.inbox.sync, { params, silent: true }),

  savedReplies: () => http.get<{ items: SavedReply[] }>(API_ENDPOINTS.inbox.savedReplies),
  createSavedReply: (title: string, text: string) =>
    http.post<{ item: SavedReply }>(API_ENDPOINTS.inbox.savedReplies, { title, text }),
  updateSavedReply: (id: string, changes: { title?: string; text?: string }) =>
    http.patch<{ item: SavedReply }>(API_ENDPOINTS.inbox.savedReply(id), changes),
  deleteSavedReply: (id: string) => http.delete<null>(API_ENDPOINTS.inbox.savedReply(id)),

  /** Plain-text transcript (existing endpoint; template messages show their real text). */
  exportChat: async (id: string) =>
    (await apiClient.get<Blob>(API_ENDPOINTS.whatsapp.export(id), { responseType: "blob" })).data,
};

// ---------- Groups (mirrors common/inbox_state.py) ----------

export const GROUP_ORDER: InboxGroup[] = ["waiting", "in_progress", "bot", "snoozed", "done"];
export const COLLAPSED_GROUPS: InboxGroup[] = ["snoozed", "done"];

export const GROUP_LABEL: Record<InboxGroup, string> = {
  waiting: "Waiting for reply",
  in_progress: "In progress",
  bot: "Bot is handling",
  snoozed: "Snoozed",
  done: "Done today",
};

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function istDayStart(ms: number): number {
  return Math.floor((ms + IST_OFFSET_MS) / DAY_MS) * DAY_MS - IST_OFFSET_MS;
}

/** Which list group a row belongs to at `now` - snoozes end on their own. */
export function groupOf(row: InboxRow, now: number): InboxGroup {
  if ((row.snooze_until ?? 0) > now) return "snoozed";
  if (row.status === "done") return (row.done_at ?? 0) >= istDayStart(now) ? "done" : "bot";
  if (row.mode === "human") return row.waiting_since ? "waiting" : "in_progress";
  return "bot";
}

export function inScope(row: InboxRow, scope: InboxScope, meId: string | undefined): boolean {
  if (scope === "mine") return row.assignee?.user_id === meId;
  if (scope === "team") return row.mode === "human";
  return true;
}

export function sortRows(group: InboxGroup, rows: InboxRow[]): InboxRow[] {
  const by = (pick: (r: InboxRow) => number, asc: boolean) =>
    [...rows].sort((a, b) => (asc ? pick(a) - pick(b) : pick(b) - pick(a)) || (a.id < b.id ? -1 : 1));
  if (group === "waiting") return by((r) => r.waiting_since ?? 0, true);
  if (group === "snoozed") return by((r) => r.snooze_until ?? 0, true);
  if (group === "done") return by((r) => r.done_at ?? 0, false);
  return by((r) => r.last_at ?? 0, false);
}

// ---------- Display helpers ----------

export function displayName(row: Pick<InboxRow, "name" | "profile_name" | "id">): string {
  return row.name || row.profile_name || formatPhone(row.id);
}

/** "+919971240385" -> "+91 99712 40385". */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  return phone;
}

/** "8h" / "45m" / "2d" for the waiting timer. */
export function waitingLabel(since: number, now: number): string {
  const minutes = Math.max(0, Math.floor((now - since) / 60000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

/** Amber after 1h, red after 4h. */
export function waitingTone(since: number, now: number): "normal" | "amber" | "red" {
  const hours = (now - since) / 3_600_000;
  return hours >= 4 ? "red" : hours >= 1 ? "amber" : "normal";
}

const timeFmt = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });
const dayMonthFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
const fullDayFmt = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

export function clockTime(ms: number): string {
  return timeFmt.format(ms);
}

/** List timestamp: "01:27" today, "Yesterday", else "2 Oct". */
export function listTime(ms: number | null, now: number): string {
  if (!ms) return "";
  const today = istDayStart(now);
  if (ms >= today) return clockTime(ms);
  if (ms >= today - DAY_MS) return "Yesterday";
  return dayMonthFmt.format(ms);
}

/** Date divider: "Today" / "Yesterday" / "Fri, 2 Oct 2026". */
export function dayLabel(ms: number, now: number): string {
  const today = istDayStart(now);
  const day = istDayStart(ms);
  if (day === today) return "Today";
  if (day === today - DAY_MS) return "Yesterday";
  return fullDayFmt.format(ms);
}

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function formatDuration(seconds: number | null | undefined): string {
  const s = Math.max(0, Math.round(seconds ?? 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** "15h left" / "40m left" / null when closed. */
export function windowLeft(window: ReplyWindow, now: number): { label: string; urgent: boolean } | null {
  if (!window.expires_at || window.expires_at <= now) return null;
  const minutes = Math.floor((window.expires_at - now) / 60000);
  const label = minutes >= 60 ? `${Math.floor(minutes / 60)}h left` : `${minutes}m left`;
  return { label, urgent: minutes < 180 };
}

/** Idempotency key for one send (the same key on Retry). */
export function newClientId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function errorCode(err: unknown): string | undefined {
  const data = (err as { data?: { code?: string } } | undefined)?.data;
  return data?.code;
}

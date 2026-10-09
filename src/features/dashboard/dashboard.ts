import { http } from "@/src/services/http";
import { API_ENDPOINTS } from "@/src/config/endpoints";
import { mapAppointment } from "@/src/features/appointments/appointment";
import type { RawApiAppointment } from "@/src/features/appointments/appointment";

// ---------- Types ----------
// Metric definitions live with the API (abdhind-medicare-be routes/dashboard.py).

/** A block the backend couldn't compute — only that card shows an error. */
export interface BlockError {
  error: string;
}

export type Block<T> = T | BlockError;

export function isBlockError<T>(block: Block<T> | undefined): block is BlockError {
  return Boolean(block && typeof block === "object" && "error" in block);
}

export type CompareMode = "last_year" | "previous_period";

export interface ChartBucket {
  /** "YYYY-MM-DD" (day granularity) or "YYYY-MM" (month). */
  key: string;
  visits: number;
  /** Same bucket a year earlier (full month for month buckets). */
  last_year: number;
  /** The running month — drawn hatched, labelled "so far". */
  partial: boolean;
}

export interface VisitsChartData {
  granularity: "day" | "month";
  buckets: ChartBucket[];
  /** Least-squares line over the full months (null under 3 full months). */
  trend: { per_month: number; start: { key: string; value: number }; end: { key: string; value: number } } | null;
  /** Running month at the current pace. */
  projection: { key: string; value: number } | null;
}

export type OutcomeKey = "completed" | "confirmed" | "in_clinic" | "pending" | "no_show" | "cancelled";
export type SourceKey = "whatsapp" | "phone" | "web" | "follow_up" | "other";

export interface AppointmentsBlock {
  patients_visited: number;
  visits: number;
  booked: number;
  /** % — null when nothing was completed or missed yet. */
  no_show_rate: number | null;
  compare: { patients_visited: number; visits: number; booked: number; no_show_rate: number | null } | null;
  outcomes: Record<OutcomeKey, number>;
  sources: Record<SourceKey, number>;
  busiest_days: { weekday: string; visits: number }[];
  chart: VisitsChartData;
}

export interface EnquiriesBlock {
  total: number;
  contacted: number;
  booked: number;
  converted_pct: number | null;
  compare_converted_pct: number | null;
  /** Hidden (null) until there are enough data points. */
  avg_callback_ms: number | null;
}

export interface WhatsAppBlock {
  chats: number;
  handled_by_bot: number;
  avg_first_reply_ms: number | null;
  bookings: number | null;
  reminders_sent: number;
}

export interface DashboardSummary {
  range: { from: string; to: string; compare: CompareMode | null; compare_from: string | null; compare_to: string | null };
  scope: { analytics: boolean; doctor_locked: boolean; limited: boolean };
  updated_at: number;
  new_patients: Block<{ value: number; compare: number | null }>;
  appointments: Block<AppointmentsBlock>;
  /** Absent for roles without enquiry:view. */
  enquiries?: Block<EnquiriesBlock>;
  /** Absent for roles without whatsapp_inbox:view. */
  whatsapp?: Block<WhatsAppBlock>;
}

/** Only the items this role may act on are present. */
export interface DashboardNow {
  chats_waiting?: number;
  approvals_pending?: number;
  enquiries_new?: number;
  in_clinic?: number;
  updated_at: number;
}

export interface DashboardDaily {
  month: string;
  days: { key: string; visits: number; last_year: number }[];
}

export interface SummaryParams {
  from: string;
  to: string;
  doctor_id?: string;
  compare?: CompareMode;
}

// ---------- Ranges (all IST) ----------

export type RangePreset = "today" | "yesterday" | "this_week" | "this_month" | "this_year" | "custom";

export const RANGE_LABELS: Record<RangePreset, string> = {
  today: "Today",
  yesterday: "Yesterday",
  this_week: "This week",
  this_month: "This month",
  this_year: "This year",
  custom: "Custom",
};

/** Reception's ranges — the backend clamps anything longer anyway. */
export const LIMITED_PRESETS: RangePreset[] = ["today", "yesterday", "this_week"];
export const ALL_PRESETS: RangePreset[] = ["today", "yesterday", "this_week", "this_month", "this_year", "custom"];

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function fromYmd(value: string): Date {
  return new Date(`${value}T00:00:00Z`);
}

function addDays(value: string, days: number): string {
  const d = fromYmd(value);
  d.setUTCDate(d.getUTCDate() + days);
  return ymd(d);
}

/** {from, to} for a preset, given today's IST date ("YYYY-MM-DD"). Week = Mon–Sun. */
export function presetRange(preset: Exclude<RangePreset, "custom">, today: string): { from: string; to: string } {
  switch (preset) {
    case "today":
      return { from: today, to: today };
    case "yesterday": {
      const y = addDays(today, -1);
      return { from: y, to: y };
    }
    case "this_week": {
      const weekday = (fromYmd(today).getUTCDay() + 6) % 7; // Mon = 0
      const monday = addDays(today, -weekday);
      return { from: monday, to: addDays(monday, 6) };
    }
    case "this_month":
      return { from: `${today.slice(0, 7)}-01`, to: today };
    case "this_year":
      return { from: `${today.slice(0, 4)}-01-01`, to: today };
  }
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** "1 Jan – 3 Oct 2026" / "3 Oct 2026". */
export function formatRange(from: string, to: string): string {
  const f = fromYmd(from);
  const t = fromYmd(to);
  const day = (d: Date) => `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
  if (from === to) return `${day(t)} ${t.getUTCFullYear()}`;
  const sameYear = f.getUTCFullYear() === t.getUTCFullYear();
  return `${day(f)}${sameYear ? "" : ` ${f.getUTCFullYear()}`} – ${day(t)} ${t.getUTCFullYear()}`;
}

/** Chart axis label: "Jan" for "2026-01", "Mon 5" for a day. */
export function bucketLabel(key: string): string {
  if (key.length === 7) return MONTHS[Number(key.slice(5, 7)) - 1];
  const d = fromYmd(key);
  return `${WEEKDAYS_SHORT[d.getUTCDay()]} ${d.getUTCDate()}`;
}

/** "October" for "2026-10". */
export function monthName(key: string): string {
  return new Date(`${key}-01T00:00:00Z`).toLocaleString("en-GB", { month: "long", timeZone: "UTC" });
}

/** "vs 2025" / "vs prev. period". */
export function compareLabel(range: DashboardSummary["range"]): string | null {
  if (!range.compare || !range.compare_from) return null;
  return range.compare === "last_year" ? `vs ${range.compare_from.slice(0, 4)}` : "vs prev. period";
}

/** % change, rounded; null when there's nothing to compare against. */
export function percentChange(current: number, previous: number | null | undefined): number | null {
  if (previous === null || previous === undefined || previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export function formatDuration(ms: number): string {
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return hours < 24 ? `${Math.round(hours * 10) / 10}h` : `${Math.round((hours / 24) * 10) / 10} days`;
}

export const formatCount = (n: number) => n.toLocaleString("en-IN");

// ---------- Service ----------

/** Drop undefined keys so axios doesn't send them as literal "undefined". */
function clean<T extends object>(params: T) {
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""));
}

export const dashboardService = {
  summary: (params: SummaryParams, refresh = false) =>
    http.get<DashboardSummary>(API_ENDPOINTS.dashboard.summary, {
      params: clean({ ...params, refresh: refresh || undefined }),
    }),

  now: () => http.get<DashboardNow>(API_ENDPOINTS.dashboard.now),

  daily: (month: string, doctorId?: string) =>
    http.get<DashboardDaily>(API_ENDPOINTS.dashboard.daily, { params: clean({ month, doctor_id: doctorId }) }),
};

/** Root-level convenience endpoints (not under /api/v1) used by appointment views. */
export const doctorQuickService = {
  pending: async () => {
    const res = await http.get<{ count: number; appointments: RawApiAppointment[] }>(
      API_ENDPOINTS.doctorQuick.pending
    );
    return { ...res, data: { ...res.data, appointments: res.data.appointments.map(mapAppointment) } };
  },

  approve: async (appointmentId: string) => {
    const res = await http.post<{ appointment: RawApiAppointment }>(
      API_ENDPOINTS.doctorQuick.approve,
      { appointment_id: appointmentId }
    );
    return { ...res, data: { appointment: mapAppointment(res.data.appointment) } };
  },

  exitHumanMode: (phoneNumber: string) =>
    http.post<null>(API_ENDPOINTS.doctorQuick.exitHumanMode, { phone_number: phoneNumber }),
};

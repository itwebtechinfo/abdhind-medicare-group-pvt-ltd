import { z } from "zod";
import { http } from "@/src/services/http";
import { API_ENDPOINTS } from "@/src/config/endpoints";
import { INDIAN_MOBILE_REGEX } from "@/src/features/auth/login-schema";
import type { AppointmentStatus } from "@/src/features/patients/patient";

export type { AppointmentStatus };

// ---------- Types ----------

export interface AppointmentReminders {
  "24h_sent": boolean;
  "2h_sent": boolean;
  "30m_sent": boolean;
}

export interface RawJoinedPerson {
  full_name: string;
  phone?: string;
  /** Raw epoch-ms — sub-documents pulled in via a join keep the unformatted timestamp. */
  created_at?: number;
  /** Patient-only demographics — absent on the joined `doctor` object. */
  age?: number | null;
  gender?: string | null;
  address?: string | null;
  /** Patient-only — hospital-wide patient id, e.g. "UHID-000123". */
  uhid?: string | null;
  preferred_language?: string | null;
  /** Doctor-only. */
  specialization?: string | null;
}

export interface RawBookedBy {
  _id: string;
  full_name: string;
  phone_number: string;
}

export interface BookedBy {
  id: string;
  full_name: string;
  phone_number: string;
}

export interface RawApiAppointment {
  _id: string;
  patient_id: string;
  doctor_id: string;
  department_id: string;
  slot_id: string;
  appointment_datetime: string;
  status: AppointmentStatus;
  source: string;
  reminders: AppointmentReminders;
  created_at: string;
  completed_at?: number | null;
  follow_up_of?: string | null;
  follow_up_appointment_id?: string | null;
  no_show_flagged?: boolean;
  no_show_flagged_at?: number | null;
  feedback_requested?: boolean;
  patient?: RawJoinedPerson;
  doctor?: RawJoinedPerson;
  booked_by_user_id?: string | null;
  booked_by?: RawBookedBy | null;
  /** Short human-friendly booking id, e.g. "MRD-2026-00001". Always set on
   * insert (see generate_appointment_reference_code in routes/whatsapp.py),
   * so this is only optional here for older/edge-case docs missing it. */
  reference_code?: string | null;
  /** Only ever populated when the patient cancels via the WhatsApp bot's
   * reason prompt today — staff-initiated cancels may not set this. */
  cancellation_reason?: string | null;
  /** Reception check-in, naive IST "YYYY-MM-DDTHH:MM" (same convention as
   * appointment_datetime). Set => "In clinic" until completed. */
  arrived_at?: string | null;
  /** Multi-sitting treatment fields (staff-only; see TreatmentChain). */
  done_type?: DoneType | null;
  treatment_completed_at?: number | null;
  sitting_no?: number | null;
  chain_root_id?: string | null;
  auto_linked?: boolean;
  chain_conflict?: ChainConflict | null;
  chain?: TreatmentChain | null;
  can_book_next?: boolean;
  can_join_chain?: boolean;
}

/** "sitting" = more sittings to come; "final" = treatment / single visit complete. */
export type DoneType = "sitting" | "final";

/** A booking that couldn't join its treatment because the next sitting is already booked. */
export interface ChainConflict {
  appointment_id: string;
  appointment_datetime: string;
  reference_code: string | null;
  sitting_no: number | null;
}

/** A multi-sitting treatment = a chain of appointments (backend common/treatment_chain.py). */
export interface TreatmentChain {
  root_id: string;
  /** complete · next_booked · needs_next (next sitting not booked) · stale (no visit in 90 days) */
  state: "complete" | "next_booked" | "needs_next" | "stale" | "ongoing";
  planned_sittings: number | null;
  sittings_done: number;
  last_sitting_id: string | null;
  last_sitting_no: number | null;
  completed_at: number | null;
  next: { id: string; appointment_datetime: string; status: AppointmentStatus; sitting_no: number | null; reference_code: string | null } | null;
  timeline: {
    id: string;
    sitting_no: number | null;
    appointment_datetime: string;
    status: AppointmentStatus;
    done_type: DoneType | null;
    no_show: boolean;
    reference_code: string | null;
  }[];
}

export interface ApiAppointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  department_id: string;
  slot_id: string;
  appointment_datetime: string;
  status: AppointmentStatus;
  source: string;
  reminders: AppointmentReminders;
  created_at: string;
  completed_at: number | null;
  follow_up_of: string | null;
  follow_up_appointment_id: string | null;
  no_show_flagged: boolean;
  no_show_flagged_at: number | null;
  feedback_requested: boolean;
  patient?: RawJoinedPerson;
  doctor?: RawJoinedPerson;
  booked_by_user_id: string | null;
  booked_by: BookedBy | null;
  reference_code: string | null;
  cancellation_reason: string | null;
  arrived_at: string | null;
  done_type: DoneType | null;
  treatment_completed_at: number | null;
  sitting_no: number | null;
  chain_root_id: string | null;
  auto_linked: boolean;
  chain_conflict: ChainConflict | null;
  /** undefined = this response didn't include it (keep what's on screen). */
  chain?: TreatmentChain | null;
  can_book_next?: boolean;
  can_join_chain?: boolean;
}

/** Appointments-page tabs — filtered server-side by GET /appointments?tab=. */
export type AppointmentTab = "today" | "needs_approval" | "upcoming" | "past" | "cancelled";

export type AppointmentTabCounts = Record<AppointmentTab, number> & {
  /** Treatments whose next sitting isn't booked (staff only). */
  needs_next_sitting?: number;
};

export interface AppointmentListFilters {
  status?: AppointmentStatus;
  date?: string;
  doctor_id?: string;
  no_show?: boolean;
  /** Narrows to one patient's appointments — role scoping still applies server-side. */
  patient_id?: string;
  tab?: AppointmentTab;
  /** Name, booking ID, or (for phone-shaped input) phone number. */
  search?: string;
  /** With `limit`, the response `count` is the total match count, not the page size. */
  limit?: number;
  offset?: number;
  /** Adds per-tab `counts` (same base filters, ignoring tab/search). */
  include_counts?: boolean;
  /** Staff: only treatments whose next sitting isn't booked (overrides `tab`). */
  needs_next_sitting?: boolean;
  /** Patient-role only — staff ignore this and always see everything. */
  scope?: "mine" | "booked_by_me" | "all";
}

/** PATCH /appointments/{id} — reschedule (slot_id) or cancel (status), never both.
 * `reason` is optional free text, only meaningful alongside status: "CANCELLED". */
export type UpdateAppointmentPayload = { slot_id: string } | { status: "CANCELLED"; reason?: string };

export interface CreateAppointmentPayload {
  patient_phone: string;
  patient_name: string;
  patient_age?: number | null;
  patient_gender?: string | null;
  patient_address?: string | null;
  doctor_id: string;
  slot_id: string;
}

/** Who asked for a staff cancel — decides the patient's WhatsApp message. */
export type CancelledBy = "clinic" | "patient";

/** What happened to the patient's WhatsApp message after a staff cancel. */
export interface CancelNotification {
  status: "sent" | "window_closed" | "template_not_approved" | "opted_out" | "blocked" | "failed" | null;
  channel: "text" | "template" | null;
}

/** Toast line for anything other than a delivered message. */
export function cancelNotificationNote(n: CancelNotification | undefined): string | null {
  switch (n?.status) {
    case "sent":
    case undefined:
    case null:
      return null;
    case "window_closed":
      return "Patient not notified (outside 24h window)";
    case "template_not_approved":
      return "Patient not notified — WhatsApp template not approved yet";
    case "opted_out":
      return "Patient not notified — they opted out of WhatsApp messages";
    case "blocked":
      return "Patient not notified — number is blocked";
    default:
      return "Patient not notified — WhatsApp send failed";
  }
}

export interface FollowUpPayload {
  slot_id: string;
  /** Optional estimate for the whole treatment ("Sitting 3 of 5"), staff-only. */
  planned_sittings?: number | null;
}

export interface CompletePayload {
  done_type: DoneType;
  /** Only when a later sitting is booked and the treatment is being completed. */
  next_sitting?: "cancel" | "keep";
}

export type TreatmentActionPayload =
  | { action: "complete"; next_sitting?: "cancel" | "keep" }
  | { action: "reopen" | "unlink" | "join" }
  | { action: "set_planned"; planned_sittings: number };

/** "Sitting 3 of 5" / "Sitting 6 (planned 5)" / "Sitting 3" — null outside a treatment. */
export function sittingLabel(a: Pick<ApiAppointment, "sitting_no" | "chain" | "chain_root_id">): string | null {
  if (!a.sitting_no || !a.chain_root_id) return null;
  const planned = a.chain?.planned_sittings;
  if (!planned) return `Sitting ${a.sitting_no}`;
  return a.sitting_no > planned ? `Sitting ${a.sitting_no} (planned ${planned})` : `Sitting ${a.sitting_no} of ${planned}`;
}

/** The one rule for "Book next" (computed by the backend; safe fallback for old responses). */
export function canBookNext(a: ApiAppointment): boolean {
  return a.can_book_next ?? (a.status === "COMPLETED" && !a.follow_up_appointment_id);
}

/** Tabs that offer selection mode / bulk cancel (rows there are still cancellable). */
export const BULK_CANCEL_TABS: AppointmentTab[] = ["today", "needs_approval", "upcoming"];

/** Same filter the board list uses — "Select all N matching" sends this and the server resolves it. */
export interface BulkCancelFilter {
  tab: AppointmentTab;
  search?: string;
  doctor_id?: string;
  date?: string;
}

export type BulkCancelPayload = {
  reason: string;
  /** One per confirm dialog — a retried request returns the same job instead of cancelling twice. */
  idempotency_key: string;
} & ({ appointment_ids: string[] } | { select_all_matching: BulkCancelFilter });

export interface BulkCancelPreview {
  template_name: string;
  /** false until Meta approves the template — cancelling still works, no WhatsApp is sent. */
  send_enabled: boolean;
  approved_languages: string[];
  sample_name: string;
  /** Template body per bot language ("hi" / "en") rendered with sample_name. */
  previews: Record<string, string | null>;
}

export type BulkCancelNotificationStatus = "pending" | "sent" | "failed" | "opted_out" | "blocked" | "template_not_approved";

export interface BulkCancelJob {
  _id: string;
  status: "cancelling" | "sending" | "completed";
  reason: string;
  requested_count: number;
  cancelled_count: number;
  send_enabled: boolean;
  template_name: string;
  skipped: { appointment_id: string; reason: string }[];
  patients: {
    patient_id: string;
    patient_name: string | null;
    phone: string | null;
    appointment_ids: string[];
    notification_status: BulkCancelNotificationStatus;
  }[];
  counts: Record<BulkCancelNotificationStatus, number>;
}

export interface RawAuditLogEntry {
  from_status: AppointmentStatus | null;
  to_status: AppointmentStatus;
  /** Set only when this entry's action also changed the appointment's time. */
  old_datetime?: string | null;
  new_datetime?: string | null;
  changed_by_role: string;
  changed_by_user_id: string | null;
  changed_by_name: string | null;
  created_at: string;
  /** Non-status milestone, e.g. "ARRIVED" — from/to_status are then both the current status. */
  event?: string | null;
  /** On a "Mark done" entry: which button was used. */
  done_type?: DoneType | null;
  /** WhatsApp delivery state of the notification sent for this event, if any. */
  notification_status?: "sent" | "delivered" | "read" | "failed" | null;
}

export interface ConfirmAppointmentPayload {
  /** Doctor's preferred time, if different from what the patient picked at booking. */
  slot_id?: string;
}

// ---------- Schema ----------

export const bookAppointmentSchema = z.object({
  patient_phone: z
    .string()
    .trim()
    .regex(INDIAN_MOBILE_REGEX, "Enter a valid 10-digit mobile number"),
  patient_name: z.string().trim().min(1, "Patient name is required"),
  patient_age: z
    .string()
    .trim()
    .refine((v) => v !== "" && /^\d+$/.test(v) && Number(v) <= 150, {
      message: "Age is required",
    }),
  patient_gender: z
    .enum(["", "Male", "Female", "Other"])
    .refine((v): boolean => v !== "", { message: "Gender is required" }),
  patient_address: z.string().trim(),
  doctor_id: z.string().trim().min(1, "Select a doctor"),
  slot_id: z.string().trim().min(1, "Select a slot"),
});

export type BookAppointmentFormValues = z.infer<typeof bookAppointmentSchema>;

export const EMPTY_BOOK_APPOINTMENT_VALUES: BookAppointmentFormValues = {
  patient_phone: "",
  patient_name: "",
  patient_age: "",
  patient_gender: "",
  patient_address: "",
  doctor_id: "",
  slot_id: "",
};

// ---------- Service ----------

export function mapAppointment(raw: RawApiAppointment): ApiAppointment {
  return {
    id: raw._id,
    patient_id: raw.patient_id,
    doctor_id: raw.doctor_id,
    department_id: raw.department_id,
    slot_id: raw.slot_id,
    appointment_datetime: raw.appointment_datetime,
    status: raw.status,
    source: raw.source,
    reminders: raw.reminders,
    created_at: raw.created_at,
    completed_at: raw.completed_at ?? null,
    follow_up_of: raw.follow_up_of ?? null,
    follow_up_appointment_id: raw.follow_up_appointment_id ?? null,
    no_show_flagged: raw.no_show_flagged ?? false,
    no_show_flagged_at: raw.no_show_flagged_at ?? null,
    feedback_requested: raw.feedback_requested ?? false,
    patient: raw.patient,
    doctor: raw.doctor,
    booked_by_user_id: raw.booked_by_user_id ?? null,
    booked_by: raw.booked_by
      ? { id: raw.booked_by._id, full_name: raw.booked_by.full_name, phone_number: raw.booked_by.phone_number }
      : null,
    reference_code: raw.reference_code ?? null,
    cancellation_reason: raw.cancellation_reason ?? null,
    arrived_at: raw.arrived_at ?? null,
    done_type: raw.done_type ?? null,
    treatment_completed_at: raw.treatment_completed_at ?? null,
    sitting_no: raw.sitting_no ?? null,
    chain_root_id: raw.chain_root_id ?? null,
    auto_linked: Boolean(raw.auto_linked),
    chain_conflict: raw.chain_conflict ?? null,
    ...(raw.chain !== undefined ? { chain: raw.chain } : {}),
    ...(raw.can_book_next !== undefined ? { can_book_next: raw.can_book_next } : {}),
    ...(raw.can_join_chain !== undefined ? { can_join_chain: raw.can_join_chain } : {}),
  };
}

/** Drop undefined keys so axios doesn't serialize them as literal "undefined" query params. */
function cleanParams(filters: AppointmentListFilters) {
  return Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined));
}

export const appointmentService = {
  list: async (filters: AppointmentListFilters = {}) => {
    const res = await http.get<{ count: number; appointments: RawApiAppointment[]; counts?: AppointmentTabCounts }>(
      API_ENDPOINTS.appointments.list,
      { params: cleanParams(filters) }
    );
    return { ...res, data: { ...res.data, appointments: res.data.appointments.map(mapAppointment) } };
  },

  create: async (payload: CreateAppointmentPayload) => {
    const res = await http.post<{ appointment: RawApiAppointment }>(
      API_ENDPOINTS.appointments.list,
      payload
    );
    return { ...res, data: { appointment: mapAppointment(res.data.appointment) } };
  },

  /** POST /api/v1/doctor/approve — confirm a PENDING appointment, optionally at a doctor-preferred
   * slot_id (status + time in one call). Same endpoint the doctor dashboard's quick-approve uses. */
  confirm: async (id: string, payload: ConfirmAppointmentPayload = {}) => {
    const res = await http.post<{ appointment: RawApiAppointment }>(
      API_ENDPOINTS.doctorQuick.approve,
      { appointment_id: id, ...payload }
    );
    return { ...res, data: { appointment: mapAppointment(res.data.appointment) } };
  },

  /** Mark done — "Sitting done" (more sittings) or "Treatment complete". A 409 with
   * data.code "next_sitting_booked" means: ask cancel/keep, then resend with next_sitting. */
  complete: async (id: string, payload: CompletePayload = { done_type: "final" }) => {
    const res = await http.post<{ appointment: RawApiAppointment }>(
      API_ENDPOINTS.appointments.complete(id),
      payload
    );
    return { ...res, data: { appointment: mapAppointment(res.data.appointment) } };
  },

  /** Treatment fix-ups from the drawer (complete / reopen / unlink / join / set_planned). */
  treatment: async (id: string, payload: TreatmentActionPayload) => {
    const res = await http.post<{ appointment: RawApiAppointment }>(API_ENDPOINTS.appointments.treatment(id), payload);
    return { ...res, data: { appointment: mapAppointment(res.data.appointment) } };
  },

  /** Reception check-in ("In clinic") — APPROVED/PATIENT_CONFIRMED, today only. */
  arrive: async (id: string) => {
    const res = await http.post<{ appointment: RawApiAppointment }>(
      API_ENDPOINTS.appointments.arrive(id)
    );
    return { ...res, data: { appointment: mapAppointment(res.data.appointment) } };
  },

  /** `reason` is optional free text explaining the cancellation. `cancelledBy`
   * picks the patient's message: "clinic" (default) -> the clinic-cancel
   * template; "patient" -> a short confirmation, inside the 24h window only. */
  cancel: async (id: string, reason?: string, cancelledBy: CancelledBy = "clinic") => {
    const res = await http.post<{ appointment: RawApiAppointment; notification?: CancelNotification }>(
      API_ENDPOINTS.appointments.cancel(id),
      { ...(reason ? { reason } : {}), cancelled_by: cancelledBy }
    );
    return {
      ...res,
      data: { appointment: mapAppointment(res.data.appointment), notification: res.data.notification },
    };
  },

  /** PATCH — reschedule (slot_id) or cancel (status: "CANCELLED"). Available to patients for
   * their own/booked-by-them appointments; staff keep using complete()/cancel() above as before. */
  update: async (id: string, payload: UpdateAppointmentPayload) => {
    const res = await http.patch<{ appointment: RawApiAppointment }>(
      API_ENDPOINTS.appointments.detail(id),
      payload
    );
    return { ...res, data: { appointment: mapAppointment(res.data.appointment) } };
  },

  auditLog: (id: string) =>
    http.get<{ logs: RawAuditLogEntry[] }>(API_ENDPOINTS.appointments.auditLog(id)),

  bulkCancelPreview: () => http.get<BulkCancelPreview>(API_ENDPOINTS.appointments.bulkCancelPreview),

  bulkCancel: (payload: BulkCancelPayload) =>
    http.post<{ job: BulkCancelJob }>(API_ENDPOINTS.appointments.bulkCancel, payload),

  bulkCancelJob: (jobId: string) => http.get<{ job: BulkCancelJob }>(API_ENDPOINTS.appointments.bulkCancelJob(jobId)),

  /** Staff-booked Next Appointment — created already confirmed (one step) and the patient is messaged. */
  followUp: async (id: string, payload: FollowUpPayload) => {
    const res = await http.post<{ appointment: RawApiAppointment }>(
      API_ENDPOINTS.appointments.followUp(id),
      payload
    );
    return { ...res, data: { appointment: mapAppointment(res.data.appointment) } };
  },
};

// ---------- Display helpers ----------

/** One status per appointment for the UI — folds the backend's status plus
 * its arrived_at / no_show_flagged markers into a single value. */
export type DisplayStatus =
  | "needs_approval"
  | "confirmed"
  | "in_clinic"
  | "completed"
  | "no_show"
  | "cancelled";

export function getDisplayStatus(
  appointment: Pick<ApiAppointment, "status" | "arrived_at" | "no_show_flagged">
): DisplayStatus {
  switch (appointment.status) {
    case "PENDING":
      return "needs_approval";
    case "COMPLETED":
      return "completed";
    case "CANCELLED":
      return "cancelled";
    default:
      // APPROVED / PATIENT_CONFIRMED — the only states the arrival and
      // no-show markers mean anything for.
      if (appointment.arrived_at) return "in_clinic";
      if (appointment.no_show_flagged) return "no_show";
      return "confirmed";
  }
}

const SOURCE_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  phone: "Reception",
  web: "Website",
  follow_up: "Next Appointment",
  // Staff quick-book from the WhatsApp inbox is a WhatsApp booking (the dashboard counts it there too).
  whatsapp_inbox: "WhatsApp",
};

/** "follow_up" -> "Next Appointment"; unknown values are humanized, never shown raw. */
export function sourceLabel(source: string | null | undefined): string {
  if (!source) return "—";
  if (SOURCE_LABELS[source]) return SOURCE_LABELS[source];
  const words = source.replace(/[_-]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Clinic wall-clock — appointment_datetime is naive IST, so "today"/"now"
 * must be IST too, whatever timezone the browser is in. */
export const CLINIC_TIME_ZONE = "Asia/Kolkata";

const IST_PARTS_FORMAT = new Intl.DateTimeFormat("en-CA", {
  timeZone: CLINIC_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Current IST date ("YYYY-MM-DD") and minutes since IST midnight. */
export function istNow(epochMs: number): { date: string; minutes: number } {
  const parts = Object.fromEntries(
    IST_PARTS_FORMAT.formatToParts(new Date(epochMs)).map((p) => [p.type, p.value])
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

/** "2026-10-01T18:30" -> { date: "2026-10-01", minutes: 1110 }. */
export function splitAppointmentDateTime(value: string): { date: string; minutes: number } {
  const [date, time = "00:00"] = value.split("T");
  const [h, m] = time.split(":").map(Number);
  return { date, minutes: (h || 0) * 60 + (m || 0) };
}

/** 1110 -> { time: "6:30", period: "PM" }. */
export function formatClock(minutes: number): { time: string; period: "AM" | "PM" } {
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return { time: `${h12}:${String(m).padStart(2, "0")}`, period: h24 < 12 ? "AM" : "PM" };
}

function ymdToUtcDate(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1));
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "1 Oct" / "1 Oct 2025" — spelled out by hand because Intl's en-GB/en-IN
 * output varies by runtime ("Sept", no comma after the weekday, …). */
export function dayMonth(ymd: string, todayYmd: string): string {
  const date = ymdToUtcDate(ymd);
  const year = ymd.slice(0, 4) !== todayYmd.slice(0, 4) ? ` ${date.getUTCFullYear()}` : "";
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}${year}`;
}

/** "Today" / "Tomorrow" / "Yesterday" / "Wed, 30 Sep" (year added when it differs). */
export function friendlyDate(ymd: string, todayYmd: string): string {
  const diffDays = Math.round(
    (ymdToUtcDate(ymd).getTime() - ymdToUtcDate(todayYmd).getTime()) / 86_400_000
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  return `${WEEKDAYS[ymdToUtcDate(ymd).getUTCDay()]}, ${dayMonth(ymd, todayYmd)}`;
}

/** "Today, 1 Oct" — the drawer header form. */
export function friendlyDateWithDay(ymd: string, todayYmd: string): string {
  const rel = friendlyDate(ymd, todayYmd);
  return ["Today", "Tomorrow", "Yesterday"].includes(rel) ? `${rel}, ${dayMonth(ymd, todayYmd)}` : rel;
}

/** created_at comes back already in IST as "DD-MM-YYYY HH:MM" (the backend's
 * CREATED_AT_DISPLAY_STAGE) -> "28 Sep 2026, 11:42 AM". */
export function formatCreatedAt(value: string | null | undefined): string {
  const match = value?.match(/^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})$/);
  if (!match) return value || "—";
  const [, d, mo, y, h, mi] = match;
  const clock = formatClock(Number(h) * 60 + Number(mi));
  return `${Number(d)} ${MONTHS[Number(mo) - 1]} ${y}, ${clock.time} ${clock.period}`;
}

/** "+919123456590" -> "91234 •• 590" — the list view's on-screen privacy mask. */
export function maskPhone(phone: string | null | undefined): string {
  const digits = (phone ?? "").replace(/\D/g, "").slice(-10);
  if (digits.length < 8) return phone || "—";
  return `${digits.slice(0, 5)} •• ${digits.slice(-3)}`;
}

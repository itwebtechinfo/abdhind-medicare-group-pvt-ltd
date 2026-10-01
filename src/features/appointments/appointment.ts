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
}

/** Appointments-page tabs — filtered server-side by GET /appointments?tab=. */
export type AppointmentTab = "today" | "needs_approval" | "upcoming" | "past" | "cancelled";

export type AppointmentTabCounts = Record<AppointmentTab, number>;

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

export interface FollowUpPayload {
  slot_id: string;
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

  get: async (id: string) => {
    const res = await http.get<{ appointment: RawApiAppointment }>(
      API_ENDPOINTS.appointments.detail(id)
    );
    return { ...res, data: { appointment: mapAppointment(res.data.appointment) } };
  },

  create: async (payload: CreateAppointmentPayload) => {
    const res = await http.post<{ appointment: RawApiAppointment }>(
      API_ENDPOINTS.appointments.list,
      payload
    );
    return { ...res, data: { appointment: mapAppointment(res.data.appointment) } };
  },

  /** POST /doctor/approve — confirm a PENDING appointment, optionally at a doctor-preferred
   * slot_id (status + time in one call). Same endpoint the doctor dashboard's quick-approve uses. */
  confirm: async (id: string, payload: ConfirmAppointmentPayload = {}) => {
    const res = await http.post<{ appointment: RawApiAppointment }>(
      API_ENDPOINTS.doctorQuick.approve,
      { appointment_id: id, ...payload }
    );
    return { ...res, data: { appointment: mapAppointment(res.data.appointment) } };
  },

  complete: async (id: string) => {
    const res = await http.post<{ appointment: RawApiAppointment }>(
      API_ENDPOINTS.appointments.complete(id)
    );
    return { ...res, data: { appointment: mapAppointment(res.data.appointment) } };
  },

  /** Reception check-in ("In clinic") — APPROVED/PATIENT_CONFIRMED, today only. */
  arrive: async (id: string) => {
    const res = await http.post<{ appointment: RawApiAppointment }>(
      API_ENDPOINTS.appointments.arrive(id)
    );
    return { ...res, data: { appointment: mapAppointment(res.data.appointment) } };
  },

  /** `reason` is optional free text explaining the cancellation; omit it
   * (or pass undefined) and this behaves exactly as before. */
  cancel: async (id: string, reason?: string) => {
    const res = await http.post<{ appointment: RawApiAppointment }>(
      API_ENDPOINTS.appointments.cancel(id),
      reason ? { reason } : undefined
    );
    return { ...res, data: { appointment: mapAppointment(res.data.appointment) } };
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
  follow_up: "Follow-up",
};

/** "follow_up" -> "Follow-up"; unknown values are humanized, never shown raw. */
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

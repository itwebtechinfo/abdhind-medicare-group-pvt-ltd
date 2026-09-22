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
  feedback_requested: boolean;
  patient?: RawJoinedPerson;
  doctor?: RawJoinedPerson;
  booked_by_user_id: string | null;
  booked_by: BookedBy | null;
  reference_code: string | null;
  cancellation_reason: string | null;
}

export interface AppointmentListFilters {
  status?: AppointmentStatus;
  date?: string;
  doctor_id?: string;
  no_show?: boolean;
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
    feedback_requested: raw.feedback_requested ?? false,
    patient: raw.patient,
    doctor: raw.doctor,
    booked_by_user_id: raw.booked_by_user_id ?? null,
    booked_by: raw.booked_by
      ? { id: raw.booked_by._id, full_name: raw.booked_by.full_name, phone_number: raw.booked_by.phone_number }
      : null,
    reference_code: raw.reference_code ?? null,
    cancellation_reason: raw.cancellation_reason ?? null,
  };
}

/** Drop undefined keys so axios doesn't serialize them as literal "undefined" query params. */
function cleanParams(filters: AppointmentListFilters) {
  return Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined));
}

export const appointmentService = {
  list: async (filters: AppointmentListFilters = {}) => {
    const res = await http.get<{ count: number; appointments: RawApiAppointment[] }>(
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

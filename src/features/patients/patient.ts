import { z } from "zod";
import { http, publicHttp } from "@/src/services/http";
import { API_ENDPOINTS } from "@/src/config/endpoints";
import { INDIAN_MOBILE_REGEX } from "@/src/features/auth/login-schema";
import { OTP_LENGTH, OTP_RESEND_COOLDOWN_SECONDS } from "@/src/lib/otp";

export { OTP_LENGTH, OTP_RESEND_COOLDOWN_SECONDS };

// ---------- Types ----------

/** Raw wire shape — the patients domain uses Mongo's "_id", unlike /users which aliases to "id". */
export interface RawApiPatient {
  _id: string;
  phone: string;
  uhid: string;
  full_name: string;
  age: number | null;
  gender: string | null;
  address: string | null;
  /** WhatsApp bot language ("hi"/"en"); absent on records the bot never touched. */
  preferred_language?: string | null;
  created_at: string;
}

/** Normalized shape used throughout the frontend — "_id" mapped to "id" for ErpDataTable. */
export interface ApiPatient {
  id: string;
  phone: string;
  uhid: string;
  full_name: string;
  age: number | null;
  gender: string | null;
  address: string | null;
  preferred_language: string | null;
  created_at: string;
}

export type AppointmentStatus =
  | "PENDING"
  | "APPROVED"
  | "PATIENT_CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

/** Raw appointment record as embedded in GET /patients/{id} — no patient/doctor join. */
export interface RawPatientAppointmentRecord {
  _id: string;
  doctor_id: string;
  department_id: string;
  slot_id: string;
  appointment_datetime: string;
  status: AppointmentStatus;
  source: string;
  created_at: string;
  follow_up_of?: string | null;
  follow_up_appointment_id?: string | null;
  reference_code?: string | null;
  cancellation_reason?: string | null;
  completed_at?: number | null;
  no_show_flagged?: boolean;
  booked_by_user_id?: string | null;
}

export interface PatientAppointmentRecord {
  id: string;
  doctor_id: string;
  department_id: string;
  slot_id: string;
  appointment_datetime: string;
  status: AppointmentStatus;
  source: string;
  created_at: string;
  follow_up_of: string | null;
  follow_up_appointment_id: string | null;
  reference_code: string | null;
  cancellation_reason: string | null;
  completed_at: number | null;
  no_show_flagged: boolean;
  booked_by_user_id: string | null;
}

/** Patients-page tabs — filtered server-side by GET /patients?tab=. */
export type PatientTab = "all" | "upcoming_visit" | "new_this_week" | "missed_last_visit";

/** GET /patients/stats — counted in the DB with the same rules as the tab filters. */
export interface PatientStats {
  total: number;
  new_this_week: number;
  upcoming_visit: number;
  missed_last_visit: number;
}

/** Per-row visit info, computed server-side (routes/patients.py visit rules). */
export interface PatientVisitSummary {
  /** Latest COMPLETED (or checked-in) appointment. */
  last_visit: { appointment_id: string; appointment_datetime: string; kind: string } | null;
  /** Set when the latest past non-cancelled appointment was flagged no-show. */
  missed: { appointment_id: string; appointment_datetime: string } | null;
  next_appointment: {
    id: string;
    appointment_datetime: string;
    status: AppointmentStatus;
    arrived_at: string | null;
    no_show_flagged: boolean;
    source: string;
    reference_code: string | null;
    doctor_name: string | null;
    doctor_specialization: string | null;
  } | null;
}

export interface PatientListRow extends ApiPatient {
  visit_summary: PatientVisitSummary;
  /** WhatsApp inbox conversation id for this phone, when one exists. */
  whatsapp_conversation_id: string | null;
}

export interface PatientListParams {
  tab?: PatientTab;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PatientActivityEntry {
  type: "appointment" | "registered";
  /** Epoch ms. */
  at: number;
  appointment_id?: string;
  appointment_datetime?: string | null;
  reference_code?: string | null;
  source?: string | null;
  from_status?: AppointmentStatus | null;
  to_status?: AppointmentStatus | null;
  event?: string | null;
  old_datetime?: string | null;
  new_datetime?: string | null;
  changed_by_role?: string | null;
  changed_by_name?: string | null;
}

export interface PatientOverview {
  visit_summary: PatientVisitSummary | null;
  /** The WhatsApp inbox conversation for this patient's phone, if they've ever messaged. */
  whatsapp_conversation_id: string | null;
  recent_activity: PatientActivityEntry[];
}

interface LinkedAppointment {
  appointment?: { _id: string; appointment_datetime: string; reference_code?: string | null } | null;
}

export interface PatientLabOrder extends LinkedAppointment {
  _id: string;
  appointment_id: string;
  test_name: string;
  status: "ORDERED" | "COMPLETED";
  result_text: string | null;
  result_file: string | null;
  completed_at: number | null;
  ordered_by?: { name: string | null; role: string } | null;
  created_at: string;
}

export interface PatientDispense extends LinkedAppointment {
  _id: string;
  appointment_id: string;
  items: { medicine_name: string; unit: string; unit_price: number; quantity: number }[];
  dispensed_by?: { name: string | null; role: string } | null;
  created_at: string;
}

export interface CreatePatientPayload {
  full_name: string;
  phone: string;
  age?: number | null;
  gender?: string | null;
  address?: string | null;
}

/** Partial patch — only include the fields that actually changed. */
export type UpdatePatientPayload = Partial<CreatePatientPayload>;

// ---------- Schema (staff-facing create/edit) ----------

/** Permissive - blank allowed. Used as-is by editPatientSchema (leaving age
 * blank on an edit means "leave unknown", not "clear this dirty field"). */
const ageStringSchema = z
  .string()
  .trim()
  .refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) <= 150), {
    message: "Enter a valid age (0-150)",
  });

const genderSchema = z.enum(["", "Male", "Female", "Other"]);

export const createPatientSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required"),
  phone: z
    .string()
    .trim()
    .regex(INDIAN_MOBILE_REGEX, "Enter a valid 10-digit mobile number"),
  age: ageStringSchema.refine((v): boolean => v !== "", { message: "Age is required" }),
  gender: genderSchema.refine((v): boolean => v !== "", { message: "Gender is required" }),
  address: z.string().trim(),
});

export type CreatePatientFormValues = z.infer<typeof createPatientSchema>;

/** Not createPatientSchema.partial() - age/gender must stay permissive here so
 * editing an unrelated field on a patient with no age on file doesn't fail
 * validation on a field the form never touched. */
export const editPatientSchema = createPatientSchema
  .extend({ age: ageStringSchema, gender: genderSchema })
  .partial();

export type EditPatientFormValues = z.infer<typeof editPatientSchema>;

// ---------- Schema (self-service signup) ----------

export const patientSignupSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required"),
  email: z.string().trim().email("Enter a valid email address").optional().or(z.literal("")),
  phone_number: z
    .string()
    .trim()
    .regex(INDIAN_MOBILE_REGEX, "Enter a valid 10-digit mobile number"),
  state: z.string().trim().min(1, "State is required"),
  district: z.string().trim().min(1, "District is required"),
  age: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) <= 150), {
      message: "Enter a valid age (0-150)",
    })
    .optional(),
  gender: z.enum(["", "Male", "Female", "Other"]).optional(),
  address: z.string().trim().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  otp: z.string().trim().length(6, "Enter the 6-digit code"),
});

export type PatientSignupFormValues = z.infer<typeof patientSignupSchema>;

/** Fields collected before the OTP is requested — validated up front via `trigger`. */
export const PATIENT_SIGNUP_DETAIL_FIELDS = [
  "full_name",
  "email",
  "phone_number",
  "state",
  "district",
  "age",
  "gender",
  "address",
  "password",
] as const satisfies readonly (keyof PatientSignupFormValues)[];

// ---------- Service ----------

function mapPatient(raw: RawApiPatient): ApiPatient {
  return {
    id: raw._id,
    phone: raw.phone,
    uhid: raw.uhid,
    full_name: raw.full_name,
    age: raw.age,
    gender: raw.gender,
    address: raw.address,
    preferred_language: raw.preferred_language ?? null,
    created_at: raw.created_at,
  };
}

function mapAppointmentRecord(raw: RawPatientAppointmentRecord): PatientAppointmentRecord {
  return {
    id: raw._id,
    doctor_id: raw.doctor_id,
    department_id: raw.department_id,
    slot_id: raw.slot_id,
    appointment_datetime: raw.appointment_datetime,
    status: raw.status,
    source: raw.source,
    created_at: raw.created_at,
    follow_up_of: raw.follow_up_of ?? null,
    follow_up_appointment_id: raw.follow_up_appointment_id ?? null,
    reference_code: raw.reference_code ?? null,
    cancellation_reason: raw.cancellation_reason ?? null,
    completed_at: raw.completed_at ?? null,
    no_show_flagged: raw.no_show_flagged ?? false,
    booked_by_user_id: raw.booked_by_user_id ?? null,
  };
}

export type RawVisitSummary = Omit<PatientVisitSummary, "next_appointment"> & {
  next_appointment: (Omit<NonNullable<PatientVisitSummary["next_appointment"]>, "id"> & { _id: string }) | null;
};

export function mapVisitSummary(raw: RawVisitSummary | null | undefined): PatientVisitSummary {
  const next = raw?.next_appointment;
  return {
    last_visit: raw?.last_visit ?? null,
    missed: raw?.missed ?? null,
    next_appointment: next ? { ...next, id: next._id } : null,
  };
}

export const patientService = {
  /** Patients page: one server-filtered page, each row with its visit summary. */
  listPage: async (params: PatientListParams) => {
    const res = await http.get<{
      count: number;
      patients: (RawApiPatient & { visit_summary?: RawVisitSummary; whatsapp_conversation_id?: string | null })[];
    }>(API_ENDPOINTS.patients.list, {
      params: { ...params, search: params.search || undefined, include_summary: true },
    });
    return {
      ...res,
      data: {
        count: res.data.count,
        patients: res.data.patients.map(
          (raw): PatientListRow => ({
            ...mapPatient(raw),
            visit_summary: mapVisitSummary(raw.visit_summary),
            whatsapp_conversation_id: raw.whatsapp_conversation_id ?? null,
          })
        ),
      },
    };
  },

  stats: () => http.get<PatientStats>(API_ENDPOINTS.patients.stats),

  overview: async (id: string) => {
    const res = await http.get<Omit<PatientOverview, "visit_summary"> & { visit_summary: RawVisitSummary | null }>(
      API_ENDPOINTS.patients.overview(id)
    );
    return { ...res, data: { ...res.data, visit_summary: mapVisitSummary(res.data.visit_summary) } };
  },

  labOrders: (id: string) => http.get<{ lab_orders: PatientLabOrder[] }>(API_ENDPOINTS.patients.labOrders(id)),

  dispenses: (id: string) => http.get<{ dispenses: PatientDispense[] }>(API_ENDPOINTS.patients.dispenses(id)),

  list: async () => {
    const res = await http.get<{ count: number; patients: RawApiPatient[] }>(
      API_ENDPOINTS.patients.list
    );
    return { ...res, data: { ...res.data, patients: res.data.patients.map(mapPatient) } };
  },

  get: async (id: string) => {
    const res = await http.get<{ patient: RawApiPatient; appointments: RawPatientAppointmentRecord[] }>(
      API_ENDPOINTS.patients.detail(id)
    );
    return {
      ...res,
      data: {
        patient: mapPatient(res.data.patient),
        appointments: res.data.appointments.map(mapAppointmentRecord),
      },
    };
  },

  create: async (payload: CreatePatientPayload) => {
    const res = await http.post<{ patient: RawApiPatient }>(API_ENDPOINTS.patients.list, payload);
    return { ...res, data: { patient: mapPatient(res.data.patient) } };
  },

  update: async (id: string, payload: UpdatePatientPayload) => {
    const res = await http.patch<{ patient: RawApiPatient }>(
      API_ENDPOINTS.patients.detail(id),
      payload
    );
    return { ...res, data: { patient: mapPatient(res.data.patient) } };
  },

  /** Public, unauthenticated — sends a WhatsApp OTP for patient self-signup. */
  requestSignupOtp: (phoneNumber: string) =>
    publicHttp.post<null>(API_ENDPOINTS.patients.signupOtpRequest, { phone_number: phoneNumber }),

  /** Authenticated as the logged-in patient — their own record + booking history. */
  getMine: async () => {
    const res = await http.get<{
      patient: RawApiPatient | null;
      appointments: RawPatientAppointmentRecord[];
    }>(API_ENDPOINTS.me.patient);
    return {
      ...res,
      data: {
        patient: res.data.patient ? mapPatient(res.data.patient) : null,
        appointments: res.data.appointments.map(mapAppointmentRecord),
      },
    };
  },
};

// ---------- Display helpers ----------

/** "+919311289091" / "9311289091" -> "+91 93112 89091". Other country codes are shown as stored. */
export function formatPatientPhone(phone: string | null | undefined): string {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "");
  const national = digits.length === 10 ? digits : digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : null;
  return national ? `+91 ${national.slice(0, 5)} ${national.slice(5)}` : phone;
}

/** Same number as a tel: / WhatsApp target, always with the country code. */
export function patientPhoneE164(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  return digits ? `+${digits}` : null;
}

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
  };
}

export const patientService = {
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

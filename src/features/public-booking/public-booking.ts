import { z } from "zod";
import { publicHttp } from "@/src/services/http";
import { API_ENDPOINTS } from "@/src/config/endpoints";
import { INDIAN_MOBILE_REGEX } from "@/src/features/auth/login-schema";
import { mapAppointment, type RawApiAppointment } from "@/src/features/appointments/appointment";
import { OTP_LENGTH, OTP_RESEND_COOLDOWN_SECONDS } from "@/src/lib/otp";

export { OTP_LENGTH, OTP_RESEND_COOLDOWN_SECONDS };

// ---------- Types ----------

export interface RawPublicDoctor {
  _id: string;
  full_name: string;
  specialization: string;
  department_id: string;
}

export interface PublicDoctor {
  id: string;
  full_name: string;
  specialization: string;
  department_id: string;
}

export interface RawPublicSlot {
  _id: string;
  date: string;
  start_time: string;
  end_time: string;
}

export interface PublicSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
}

export interface PublicBookingPayload {
  patient_phone: string;
  patient_name: string;
  patient_age?: number | null;
  patient_gender?: string | null;
  patient_address?: string | null;
  doctor_id: string;
  slot_id: string;
  otp: string;
}

// ---------- Schema ----------

export const patientDetailsSchema = z.object({
  patient_name: z.string().trim().min(1, "Full name is required"),
  patient_phone: z
    .string()
    .trim()
    .regex(INDIAN_MOBILE_REGEX, "Enter a valid 10-digit mobile number"),
  patient_age: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) <= 150), {
      message: "Enter a valid age (0-150)",
    }),
  patient_gender: z.enum(["", "Male", "Female", "Other"]),
  patient_address: z.string().trim(),
});

export type PatientDetailsFormValues = z.infer<typeof patientDetailsSchema>;

export const EMPTY_PATIENT_DETAILS: PatientDetailsFormValues = {
  patient_name: "",
  patient_phone: "",
  patient_age: "",
  patient_gender: "",
  patient_address: "",
};

// ---------- Service ----------

function mapDoctor(raw: RawPublicDoctor): PublicDoctor {
  return {
    id: raw._id,
    full_name: raw.full_name,
    specialization: raw.specialization,
    department_id: raw.department_id,
  };
}

function mapSlot(raw: RawPublicSlot): PublicSlot {
  return { id: raw._id, date: raw.date, start_time: raw.start_time, end_time: raw.end_time };
}

export const publicBookingService = {
  listDoctors: async () => {
    const res = await publicHttp.get<{ doctors: RawPublicDoctor[] }>(API_ENDPOINTS.public.doctors);
    return { ...res, data: { doctors: res.data.doctors.map(mapDoctor) } };
  },

  listSlots: async (doctorId: string, date: string) => {
    const res = await publicHttp.get<{ slots: RawPublicSlot[] }>(
      API_ENDPOINTS.public.slots(doctorId),
      { params: { date } }
    );
    return { ...res, data: { slots: res.data.slots.map(mapSlot) } };
  },

  requestOtp: (patientPhone: string) =>
    publicHttp.post<null>(API_ENDPOINTS.public.otpRequest, { patient_phone: patientPhone }),

  book: async (payload: PublicBookingPayload) => {
    const res = await publicHttp.post<{ appointment: RawApiAppointment }>(
      API_ENDPOINTS.public.book,
      payload
    );
    return { ...res, data: { appointment: mapAppointment(res.data.appointment) } };
  },
};

import { z } from "zod";
import { http } from "@/src/services/http";
import { API_ENDPOINTS } from "@/src/config/endpoints";
import { INDIAN_MOBILE_REGEX } from "@/src/features/auth/login-schema";

// ---------- Types ----------

export const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

export interface WorkingHoursDay {
  is_working: boolean;
  start_time: string;
  end_time: string;
}

export type WorkingHours = Record<Weekday, WorkingHoursDay>;

/** The `users` login this doctor profile is linked to — resolved by the backend, null if unlinked. */
export interface LinkedUser {
  id: string;
  full_name: string;
  phone_number: string;
  is_verified: boolean;
}

export interface RawApiDoctor {
  _id: string;
  full_name: string;
  department_id: string;
  specialization: string;
  phone: string;
  slot_duration_minutes: number;
  working_hours: WorkingHours;
  active: boolean;
  created_at: string;
  /** Linked staff login (role "doctor") that this profile is scoped to — null if unlinked. */
  user_id: string | null;
  linked_user: LinkedUser | null;
}

export interface ApiDoctor {
  id: string;
  full_name: string;
  department_id: string;
  specialization: string;
  phone: string;
  slot_duration_minutes: number;
  working_hours: WorkingHours;
  active: boolean;
  created_at: string;
  user_id: string | null;
  linked_user: LinkedUser | null;
}

export interface CreateDoctorLoginPayload {
  phone_number: string;
  password: string;
  state: string;
  district: string;
  email?: string;
}

export interface CreateDoctorPayload {
  full_name: string;
  department_id: string;
  specialization: string;
  phone: string;
  slot_duration_minutes: number;
  working_hours: WorkingHours;
  /** Creates and links a new login for this doctor in the same call. */
  login?: CreateDoctorLoginPayload;
}

/** `user_id` links this profile to an existing "doctor"-role login — see the Doctor login & scoping doc. */
export type UpdateDoctorPayload = Partial<CreateDoctorPayload> & {
  active?: boolean;
  user_id?: string;
};

export interface RawApiLeave {
  _id: string;
  date: string;
  reason: string;
  created_at: string;
}

export interface ApiLeave {
  id: string;
  date: string;
  reason: string;
  created_at: string;
}

export interface CreateLeavePayload {
  date: string;
  reason: string;
}

export interface CreateSlotPayload {
  date: string;
  start_time: string;
  end_time: string;
}

export interface RawApiSlot {
  _id: string;
  doctor_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  appointment_id: string | null;
}

export interface ApiSlot {
  id: string;
  doctor_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  appointment_id: string | null;
}

// ---------- Schema ----------

const workingHoursDaySchema = z
  .object({
    is_working: z.boolean(),
    start_time: z.string(),
    end_time: z.string(),
  })
  .refine((day) => !day.is_working || (day.start_time.trim() && day.end_time.trim()), {
    message: "Start and end time are required for a working day",
    path: ["start_time"],
  });

const workingHoursSchema = z.object({
  monday: workingHoursDaySchema,
  tuesday: workingHoursDaySchema,
  wednesday: workingHoursDaySchema,
  thursday: workingHoursDaySchema,
  friday: workingHoursDaySchema,
  saturday: workingHoursDaySchema,
  sunday: workingHoursDaySchema,
});

/** New login to create + link in the same call as the doctor profile (POST /doctors only). */
export const doctorLoginSchema = z.object({
  phone_number: z
    .string()
    .trim()
    .regex(INDIAN_MOBILE_REGEX, "Enter a valid 10-digit mobile number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  state: z.string().trim().min(1, "State is required"),
  district: z.string().trim().min(1, "District is required"),
  email: z.string().trim().email("Enter a valid email address").optional().or(z.literal("")),
});

export const createDoctorSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required"),
  department_id: z.string().trim().min(1, "Department is required"),
  specialization: z.string().trim().min(1, "Specialization is required"),
  phone: z.string().trim().min(1, "Phone is required"),
  slot_duration_minutes: z.coerce.number().int().min(5, "Minimum 5 minutes").max(180),
  working_hours: workingHoursSchema,
  /** Links this profile to an existing "doctor"-role login. Only settable via edit (PATCH). */
  user_id: z.string().optional(),
  /** Creates a brand-new login for this doctor in the same call. Create-mode only. */
  login: doctorLoginSchema.optional(),
});

export type CreateDoctorFormValues = z.infer<typeof createDoctorSchema>;

export const editDoctorSchema = createDoctorSchema.partial().extend({
  active: z.boolean().optional(),
});

export type EditDoctorFormValues = z.infer<typeof editDoctorSchema>;

const DEFAULT_DAY = { is_working: false, start_time: "10:00", end_time: "18:00" };

export const DEFAULT_WORKING_HOURS: CreateDoctorFormValues["working_hours"] = {
  monday: { ...DEFAULT_DAY, is_working: true },
  tuesday: { ...DEFAULT_DAY, is_working: true },
  wednesday: { ...DEFAULT_DAY, is_working: true },
  thursday: { ...DEFAULT_DAY, is_working: true },
  friday: { ...DEFAULT_DAY, is_working: true },
  saturday: { ...DEFAULT_DAY, is_working: true },
  sunday: { ...DEFAULT_DAY },
};

// ---------- Service ----------

function mapDoctor(raw: RawApiDoctor): ApiDoctor {
  return {
    id: raw._id,
    full_name: raw.full_name,
    department_id: raw.department_id,
    specialization: raw.specialization,
    phone: raw.phone,
    slot_duration_minutes: raw.slot_duration_minutes,
    working_hours: raw.working_hours,
    active: raw.active,
    created_at: raw.created_at,
    user_id: raw.user_id,
    linked_user: raw.linked_user,
  };
}

function mapLeave(raw: RawApiLeave): ApiLeave {
  return { id: raw._id, date: raw.date, reason: raw.reason, created_at: raw.created_at };
}

function mapSlot(raw: RawApiSlot): ApiSlot {
  return {
    id: raw._id,
    doctor_id: raw.doctor_id,
    date: raw.date,
    start_time: raw.start_time,
    end_time: raw.end_time,
    is_booked: raw.is_booked,
    appointment_id: raw.appointment_id,
  };
}

export const doctorService = {
  list: async () => {
    const res = await http.get<{ count: number; doctors: RawApiDoctor[] }>(
      API_ENDPOINTS.doctors.list
    );
    return { ...res, data: { ...res.data, doctors: res.data.doctors.map(mapDoctor) } };
  },

  get: async (id: string) => {
    const res = await http.get<{ doctor: RawApiDoctor }>(API_ENDPOINTS.doctors.detail(id));
    return { ...res, data: { doctor: mapDoctor(res.data.doctor) } };
  },

  create: async (payload: CreateDoctorPayload) => {
    const res = await http.post<{ doctor: RawApiDoctor }>(API_ENDPOINTS.doctors.list, payload);
    return { ...res, data: { doctor: mapDoctor(res.data.doctor) } };
  },

  update: async (id: string, payload: UpdateDoctorPayload) => {
    const res = await http.patch<{ doctor: RawApiDoctor }>(
      API_ENDPOINTS.doctors.detail(id),
      payload
    );
    return { ...res, data: { doctor: mapDoctor(res.data.doctor) } };
  },

  listLeaves: async (doctorId: string) => {
    const res = await http.get<{ leaves: RawApiLeave[] }>(API_ENDPOINTS.doctors.leaves(doctorId));
    return { ...res, data: { leaves: res.data.leaves.map(mapLeave) } };
  },

  createLeave: (doctorId: string, payload: CreateLeavePayload) =>
    http.post<{ leave: RawApiLeave }>(API_ENDPOINTS.doctors.leaves(doctorId), payload),

  deleteLeave: (doctorId: string, leaveId: string) =>
    http.delete<null>(API_ENDPOINTS.doctors.leave(doctorId, leaveId)),

  listSlots: async (doctorId: string, date?: string) => {
    const res = await http.get<{ slots: RawApiSlot[] }>(API_ENDPOINTS.doctors.slots(doctorId), {
      params: date ? { date } : undefined,
    });
    return { ...res, data: { slots: res.data.slots.map(mapSlot) } };
  },

  generateSlots: (doctorId: string, range?: { start_date: string; end_date: string }) =>
    http.post<{ created: number }>(API_ENDPOINTS.doctors.generateSlots(doctorId), range),

  createSlot: async (doctorId: string, payload: CreateSlotPayload) => {
    const res = await http.post<{ slot: RawApiSlot }>(API_ENDPOINTS.doctors.slots(doctorId), payload);
    return { ...res, data: { slot: mapSlot(res.data.slot) } };
  },
};

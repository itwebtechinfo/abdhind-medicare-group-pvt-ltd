import { z } from "zod";
import { http } from "@/src/services/http";
import { API_ENDPOINTS } from "@/src/config/endpoints";
import { INDIAN_MOBILE_REGEX } from "@/src/features/auth/login-schema";
import { ALL_USER_ROLES } from "@/src/lib/rbac/roles";
import type { UserRole } from "@/src/lib/auth/types";

// ---------- Types ----------

/** Shape returned by the users endpoints (identical to /auth/me's user). */
export interface ApiUser {
  id: string;
  full_name: string;
  phone_number: string;
  email: string;
  age: number | null;
  gender: string | null;
  profile_image: string | null;
  state: string | null;
  district: string | null;
  address: string | null;
  is_verified: boolean;
  /** Backend-formatted "DD-MM-YYYY HH:mm" string — not ISO, display as-is. */
  created_at: string;
  role: string;
  /** Derived from role — same permissions the role grants. */
  permissions: string[];
  /** role === "doctor" only — the `doctors` profile this login is linked to, null if unlinked. */
  linked_doctor: { id: string; full_name: string; specialization: string | null } | null;
}

export interface CreateUserPayload {
  full_name: string;
  phone_number: string;
  password: string;
  role: UserRole;
  state: string;
  district: string;
  email?: string;
  age?: number;
  gender?: string;
  address?: string;
  /** Only meaningful when role is "doctor" — links the login to an existing doctor profile. */
  doctor_id?: string;
}

/** Partial patch — only include the fields that actually changed. */
export type UpdateUserPayload = Partial<Omit<CreateUserPayload, "password">> & {
  is_verified?: boolean;
};

// ---------- Schema ----------

const roleEnum = z.enum(ALL_USER_ROLES as [UserRole, ...UserRole[]]);

export const createUserSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required"),
  email: z.string().trim().email("Enter a valid email address").optional().or(z.literal("")),
  phone_number: z
    .string()
    .trim()
    .regex(INDIAN_MOBILE_REGEX, "Enter a valid 10-digit mobile number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: roleEnum,
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
  /** Only sent when role is "doctor" — links the login to an existing doctor profile. */
  doctor_id: z.string().optional(),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const editUserSchema = createUserSchema.omit({ password: true }).partial();

export type EditUserFormValues = z.infer<typeof editUserSchema>;

// ---------- Service ----------

export const userService = {
  list: () =>
    http.get<{ count: number; users: ApiUser[] }>(API_ENDPOINTS.users.list),

  get: (id: string) => http.get<{ user: ApiUser }>(API_ENDPOINTS.users.detail(id)),

  create: (payload: CreateUserPayload) =>
    http.post<{ user: ApiUser }>(API_ENDPOINTS.users.list, payload),

  update: (id: string, payload: UpdateUserPayload) =>
    http.patch<{ user: ApiUser }>(API_ENDPOINTS.users.detail(id), payload),

  deactivate: (id: string) => http.post<null>(API_ENDPOINTS.users.deactivate(id)),

  activate: (id: string) => http.post<null>(API_ENDPOINTS.users.activate(id)),
};

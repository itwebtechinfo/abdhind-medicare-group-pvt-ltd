import { z } from "zod";
import { http } from "@/src/services/http";
import { API_ENDPOINTS } from "@/src/config/endpoints";
import { INDIAN_MOBILE_REGEX } from "@/src/features/auth/login-schema";

// ---------- Types ----------

/** Staff roles, in rank order — must match STAFF_ROLES in base.py. */
export const STAFF_ROLES = ["system_admin", "admin", "reception", "doctor", "pharmacy", "lab", "account"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export type UserStatus = "active" | "invite_sent" | "deactivated";

export interface UserActorRef {
  user_id: string | null;
  name: string | null;
  role: string | null;
}

/** Shape returned by the users endpoints (identical to /auth/me's user). Never includes a password. */
export interface ApiUser {
  id: string;
  full_name: string;
  phone_number: string;
  email: string | null;
  age: number | null;
  gender: string | null;
  profile_image: string | null;
  state: string | null;
  district: string | null;
  address: string | null;
  is_verified: boolean;
  /** Backend-formatted "DD-MM-YYYY HH:mm" IST string. */
  created_at: string;
  role: string;
  /** Derived from role — same permissions the role grants. */
  permissions: string[];
  /** role === "doctor" only — the `doctors` record this login is linked to. */
  linked_doctor: { id: string; full_name: string; specialization: string | null } | null;
  /** Epoch ms, or null for accounts that predate activity tracking. */
  last_login_at: number | null;
  last_seen_at: number | null;
  password_changed_at: number | null;
  invited_at: number | null;
  created_by: UserActorRef | null;
  must_change_password: boolean;
  status: UserStatus;
}

export type AccessLevel = "full" | "view_only" | "none";

export interface RoleModuleAccess {
  key: string;
  label: string;
  level: AccessLevel;
  /** The page is still a placeholder in the app. */
  coming_soon: boolean;
}

/** GET /roles — built from the backend's real PERMISSIONS. */
export interface RoleInfo {
  role: StaffRole;
  label: string;
  description: string;
  modules: RoleModuleAccess[];
  /** Whether the signed-in user may assign this role / manage users who have it. */
  assignable: boolean;
}

export type UserTab = "all" | StaffRole | "deactivated";

export interface UserStats {
  tabs: Record<UserTab, number>;
  active: number;
}

export interface UserListParams {
  tab?: UserTab;
  search?: string;
  /** Omit for every matching row (e.g. export). */
  limit?: number;
  offset?: number;
}

export interface CreateStaffPayload {
  full_name: string;
  phone_number: string;
  email?: string;
  role: StaffRole;
  /** Required when role is "doctor". */
  doctor_id?: string;
}

/** Partial patch — contact/profile details only (role & status have their own endpoints). */
export interface UpdateStaffPayload {
  full_name?: string;
  phone_number?: string;
  email?: string;
  age?: number;
  gender?: string;
  state?: string;
  district?: string;
  address?: string;
}

// ---------- Schema ----------

export const staffContactSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required"),
  phone_number: z.string().trim().regex(INDIAN_MOBILE_REGEX, "Enter a valid 10-digit mobile number"),
  email: z.string().trim().email("Enter a valid email address").optional().or(z.literal("")),
});

export type StaffContactValues = z.infer<typeof staffContactSchema>;

// ---------- Service ----------

export const userService = {
  /** Every user, unfiltered (old behaviour) — used by the doctor form's login picker. */
  list: () => http.get<{ count: number; users: ApiUser[] }>(API_ENDPOINTS.users.list),

  /** Staff only, filtered server-side. */
  listPage: (params: UserListParams) =>
    http.get<{ count: number; users: ApiUser[] }>(API_ENDPOINTS.users.list, {
      params: { ...params, tab: params.tab ?? "all", search: params.search || undefined },
    }),

  stats: () => http.get<UserStats>(API_ENDPOINTS.users.stats),

  roles: () => http.get<{ roles: RoleInfo[] }>(API_ENDPOINTS.roles),

  /** Returns the temporary password ONCE — show it, never store it. */
  create: (payload: CreateStaffPayload) =>
    http.post<{ user: ApiUser; temporary_password: string }>(API_ENDPOINTS.users.list, payload),

  update: (id: string, payload: UpdateStaffPayload) =>
    http.patch<{ user: ApiUser }>(API_ENDPOINTS.users.detail(id), payload),

  deactivate: (id: string) => http.post<{ user: ApiUser }>(API_ENDPOINTS.users.deactivate(id)),

  reactivate: (id: string) => http.post<{ user: ApiUser }>(API_ENDPOINTS.users.reactivate(id)),

  changeRole: (id: string, role: StaffRole, doctorId?: string) =>
    http.patch<{ user: ApiUser }>(API_ENDPOINTS.users.role(id), { role, ...(doctorId ? { doctor_id: doctorId } : {}) }),

  /** New temporary password (shown once). Also "Resend invite". */
  resetPassword: (id: string) =>
    http.post<{ user: ApiUser; temporary_password: string }>(API_ENDPOINTS.users.resetPassword(id)),
};

// ---------- Display helpers ----------

export const ROLE_TAB_LABELS: Record<UserTab, string> = {
  all: "All",
  system_admin: "System admin",
  admin: "Admin",
  reception: "Reception",
  doctor: "Doctors",
  pharmacy: "Pharmacy",
  lab: "Lab",
  account: "Accounts",
  deactivated: "Deactivated",
};

/** "Online now" = seen within the last 5 minutes (last_seen_at is written at most every 5 min). */
export const ONLINE_WINDOW_MS = 5 * 60 * 1000;

const TZ = "Asia/Kolkata";
const ymd = (ms: number) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(ms));

/** "4:48 PM" in clinic time. */
export function formatClockTime(ms: number): string {
  return new Date(ms).toLocaleTimeString("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" });
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "14 Aug 2026" in clinic time — months spelled by hand (en-GB gives "Sept"). */
export function formatDay(ms: number): string {
  const [y, m, d] = ymd(ms).split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** "Today, 4:48 PM" / "Yesterday, 6:05 PM" / "30 Sep 2026, 6:05 PM". */
export function formatDayTime(ms: number, nowMs: number): string {
  const day = ymd(ms);
  if (day === ymd(nowMs)) return `Today, ${formatClockTime(ms)}`;
  if (day === ymd(nowMs - 86_400_000)) return `Yesterday, ${formatClockTime(ms)}`;
  return `${formatDay(ms)}, ${formatClockTime(ms)}`;
}

/** Last-active cell / drawer line. Never invents activity for older accounts. */
export function describeLastActive(
  user: Pick<ApiUser, "status" | "last_seen_at" | "last_login_at" | "invited_at">,
  nowMs: number
): { primary: string; secondary: string | null; online: boolean } {
  if (user.status === "invite_sent") {
    return {
      primary: "Never logged in",
      secondary: user.invited_at ? `Invited ${formatDay(user.invited_at).replace(/ \d{4}$/, "")}` : null,
      online: false,
    };
  }
  const ts = user.last_seen_at ?? user.last_login_at;
  if (!ts) return { primary: "No activity recorded yet", secondary: null, online: false };
  const diff = nowMs - ts;
  if (diff < ONLINE_WINDOW_MS && user.status === "active") return { primary: "Online now", secondary: null, online: true };
  if (diff < 60 * 60 * 1000) return { primary: `${Math.max(1, Math.floor(diff / 60000))} min ago`, secondary: formatDayTime(ts, nowMs), online: false };
  const day = ymd(ts);
  if (day === ymd(nowMs)) return { primary: "Today", secondary: formatClockTime(ts), online: false };
  if (day === ymd(nowMs - 86_400_000)) return { primary: "Yesterday", secondary: formatClockTime(ts), online: false };
  const days = Math.floor(diff / 86_400_000);
  if (days < 7) return { primary: `${days} days ago`, secondary: formatDay(ts).replace(/ \d{4}$/, ""), online: false };
  if (days < 35) return { primary: `${Math.floor(days / 7)} week${days < 14 ? "" : "s"} ago`, secondary: formatDay(ts).replace(/ \d{4}$/, ""), online: false };
  return { primary: formatDay(ts), secondary: null, online: false };
}

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

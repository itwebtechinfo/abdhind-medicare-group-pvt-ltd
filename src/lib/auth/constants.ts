import type { UserRole } from "./types";

/** Mock credentials per role — replace with API auth later */
export const MOCK_ROLE_CREDENTIALS: Record<
  string,
  { password: string; role: UserRole }
> = {
  system_admin: { password: "admin1", role: "system_admin" },
  admin: { password: "admin1", role: "admin" },
  account: { password: "account1", role: "account" },
  doctor: { password: "doctor1", role: "doctor" },
  reception: { password: "reception1", role: "reception" },
  patient: { password: "patient1", role: "patient" },
  pharmacy: { password: "pharmacy1", role: "pharmacy" },
  lab: { password: "lab1", role: "lab" },
};

/** @deprecated Use MOCK_ROLE_CREDENTIALS — kept for backward compatibility */
export const TEMP_CREDENTIALS = {
  username: "admin",
  password: "admin1",
} as const;

export const AUTH_STORAGE_KEYS = {
  session: "abdhind_auth_session",
  remember: "abdhind_auth_remember",
  rememberedUsername: "abdhind_auth_username",
  accessToken: "abdhind_access_token",
  refreshToken: "abdhind_refresh_token",
  theme: "abdhind_theme",
} as const;

export const AUTH_ROUTES = {
  login: "/login",
  dashboard: "/dashboard",
  unauthorized: "/unauthorized",
} as const;

/** Route prefixes that require authentication */
export const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/appointments",
  "/patients",
  "/admin",
  "/reports",
  "/settings",
  "/profile",
] as const;

export function isErpPath(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/** Mock access token TTL — 8 hours (ready for JWT expiry parity) */
export const ACCESS_TOKEN_TTL_MS = 8 * 60 * 60 * 1000;

/** Remembered sessions stay signed in for 30 days in the mock auth layer. */
export const REMEMBERED_ACCESS_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

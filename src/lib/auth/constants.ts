import type { UserRole } from "./types";

/** Mock credentials per role — replace with API auth later */
export const MOCK_ROLE_CREDENTIALS: Record<
  string,
  { password: string; role: UserRole }
> = {
  system_admin: { password: "admin", role: "system_admin" },
  admin: { password: "admin", role: "admin" },
  account: { password: "account", role: "account" },
  doctor: { password: "doctor", role: "doctor" },
  reception: { password: "reception", role: "reception" },
  patient: { password: "patient", role: "patient" },
  pharmacy: { password: "pharmacy", role: "pharmacy" },
  lab: { password: "lab", role: "lab" },
};

/** @deprecated Use MOCK_ROLE_CREDENTIALS — kept for backward compatibility */
export const TEMP_CREDENTIALS = {
  username: "admin",
  password: "admin",
} as const;

export const AUTH_STORAGE_KEYS = {
  session: "abdhind_auth_session",
  remember: "abdhind_auth_remember",
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

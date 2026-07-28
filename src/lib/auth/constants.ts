import type { UserRole } from "./types";

/**
 * Mock credentials per role, keyed by demo phone number — replace with API auth later.
 * Login is phone-based, so each role gets a fake 10-digit number instead of a
 * role-name login id.
 */
export const MOCK_ROLE_CREDENTIALS: Record<
  string,
  { password: string; role: UserRole }
> = {
  "9999900001": { password: "admin1", role: "system_admin" },
  "9999900002": { password: "admin1", role: "admin" },
  "9999900003": { password: "account1", role: "account" },
  "9999900004": { password: "doctor1", role: "doctor" },
  "9999900005": { password: "reception1", role: "reception" },
  "9999900006": { password: "patient1", role: "patient" },
  "9999900007": { password: "pharmacy1", role: "pharmacy" },
  "9999900008": { password: "lab1", role: "lab" },
};

export const AUTH_STORAGE_KEYS = {
  session: "abdhind_auth_session",
  remember: "abdhind_auth_remember",
  rememberedPhone: "abdhind_auth_phone",
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

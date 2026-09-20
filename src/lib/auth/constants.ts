export const AUTH_STORAGE_KEYS = {
  session: "abdhind_auth_session",
  remember: "abdhind_auth_remember",
  rememberedPhone: "abdhind_auth_phone",
  accessToken: "abdhind_access_token",
  refreshToken: "abdhind_refresh_token",
  theme: "abdhind_theme",
} as const;

export const AUTH_ROUTES = {
  /** Single source of truth for "not authenticated" bounces from a protected page. */
  login: "/login",
  dashboard: "/dashboard",
  unauthorized: "/unauthorized",
  /** The public marketing homepage — not used as a logged-out redirect target. */
  home: "/",
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
  "/pharmacy",
  "/lab",
  "/whatsapp",
] as const;

export function isErpPath(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

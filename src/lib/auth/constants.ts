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
  /** Where a visitor with no/expired session gets bounced from a protected page. */
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

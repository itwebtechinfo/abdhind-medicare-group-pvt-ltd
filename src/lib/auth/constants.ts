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
  /** Forced after signing in with a temporary password; also self-service. */
  changePassword: "/change-password",
  dashboard: "/dashboard",
  unauthorized: "/unauthorized",
  /** The public marketing homepage — not used as a logged-out redirect target. */
  home: "/",
} as const;

// There is deliberately no list of "ERP paths". Which pages are protected and
// which chrome they get is decided by the route group a page lives in:
// app/(erp) = protected + ERP shell, app/(site) = website chrome,
// app/(auth) = bare card. See app/(erp)/layout.tsx.

/** Where to send someone after sign-in: `next` if it's a safe in-app path. */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  if (next === AUTH_ROUTES.login || next.startsWith(`${AUTH_ROUTES.login}?`)) return null;
  return next;
}

"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import {
  evaluateRouteGuard,
  type RouteGuardOptions,
} from "@/src/lib/auth/route-guard";
import { getRouteGuardForPath } from "@/src/lib/rbac/access";
import { AUTH_ROUTES } from "@/src/lib/auth/constants";

export function useRequireAuth(options: RouteGuardOptions = {}) {
  const { session, isLoading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const mergedOptions = useMemo(
    () => ({
      ...getRouteGuardForPath(pathname),
      ...options,
    }),
    [pathname, options]
  );

  const guard = evaluateRouteGuard(pathname, session, mergedOptions);

  // Computed synchronously here — in the same render the session goes
  // null (e.g. right after logout clears it) — so `isLoading` already
  // reflects the pending redirect before the browser ever paints. Setting
  // a "redirecting" flag from inside the effect below instead would still
  // leave one committed frame with isLoading=false/isAuthorized=false,
  // which is exactly what flashes ProtectedRoute's "not authorized"
  // fallback for a moment during logout. Permission/role redirects are
  // deliberately excluded — that fallback's "you don't have access"
  // message is informative there, not a flash to suppress.
  const isSignOutRedirect =
    !guard.allowed &&
    !!guard.redirectTo &&
    (guard.reason === "unauthenticated" || guard.reason === "expired");

  useEffect(() => {
    if (isLoading) return;

    if (!guard.allowed && guard.redirectTo) {
      router.replace(guard.redirectTo);
    }
  }, [isLoading, guard.allowed, guard.redirectTo, router]);

  return {
    isLoading: isLoading || isSignOutRedirect,
    isAuthenticated,
    isAuthorized: guard.allowed,
    guard,
    loginPath: AUTH_ROUTES.login,
  };
}

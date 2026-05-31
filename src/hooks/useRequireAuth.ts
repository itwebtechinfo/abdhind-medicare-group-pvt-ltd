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

  useEffect(() => {
    if (isLoading) return;

    if (!guard.allowed && guard.redirectTo) {
      router.replace(guard.redirectTo);
    }
  }, [isLoading, guard.allowed, guard.redirectTo, router]);

  return {
    isLoading,
    isAuthenticated,
    isAuthorized: guard.allowed,
    guard,
    loginPath: AUTH_ROUTES.login,
  };
}

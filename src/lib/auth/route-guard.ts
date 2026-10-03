import { AUTH_ROUTES } from "./constants";
import { ruleAllowsUser } from "@/src/lib/rbac/access";
import {
  getRouteAccessForPath,
  permissionsFromRule,
} from "@/src/lib/rbac/routes";
import { userHasPermission } from "@/src/lib/rbac/permissions";
import type { AuthSession, Permission, UserRole } from "./types";
import { tokenStorage } from "./token-storage";

export interface RouteGuardOptions {
  roles?: UserRole[];
  permissions?: Permission[];
  requireAllPermissions?: boolean;
}

export interface RouteGuardResult {
  allowed: boolean;
  reason?: "unauthenticated" | "expired" | "forbidden" | "role" | "permission";
  redirectTo?: string;
}

/** Called only for pages that ARE protected — i.e. from the (erp) layout's
 * ProtectedRoute — so every path that reaches it requires sign-in, plus the
 * permission rule from rbac/routes.ts if one matches. */
export function evaluateRouteGuard(
  pathname: string,
  session: AuthSession | null,
  options: RouteGuardOptions = {}
): RouteGuardResult {
  if (!session) {
    return {
      allowed: false,
      reason: "unauthenticated",
      redirectTo: AUTH_ROUTES.login,
    };
  }

  if (tokenStorage.isExpired(session.tokens.expiresAt)) {
    return {
      allowed: false,
      reason: "expired",
      redirectTo: AUTH_ROUTES.login,
    };
  }

  const routeRule = getRouteAccessForPath(pathname);
  if (routeRule && !ruleAllowsUser(routeRule, session.user.role, session.user.permissions)) {
    return {
      allowed: false,
      reason: "permission",
      redirectTo: AUTH_ROUTES.unauthorized,
    };
  }

  const routePerms = routeRule ? permissionsFromRule(routeRule) : undefined;
  const mergedOptions: RouteGuardOptions = {
    ...options,
    permissions: options.permissions ?? routePerms,
  };

  const { roles, permissions, requireAllPermissions = false } = mergedOptions;

  if (roles?.length && !roles.includes(session.user.role)) {
    return {
      allowed: false,
      reason: "role",
      redirectTo: AUTH_ROUTES.unauthorized,
    };
  }

  if (permissions?.length) {
    const hasAccess = requireAllPermissions
      ? permissions.every((p) =>
          userHasPermission(session.user.permissions, p)
        )
      : permissions.some((p) =>
          userHasPermission(session.user.permissions, p)
        );

    if (!hasAccess) {
      return {
        allowed: false,
        reason: "permission",
        redirectTo: AUTH_ROUTES.unauthorized,
      };
    }
  }

  return { allowed: true };
}

export function hasPermission(
  session: AuthSession | null,
  permission: Permission
): boolean {
  if (!session) return false;
  return userHasPermission(session.user.permissions, permission);
}

export function hasRole(
  session: AuthSession | null,
  role: UserRole
): boolean {
  return session?.user.role === role;
}

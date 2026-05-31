import type { Permission, UserRole } from "@/src/lib/auth/types";

export interface RouteAccessRule {
  /** Path prefix or exact path */
  path: string;
  /** Required permission (any one if array) */
  permissions?: Permission | Permission[];
  /** Optional role allow-list */
  roles?: UserRole[];
  /** Match child paths under prefix */
  prefix?: boolean;
}

export const ROUTE_ACCESS_RULES: RouteAccessRule[] = [
  { path: "/dashboard", permissions: "dashboard:view" },
  { path: "/appointments", permissions: "appointments:view", prefix: true },
  { path: "/patients", permissions: "patients:view", prefix: true },
  { path: "/reports", permissions: "reports:view", prefix: true },
  { path: "/settings", permissions: "settings:view", prefix: true },
  { path: "/profile", permissions: "dashboard:view" },
  {
    path: "/admin",
    permissions: ["admin:view", "admin:manage"],
    prefix: true,
  },
];

export function getRouteAccessForPath(pathname: string): RouteAccessRule | null {
  const sorted = [...ROUTE_ACCESS_RULES].sort(
    (a, b) => b.path.length - a.path.length
  );

  for (const rule of sorted) {
    const matches = rule.prefix
      ? pathname === rule.path || pathname.startsWith(`${rule.path}/`)
      : pathname === rule.path;

    if (matches) return rule;
  }

  return null;
}

export function permissionsFromRule(
  rule: RouteAccessRule
): Permission[] | undefined {
  if (!rule.permissions) return undefined;
  return Array.isArray(rule.permissions)
    ? rule.permissions
    : [rule.permissions];
}

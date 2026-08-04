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
  { path: "/pharmacy", permissions: ["pharmacy:view", "pharmacy:manage"], prefix: true },
  { path: "/lab", permissions: ["lab:view", "lab:manage"], prefix: true },
  { path: "/profile", permissions: "dashboard:view" },
  {
    // Longest-path-first matching (see getRouteAccessForPath) means this is
    // checked before the generic /whatsapp rule below — broadcast/templates
    // stay admin-only even though the base inbox is open to reception too.
    path: "/whatsapp/broadcast",
    permissions: ["whatsapp_inbox:broadcast", "whatsapp_inbox:manage"],
    prefix: true,
  },
  {
    // Same admin-only gate as /whatsapp/broadcast above — the approved
    // template library and the request-a-new-one form live on the same
    // page, both broadcast-tier actions, not a reception one.
    path: "/whatsapp/templates",
    permissions: ["whatsapp_inbox:broadcast", "whatsapp_inbox:manage"],
    prefix: true,
  },
  {
    path: "/whatsapp",
    permissions: ["whatsapp_inbox:view", "whatsapp_inbox:manage"],
    prefix: true,
  },
  {
    // Checked before the generic /admin rule below (rules are matched
    // longest-path-first) — a role only needs users:view/manage here,
    // not admin:view/manage, so User Management can be granted to
    // roles that otherwise have no /admin access at all.
    path: "/admin/users",
    permissions: ["users:view", "users:manage"],
    prefix: true,
  },
  {
    // Same longest-path-first reasoning as /admin/users above — Doctors is
    // gated on doctors:view/manage in navigation.ts, not admin:view/manage.
    path: "/admin/doctors",
    permissions: ["doctors:view", "doctors:manage"],
    prefix: true,
  },
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

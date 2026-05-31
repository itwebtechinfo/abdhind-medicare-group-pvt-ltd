import type { Permission, UserRole } from "@/src/lib/auth/types";
import type { RouteGuardOptions } from "@/src/lib/auth/route-guard";
import { userHasPermission } from "./permissions";
import {
  ERP_NAV_SECTIONS,
  type ErpNavLink,
  type ErpNavSection,
} from "./navigation";
import {
  getRouteAccessForPath,
  permissionsFromRule,
  type RouteAccessRule,
} from "./routes";

function canSeeNavItem(
  userPermissions: Permission[],
  required?: Permission[]
): boolean {
  if (!required?.length) return true;
  return required.some((p) => userHasPermission(userPermissions, p));
}

function filterNavItem(item: ErpNavLink, permissions: Permission[]): ErpNavLink | null {
  if (!canSeeNavItem(permissions, item.permissions)) return null;

  if (item.children?.length) {
    const children = item.children.filter((c) =>
      canSeeNavItem(permissions, c.permissions)
    );
    if (children.length === 0 && item.href === "/reports") {
      return { ...item, children: undefined };
    }
    return { ...item, children: children.length ? children : undefined };
  }

  return item;
}

export function filterNavForUser(
  userPermissions: Permission[]
): ErpNavSection[] {
  return ERP_NAV_SECTIONS.map((section) => {
    const items = section.items
      .map((item) => filterNavItem(item, userPermissions))
      .filter((item): item is ErpNavLink => item !== null);

    return { ...section, items };
  }).filter((section) => section.items.length > 0);
}

export function getRouteGuardForPath(pathname: string): RouteGuardOptions {
  const rule = getRouteAccessForPath(pathname);
  if (!rule) return {};

  const permissions = permissionsFromRule(rule);
  const options: RouteGuardOptions = {};

  if (permissions?.length) {
    options.permissions = permissions;
    options.requireAllPermissions = false;
  }

  if (rule.roles?.length) {
    options.roles = rule.roles;
  }

  return options;
}

export function ruleAllowsUser(
  rule: RouteAccessRule | null,
  role: UserRole,
  permissions: Permission[]
): boolean {
  if (!rule) return true;

  if (rule.roles?.length && !rule.roles.includes(role)) {
    return false;
  }

  const required = permissionsFromRule(rule);
  if (!required?.length) return true;

  return required.some((p) => userHasPermission(permissions, p));
}

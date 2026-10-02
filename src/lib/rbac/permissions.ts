import type { Permission, PermissionAction } from "@/src/lib/auth/types";

export function perm(module: string, action: PermissionAction): Permission {
  return `${module}:${action}` as Permission;
}

// Role -> permission lists are defined ONLY in the backend (base.py PERMISSIONS)
// and arrive with the signed-in user (/auth/me). The old duplicate client-side
// table drifted from it and was unused, so it was removed.

export function userHasPermission(
  permissions: Permission[],
  permission: Permission
): boolean {
  if (permissions.includes(permission)) return true;
  // "module:manage" is a wildcard — implies view/create/edit/delete too.
  const [module] = permission.split(":");
  return permissions.includes(`${module}:manage` as Permission);
}

export function userCan(
  permissions: Permission[],
  module: string,
  action: PermissionAction
): boolean {
  return userHasPermission(permissions, perm(module, action));
}

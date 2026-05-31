import type { Permission, PermissionAction, UserRole } from "@/src/lib/auth/types";

export function perm(module: string, action: PermissionAction): Permission {
  return `${module}:${action}` as Permission;
}

const allPatientPerms: Permission[] = [
  "patients:view",
  "patients:create",
  "patients:edit",
  "patients:delete",
  "patients:manage",
];

const allAppointmentPerms: Permission[] = [
  "appointments:view",
  "appointments:create",
  "appointments:edit",
  "appointments:delete",
  "appointments:manage",
];

const allDoctorPerms: Permission[] = [
  "doctors:view",
  "doctors:create",
  "doctors:edit",
  "doctors:delete",
  "doctors:manage",
];

const allReportPerms: Permission[] = [
  "reports:view",
  "reports:create",
  "reports:edit",
];

const allBillingPerms: Permission[] = [
  "billing:view",
  "billing:create",
  "billing:edit",
];

/** Full permission set for system administrators */
export const SYSTEM_ADMIN_PERMISSIONS: Permission[] = [
  "dashboard:view",
  ...allAppointmentPerms,
  ...allPatientPerms,
  ...allDoctorPerms,
  ...allReportPerms,
  ...allBillingPerms,
  "settings:view",
  "settings:manage",
  "admin:view",
  "admin:manage",
  "pharmacy:view",
  "pharmacy:manage",
  "lab:view",
  "lab:manage",
  "enquiry:view",
  "enquiry:manage",
];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  system_admin: SYSTEM_ADMIN_PERMISSIONS,
  admin: [
    "dashboard:view",
    ...allAppointmentPerms,
    ...allPatientPerms,
    ...allDoctorPerms,
    ...allReportPerms,
    ...allBillingPerms,
    "settings:view",
    "settings:manage",
    "admin:view",
    "admin:manage",
    "enquiry:view",
    "enquiry:manage",
  ],
  account: [
    "dashboard:view",
    "appointments:view",
    ...allReportPerms,
    ...allBillingPerms,
    "patients:view",
    "settings:view",
  ],
  doctor: [
    "dashboard:view",
    "appointments:view",
    "appointments:edit",
    "appointments:manage",
    "patients:view",
    "patients:edit",
    "reports:view",
    "reports:create",
  ],
  reception: [
    "dashboard:view",
    ...allAppointmentPerms,
    "patients:view",
    "patients:create",
    "patients:edit",
    "enquiry:view",
    "enquiry:manage",
    "reports:view",
  ],
  patient: ["dashboard:view", "appointments:view", "reports:view"],
  pharmacy: [
    "dashboard:view",
    "pharmacy:view",
    "pharmacy:manage",
    "patients:view",
    "reports:view",
  ],
  lab: [
    "dashboard:view",
    "lab:view",
    "lab:manage",
    "patients:view",
    "reports:view",
    "reports:create",
  ],
};

export function roleHasPermission(
  role: UserRole,
  permission: Permission
): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function userHasPermission(
  permissions: Permission[],
  permission: Permission
): boolean {
  if (permissions.includes(permission)) return true;
  const [module, action] = permission.split(":");
  if (action !== "view" && permissions.includes(`${module}:manage` as Permission)) {
    return true;
  }
  return false;
}

export function userCan(
  permissions: Permission[],
  module: string,
  action: PermissionAction
): boolean {
  return userHasPermission(permissions, perm(module, action));
}

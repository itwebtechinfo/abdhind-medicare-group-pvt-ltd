import type { UserRole } from "@/src/lib/auth/types";
import { AUTH_ROUTES } from "@/src/lib/auth/constants";

export const ROLE_LABELS: Record<UserRole, string> = {
  system_admin: "System Admin",
  admin: "Admin",
  account: "Account Section",
  doctor: "Doctor",
  reception: "Reception + Enquiry",
  patient: "Patient",
  pharmacy: "Pharmacy Section",
  lab: "Lab Section",
};

/** Post-login landing route per role */
export const ROLE_DASHBOARD_PATH: Record<UserRole, string> = {
  system_admin: AUTH_ROUTES.dashboard,
  admin: AUTH_ROUTES.dashboard,
  account: AUTH_ROUTES.dashboard,
  doctor: AUTH_ROUTES.dashboard,
  reception: AUTH_ROUTES.dashboard,
  patient: AUTH_ROUTES.dashboard,
  pharmacy: AUTH_ROUTES.dashboard,
  lab: AUTH_ROUTES.dashboard,
};

export function getDashboardPathForRole(role: UserRole): string {
  return ROLE_DASHBOARD_PATH[role] ?? AUTH_ROUTES.dashboard;
}

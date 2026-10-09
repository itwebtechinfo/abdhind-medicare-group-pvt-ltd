import type { Permission, UserRole } from "@/src/lib/auth/types";

/** Quick-links dashboard for roles without the clinic dashboard (no
 * dashboard:analytics and no appointments:manage). Links only — never
 * numbers: every figure in the app comes from the API. */
export interface QuickLinkItem {
  label: string;
  description: string;
  href: string;
  /** Shown only when the user holds it. */
  permission?: Permission;
}

export interface QuickLinksConfig {
  title: string;
  description: string;
  links: QuickLinkItem[];
}

const DEFAULT_CONFIG: QuickLinksConfig = {
  title: "Dashboard",
  description: "Jump to your work.",
  links: [{ label: "Profile", description: "Your account details", href: "/profile" }],
};

export const QUICK_LINKS_BY_ROLE: Partial<Record<UserRole, QuickLinksConfig>> = {
  account: {
    title: "Accounts",
    description: "Billing, reports and appointments.",
    links: [
      { label: "Billing", description: "Invoices and payments", href: "/coming-soon/invoices", permission: "billing:view" },
      { label: "Reports", description: "Clinic reports", href: "/reports", permission: "reports:view" },
      { label: "Appointments", description: "Today's and upcoming visits", href: "/appointments", permission: "appointments:view" },
      { label: "Patients", description: "Patient records", href: "/patients", permission: "patients:view" },
      { label: "Settings", description: "Clinic settings", href: "/settings", permission: "settings:view" },
    ],
  },
  pharmacy: {
    title: "Pharmacy",
    description: "Dispensing and stock.",
    links: [
      { label: "Pharmacy", description: "Dispense medicines, stock", href: "/pharmacy", permission: "pharmacy:view" },
      { label: "Patients", description: "Patient records", href: "/patients", permission: "patients:view" },
      { label: "Reports", description: "Clinic reports", href: "/reports", permission: "reports:view" },
    ],
  },
  lab: {
    title: "Laboratory",
    description: "Tests and results.",
    links: [
      { label: "Laboratory", description: "Test orders and results", href: "/lab", permission: "lab:view" },
      { label: "Patients", description: "Patient records", href: "/patients", permission: "patients:view" },
      { label: "Reports", description: "Clinic reports", href: "/reports", permission: "reports:view" },
    ],
  },
  patient: {
    title: "Welcome",
    description: "Your appointments and account.",
    links: [
      { label: "My appointments", description: "Book, reschedule or cancel", href: "/appointments", permission: "appointments:view" },
      { label: "My profile", description: "Your details", href: "/profile" },
    ],
  },
};

export function getQuickLinksConfig(role: UserRole | undefined): QuickLinksConfig {
  return (role && QUICK_LINKS_BY_ROLE[role]) || DEFAULT_CONFIG;
}

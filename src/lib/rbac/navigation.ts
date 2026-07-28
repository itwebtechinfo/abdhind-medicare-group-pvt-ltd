import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  Calendar,
  ClipboardList,
  FileText,
  FlaskConical,
  LayoutDashboard,
  MessageSquare,
  Pill,
  Settings,
  Stethoscope,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import type { Permission } from "@/src/lib/auth/types";

export type ErpNavLink = {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  permissions?: Permission[];
  children?: {
    name: string;
    href: string;
    permissions?: Permission[];
  }[];
};

export type ErpNavSection = {
  title: string;
  items: ErpNavLink[];
};

export const ERP_NAV_SECTIONS: ErpNavSection[] = [
  {
    title: "",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        permissions: ["dashboard:view"],
      },
    ],
  },
  {
    title: "Patient Management",
    items: [
      {
        name: "Patients",
        href: "/patients",
        icon: Users,
        permissions: ["patients:view"],
      },
      {
        name: "Appointments",
        href: "/appointments",
        icon: Calendar,
        permissions: ["appointments:view"],
      },
      {
        // Placeholder — no dedicated page yet, reuses /reports. The
        // ?section= param exists purely so the sidebar can tell this
        // apart from the other placeholder items below; the page content
        // itself is the same until a real Clinical Records page exists.
        name: "Clinical Records",
        href: "/reports?section=clinical-records",
        icon: ClipboardList,
        permissions: ["reports:view"],
        children: [
          {
            name: "Test Reports",
            href: "/reports?section=test-reports",
            permissions: ["reports:view"],
          },
          {
            name: "Prescriptions",
            href: "/reports?section=prescriptions",
            permissions: ["reports:view"],
          },
        ],
      },
      {
        name: "Enquiries",
        href: "/appointments?section=enquiries",
        icon: MessageSquare,
        permissions: ["enquiry:view", "enquiry:manage"],
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        name: "Doctors",
        href: "/admin/doctors",
        icon: Stethoscope,
        permissions: ["doctors:view", "doctors:manage"],
      },
      {
        name: "Departments",
        href: "/admin",
        icon: Building2,
        permissions: ["admin:view"],
      },
      {
        name: "Pharmacy",
        href: "/reports?section=pharmacy",
        icon: Pill,
        permissions: ["pharmacy:view", "pharmacy:manage"],
      },
      {
        name: "Laboratory",
        href: "/reports?section=lab",
        icon: FlaskConical,
        permissions: ["lab:view", "lab:manage"],
      },
      {
        // System admin sees this by default (their permissions include the
        // "users:manage" wildcard). Any other role only sees it once the
        // backend grants that role "users:view" or "users:manage" — see
        // the backend prompt for what that requires server-side.
        name: "User Management",
        href: "/admin/users",
        icon: UserCog,
        permissions: ["users:view", "users:manage"],
      },
      {
        name: "Settings",
        href: "/settings",
        icon: Settings,
        permissions: ["settings:view", "settings:manage"],
      },
    ],
  },
  {
    title: "Financial Management",
    items: [
      {
        name: "Reports",
        href: "/reports?section=reports",
        icon: BarChart3,
        permissions: ["reports:view", "billing:view"],
      },
      {
        name: "Invoices",
        href: "/reports?section=invoices",
        icon: FileText,
        permissions: ["billing:view", "billing:create"],
      },
      {
        name: "Payments",
        href: "/reports?section=payments",
        icon: Wallet,
        permissions: ["billing:view", "billing:edit"],
      },
    ],
  },
];

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
        name: "Clinical Records",
        href: "/reports",
        icon: ClipboardList,
        permissions: ["reports:view"],
        children: [
          { name: "Test Reports", href: "/reports", permissions: ["reports:view"] },
          {
            name: "Prescriptions",
            href: "/reports",
            permissions: ["reports:view"],
          },
        ],
      },
      {
        name: "Enquiries",
        href: "/appointments",
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
        href: "/reports",
        icon: Pill,
        permissions: ["pharmacy:view", "pharmacy:manage"],
      },
      {
        name: "Laboratory",
        href: "/reports",
        icon: FlaskConical,
        permissions: ["lab:view", "lab:manage"],
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
        href: "/reports",
        icon: BarChart3,
        permissions: ["reports:view", "billing:view"],
      },
      {
        name: "Invoices",
        href: "/reports",
        icon: FileText,
        permissions: ["billing:view", "billing:create"],
      },
      {
        name: "Payments",
        href: "/reports",
        icon: Wallet,
        permissions: ["billing:view", "billing:edit"],
      },
    ],
  },
];

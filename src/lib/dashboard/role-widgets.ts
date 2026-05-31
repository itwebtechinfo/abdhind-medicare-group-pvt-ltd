import type { UserRole } from "@/src/lib/auth/types";
import { ROLE_LABELS } from "@/src/lib/rbac/roles";

export type DashboardStat = {
  title: string;
  value: string;
  subtitle: string;
  progress: number;
  trend?: { value: string; up: boolean };
};

export type DashboardConfig = {
  title: string;
  description: string;
  stats: DashboardStat[];
  quickActions: { label: string; href: string; permission?: string }[];
  showRevenueChart: boolean;
  showAppointmentChart: boolean;
};

const baseActions = [
  { label: "Appointments", href: "/appointments", permission: "appointments:view" },
  { label: "Patients", href: "/patients", permission: "patients:view" },
  { label: "Reports", href: "/reports", permission: "reports:view" },
  { label: "Settings", href: "/settings", permission: "settings:view" },
];

export const DASHBOARD_BY_ROLE: Record<UserRole, DashboardConfig> = {
  system_admin: {
    title: "System Admin Dashboard",
    description: "Complete overview of clinic operations, finance, and system health.",
    stats: [
      { title: "Appointments Today", value: "24", subtitle: "Across all departments", progress: 65, trend: { value: "↑ 8%", up: true } },
      { title: "Active Patients", value: "1,842", subtitle: "Registered profiles", progress: 72, trend: { value: "↑ 3.2%", up: true } },
      { title: "Monthly Revenue", value: "₹2.4L", subtitle: "Paid invoices", progress: 55, trend: { value: "↑ 12%", up: true } },
      { title: "Low Stock Alerts", value: "3", subtitle: "Pharmacy items", progress: 15 },
    ],
    quickActions: baseActions,
    showRevenueChart: true,
    showAppointmentChart: true,
  },
  admin: {
    title: "Admin Dashboard",
    description: "Clinic operations, staff activity, and financial snapshot.",
    stats: [
      { title: "Today's Appointments", value: "18", subtitle: "Scheduled visits", progress: 58 },
      { title: "New Patients", value: "42", subtitle: "This month", progress: 40, trend: { value: "↑ 5%", up: true } },
      { title: "Revenue MTD", value: "₹1.9L", subtitle: "Collections", progress: 48 },
      { title: "Pending Enquiries", value: "7", subtitle: "Reception queue", progress: 30 },
    ],
    quickActions: baseActions,
    showRevenueChart: true,
    showAppointmentChart: true,
  },
  account: {
    title: "Accounts Dashboard",
    description: "Billing, invoices, payments, and financial reporting.",
    stats: [
      { title: "Outstanding Invoices", value: "8", subtitle: "Awaiting payment", progress: 45 },
      { title: "Collected Today", value: "₹42,500", subtitle: "Payments received", progress: 60, trend: { value: "↑ 6%", up: true } },
      { title: "Expenses MTD", value: "₹68,500", subtitle: "Clinic expenses", progress: 35 },
      { title: "Net This Month", value: "₹1.71L", subtitle: "Profit estimate", progress: 72, trend: { value: "Healthy", up: true } },
    ],
    quickActions: [
      { label: "Invoices", href: "/reports", permission: "billing:view" },
      { label: "Payments", href: "/reports", permission: "billing:view" },
      { label: "Reports", href: "/reports", permission: "reports:view" },
    ],
    showRevenueChart: true,
    showAppointmentChart: false,
  },
  doctor: {
    title: "Doctor Dashboard",
    description: "Today's schedule, patients, and clinical workload.",
    stats: [
      { title: "My Appointments", value: "9", subtitle: "Today", progress: 70 },
      { title: "Patients Seen", value: "6", subtitle: "Completed today", progress: 55 },
      { title: "Pending Reports", value: "4", subtitle: "Lab & imaging", progress: 40 },
      { title: "Follow-ups", value: "3", subtitle: "This week", progress: 25 },
    ],
    quickActions: [
      { label: "Schedule", href: "/appointments", permission: "appointments:view" },
      { label: "Patients", href: "/patients", permission: "patients:view" },
      { label: "Reports", href: "/reports", permission: "reports:view" },
    ],
    showRevenueChart: false,
    showAppointmentChart: true,
  },
  reception: {
    title: "Reception Dashboard",
    description: "Front desk appointments, enquiries, and patient check-ins.",
    stats: [
      { title: "Walk-ins Today", value: "12", subtitle: "Checked in", progress: 50 },
      { title: "Scheduled", value: "16", subtitle: "Appointments", progress: 65 },
      { title: "Open Enquiries", value: "7", subtitle: "Needs callback", progress: 35 },
      { title: "No-shows", value: "2", subtitle: "Today", progress: 10 },
    ],
    quickActions: [
      { label: "New Appointment", href: "/appointments", permission: "appointments:create" },
      { label: "Register Patient", href: "/patients", permission: "patients:create" },
      { label: "Enquiries", href: "/appointments", permission: "enquiry:view" },
    ],
    showRevenueChart: false,
    showAppointmentChart: true,
  },
  patient: {
    title: "Patient Portal",
    description: "Your appointments, reports, and care journey.",
    stats: [
      { title: "Upcoming Visit", value: "1", subtitle: "Next appointment", progress: 100 },
      { title: "Reports Available", value: "3", subtitle: "Download ready", progress: 60 },
      { title: "Prescriptions", value: "2", subtitle: "Active", progress: 40 },
      { title: "Messages", value: "0", subtitle: "From clinic", progress: 0 },
    ],
    quickActions: [
      { label: "My Appointments", href: "/appointments", permission: "appointments:view" },
      { label: "My Reports", href: "/reports", permission: "reports:view" },
    ],
    showRevenueChart: false,
    showAppointmentChart: false,
  },
  pharmacy: {
    title: "Pharmacy Dashboard",
    description: "Dispensing queue, stock levels, and prescriptions.",
    stats: [
      { title: "Orders Pending", value: "11", subtitle: "To dispense", progress: 55 },
      { title: "Low Stock", value: "3", subtitle: "Reorder needed", progress: 20 },
      { title: "Dispensed Today", value: "28", subtitle: "Completed", progress: 75 },
      { title: "Returns", value: "1", subtitle: "Today", progress: 5 },
    ],
    quickActions: [
      { label: "Inventory", href: "/reports", permission: "pharmacy:view" },
      { label: "Patients", href: "/patients", permission: "patients:view" },
    ],
    showRevenueChart: false,
    showAppointmentChart: false,
  },
  lab: {
    title: "Laboratory Dashboard",
    description: "Sample processing, pending tests, and report publishing.",
    stats: [
      { title: "Samples Today", value: "34", subtitle: "Received", progress: 68 },
      { title: "Pending Reports", value: "9", subtitle: "In processing", progress: 45 },
      { title: "Published Today", value: "22", subtitle: "Completed", progress: 80, trend: { value: "On track", up: true } },
      { title: "Critical Flags", value: "1", subtitle: "Needs review", progress: 10 },
    ],
    quickActions: [
      { label: "Test Queue", href: "/reports", permission: "lab:view" },
      { label: "Patients", href: "/patients", permission: "patients:view" },
    ],
    showRevenueChart: false,
    showAppointmentChart: false,
  },
};

export function getDashboardConfig(role: UserRole): DashboardConfig {
  return DASHBOARD_BY_ROLE[role] ?? DASHBOARD_BY_ROLE.admin;
}

export function getDashboardTitle(role: UserRole): string {
  return `${ROLE_LABELS[role]} — ${DASHBOARD_BY_ROLE[role]?.title ?? "Dashboard"}`;
}

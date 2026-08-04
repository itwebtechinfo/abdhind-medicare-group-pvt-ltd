"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  DollarSign,
  FileText,
  FlaskConical,
  Loader2,
  MessageSquare,
  Pill,
  Users,
  Wallet,
} from "lucide-react";
import { memo, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/src/hooks/useAuth";
import { usePermission } from "@/src/hooks/usePermission";
import { getDashboardConfig, type DashboardStat } from "@/src/lib/dashboard/role-widgets";
import { StatCard } from "@/src/components/dashboard/StatCard";
import { Can } from "@/src/components/rbac/PermissionGate";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { toast } from "@/src/lib/toast";
import type { NormalizedApiError } from "@/src/types/api";
import type { Permission, UserRole } from "@/src/lib/auth/types";
import { userHasPermission } from "@/src/lib/rbac/permissions";
import { dashboardService } from "@/src/features/dashboard/dashboard";
import { doctorQuickService } from "@/src/features/dashboard/dashboard";
import type { DashboardToday } from "@/src/features/dashboard/dashboard";

/** Roles GET /dashboard/today actually covers, per the API reference ("admin+, doctor, reception"). */
const TODAY_DASHBOARD_ROLES: UserRole[] = ["system_admin", "admin", "doctor", "reception"];

function deriveTodayStats(today: DashboardToday): DashboardStat[] {
  const pending = today.status_wise.PENDING ?? 0;
  const approved = today.status_wise.APPROVED ?? 0;
  const completed = today.status_wise.COMPLETED ?? 0;
  const pct = (n: number) => (today.total > 0 ? Math.round((n / today.total) * 100) : 0);
  return [
    { title: "Today's Appointments", value: String(today.total), subtitle: today.date, progress: 100 },
    { title: "Pending", value: String(pending), subtitle: "Awaiting approval", progress: pct(pending) },
    { title: "Approved", value: String(approved), subtitle: "Confirmed visits", progress: pct(approved) },
    { title: "Completed", value: String(completed), subtitle: "Seen today", progress: pct(completed) },
  ];
}

const Charts = dynamic(
  () =>
    import("@/src/components/dashboard/DashboardCharts").then((m) => ({
      default: function DashboardChartsBlock({
        showRevenue,
        showAppointment,
      }: {
        showRevenue: boolean;
        showAppointment: boolean;
      }) {
        return (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {showRevenue && (
              <div className="lg:col-span-2">
                <m.RevenueChart />
              </div>
            )}
            {showAppointment && (
              <div className={showRevenue ? "" : "lg:col-span-3"}>
                <m.AppointmentDonut />
              </div>
            )}
          </div>
        );
      },
    })),
  {
    loading: () => (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-64 lg:col-span-2" />
        <Skeleton className="h-64" />
      </div>
    ),
    ssr: false,
  }
);

const STAT_ICONS = [
  Calendar,
  Users,
  DollarSign,
  AlertTriangle,
] as const;

function RoleDashboardComponent() {
  const { user } = useAuth();
  const { can, permissions } = usePermission();
  const role = user?.role ?? "admin";
  const config = useMemo(() => getDashboardConfig(role), [role]);
  const queryClient = useQueryClient();

  const hasTodayEndpoint = TODAY_DASHBOARD_ROLES.includes(role);

  const { data: today } = useQuery({
    queryKey: ["dashboard", "today"],
    queryFn: async () => (await dashboardService.today()).data,
    enabled: hasTodayEndpoint,
  });

  const stats = today ? deriveTodayStats(today) : config.stats;

  // Not doctor-only: any role that can confirm appointments (admin, reception,
  // system_admin too) gets the same quick-approve surface on their dashboard.
  const canManageAppointments = can("appointments:manage");

  const { data: pendingApprovals = [] } = useQuery({
    queryKey: ["doctor", "pending"],
    queryFn: async () => (await doctorQuickService.pending()).data.appointments,
    enabled: canManageAppointments,
  });

  const approveMutation = useMutation({
    mutationFn: (appointmentId: string) => doctorQuickService.approve(appointmentId),
    onSuccess: (res) => {
      toast.success(res.msg);
      queryClient.invalidateQueries({ queryKey: ["doctor", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "today"] });
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const visibleActions = config.quickActions.filter((action) => {
    if (!action.permission) return true;
    return userHasPermission(permissions, action.permission as Permission);
  });

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {config.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          {config.description}
          {user?.displayName ? (
            <span className="hidden sm:inline">
              {" "}
              — Welcome, {user.displayName.split(" ")[0]}
            </span>
          ) : null}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = STAT_ICONS[index % STAT_ICONS.length];
          return (
            <StatCard
              key={stat.title}
              {...stat}
              icon={<Icon className="h-[18px] w-[18px]" />}
            />
          );
        })}
      </div>

      {canManageAppointments && pendingApprovals.length > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Pending Approvals</h2>
          <div className="space-y-2">
            {pendingApprovals.map((appt) => (
              <div
                key={appt.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{appt.patient?.full_name ?? "Patient"}</p>
                  <p className="text-xs text-muted-foreground">
                    {appt.appointment_datetime.replace("T", " ")}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="gap-1.5"
                  disabled={approveMutation.isPending}
                  onClick={() => approveMutation.mutate(appt.id)}
                >
                  {approveMutation.isPending && approveMutation.variables === appt.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Approve
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {today && today.appointments.length > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Today&rsquo;s Appointments</h2>
          <div className="space-y-2">
            {today.appointments.map((appt) => (
              <div
                key={appt.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{appt.patient?.full_name ?? "Patient"}</p>
                  <p className="text-xs text-muted-foreground">
                    {appt.doctor?.full_name ?? "—"} · {appt.appointment_datetime.replace("T", " ")}
                  </p>
                </div>
                <Badge variant="secondary">{appt.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {(config.showRevenueChart || config.showAppointmentChart) && (
        <div className="mt-4">
          <Charts
            showRevenue={config.showRevenueChart}
            showAppointment={config.showAppointmentChart}
          />
        </div>
      )}

      {visibleActions.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {visibleActions.map((action) => (
            <Button key={action.label} variant="outline" size="sm" asChild>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Can module="appointments" action="create">
          <QuickLink href="/appointments" icon={Calendar} label="New Appointment" />
        </Can>
        <Can module="patients" action="create">
          <QuickLink href="/patients" icon={Users} label="Add Patient" />
        </Can>
        {can("reports:view") && (
          <QuickLink href="/reports" icon={FileText} label="View Reports" />
        )}
        {can("pharmacy:view") && (
          <QuickLink href="/reports" icon={Pill} label="Pharmacy" />
        )}
        {can("lab:view") && (
          <QuickLink href="/reports" icon={FlaskConical} label="Laboratory" />
        )}
        {can("billing:view") && (
          <QuickLink href="/reports" icon={Wallet} label="Billing" />
        )}
        {can("enquiry:view") && (
          <QuickLink href="/appointments" icon={MessageSquare} label="Enquiries" />
        )}
        {can("settings:view") && (
          <QuickLink href="/settings" icon={AlertTriangle} label="Settings" />
        )}
      </div>
    </div>
  );
}

const QuickLink = memo(function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Calendar;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card px-3 py-4 text-center text-xs font-semibold shadow-sm transition hover:border-primary/40 hover:bg-muted/50 hover:text-primary sm:text-sm"
    >
      <Icon className="h-5 w-5 text-primary" />
      {label}
    </Link>
  );
});

export const RoleDashboard = memo(RoleDashboardComponent);

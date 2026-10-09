"use client";

import Link from "next/link";
import { memo } from "react";
import { ArrowRight } from "lucide-react";
import { usePermission } from "@/src/hooks/usePermission";
import { userHasPermission } from "@/src/lib/rbac/permissions";
import { getQuickLinksConfig } from "@/src/lib/dashboard/role-widgets";
import { ClinicDashboard } from "@/src/features/dashboard/ClinicDashboard";

/** /dashboard: the clinic dashboard for staff who run the clinic (the
 * backend enforces the same rule), quick links for everyone else. */
function RoleDashboardComponent() {
  const { can } = usePermission();
  if (can("dashboard:analytics") || can("appointments:manage")) return <ClinicDashboard />;
  return <QuickLinksDashboard />;
}

function QuickLinksDashboard() {
  const { role, permissions } = usePermission();
  const config = getQuickLinksConfig(role);
  const links = config.links.filter((l) => !l.permission || userHasPermission(permissions, l.permission));

  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{config.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground sm:text-base">{config.description}</p>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((l) => (
          <Link
            key={l.href + l.label}
            href={l.href}
            className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/40 hover:bg-muted/50"
          >
            <span>
              <span className="block font-semibold">{l.label}</span>
              <span className="block text-sm text-muted-foreground">{l.description}</span>
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </div>
  );
}

export const RoleDashboard = memo(RoleDashboardComponent);

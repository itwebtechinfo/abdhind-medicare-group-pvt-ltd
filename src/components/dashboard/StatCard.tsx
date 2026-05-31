"use client";

import { memo, type ReactNode } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";
import type { DashboardStat } from "@/src/lib/dashboard/role-widgets";

interface StatCardProps extends DashboardStat {
  icon: ReactNode;
  iconClassName?: string;
}

export const StatCard = memo(function StatCard({
  title,
  value,
  subtitle,
  progress,
  trend,
  icon,
  iconClassName = "bg-primary/10 text-primary",
}: StatCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              iconClassName
            )}
          >
            {icon}
          </div>
        </div>
        <p className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">{subtitle}</p>
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-semibold",
                trend.up ? "text-primary" : "text-muted-foreground"
              )}
            >
              {trend.up ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend.value}
            </span>
          )}
        </div>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
});

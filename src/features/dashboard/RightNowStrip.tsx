"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/src/components/ui/skeleton";
import { POLL_INTERVALS } from "@/src/lib/polling";
import { cn } from "@/src/lib/utils";
import { APPT_UI } from "@/src/features/appointments/StatusBadge";
import { OPEN_NOTIFICATIONS_EVENT } from "@/src/features/notifications/notification";
import { dashboardService, type DashboardNow } from "./dashboard";

export const DASHBOARD_NOW_QUERY_KEY = ["dashboard", "now"] as const;

const ITEMS: { key: keyof Omit<DashboardNow, "updated_at">; label: (n: number) => string; href: string }[] = [
  { key: "chats_waiting", label: (n) => `WhatsApp chat${n === 1 ? "" : "s"} waiting`, href: "/whatsapp" },
  { key: "approvals_pending", label: (n) => `appointment${n === 1 ? "" : "s"} need approval`, href: "/appointments?tab=needs_approval" },
  { key: "enquiries_new", label: (n) => `enquir${n === 1 ? "y" : "ies"} to call back`, href: "/enquiries" },
  { key: "in_clinic", label: (n) => `patient${n === 1 ? "" : "s"} in clinic`, href: "/appointments?tab=today" },
];

/** Live counts that need someone now. Polls every 60s while the tab is
 * visible (React Query pauses it in the background) — the dashboard's only poll. */
export function RightNowStrip() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: DASHBOARD_NOW_QUERY_KEY,
    queryFn: async () => (await dashboardService.now()).data,
    refetchInterval: POLL_INTERVALS.dashboardNow,
  });
  const items = data ? ITEMS.filter((i) => data[i.key] !== undefined) : [];

  return (
    <section
      aria-label="Right now"
      className={cn(APPT_UI.card, "flex flex-col gap-3 px-4 py-3 text-sm lg:flex-row lg:items-center lg:justify-between")}
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="flex items-center gap-2 font-semibold">
          <span className="relative flex h-2.5 w-2.5" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-600" />
          </span>
          Right now
        </span>
        {isLoading ? (
          <Skeleton className="h-4 w-80" />
        ) : isError ? (
          <button type="button" className="text-muted-foreground underline-offset-2 hover:underline" onClick={() => refetch()}>
            Couldn&apos;t load — retry
          </button>
        ) : (
          items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="rounded-md text-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="font-semibold tabular-nums">{data?.[item.key] ?? 0}</span> {item.label(data?.[item.key] ?? 0)}
            </Link>
          ))
        )}
      </div>
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event(OPEN_NOTIFICATIONS_EVENT))}
        className="flex items-center gap-1 self-start font-semibold text-[#1F7A4A] hover:underline dark:text-emerald-400 lg:self-auto"
      >
        Open to-do <ArrowRight className="h-4 w-4" />
      </button>
    </section>
  );
}

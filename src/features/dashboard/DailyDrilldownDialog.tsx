"use client";

import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { BlockEmpty, BlockError } from "./BlockCard";
import { Skeleton } from "@/src/components/ui/skeleton";
import { dashboardService, formatCount, monthName } from "./dashboard";
import { VisitsChart } from "./VisitsChart";

interface DailyDrilldownDialogProps {
  /** "YYYY-MM", or null when closed. */
  month: string | null;
  doctorId?: string;
  onClose: () => void;
}

/** Day-by-day visits for one month — loaded only when a month bar is tapped. */
export function DailyDrilldownDialog({ month, doctorId, onClose }: DailyDrilldownDialogProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard", "daily", month, doctorId ?? null],
    queryFn: async () => (await dashboardService.daily(month as string, doctorId)).data,
    enabled: Boolean(month),
  });
  const year = month?.slice(0, 4) ?? "";
  const total = data?.days.reduce((n, d) => n + d.visits, 0) ?? 0;

  return (
    <Dialog open={Boolean(month)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {month ? monthName(month) : ""} {year} — visits by day
          </DialogTitle>
          <DialogDescription>
            {data ? `${formatCount(total)} visits. Dashed line: same days in ${Number(year) - 1}.` : "Loading…"}
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : isError || !data ? (
          <BlockError onRetry={() => refetch()} />
        ) : total === 0 && data.days.every((d) => d.last_year === 0) ? (
          <BlockEmpty />
        ) : (
          <div className="min-w-0">
            <VisitsChart
              data={{ granularity: "day", buckets: data.days.map((d) => ({ ...d, partial: false })) }}
              currentLabel={year}
              previousLabel={String(Number(year) - 1)}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

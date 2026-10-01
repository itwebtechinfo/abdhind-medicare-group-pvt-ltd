"use client";

import { cn } from "@/src/lib/utils";
import type { AppointmentTab, AppointmentTabCounts } from "./appointment";

export type { AppointmentTab };

export const APPOINTMENT_TABS: { id: AppointmentTab; label: string; showCount: boolean }[] = [
  { id: "today", label: "Today", showCount: true },
  { id: "needs_approval", label: "Needs approval", showCount: true },
  { id: "upcoming", label: "Upcoming", showCount: true },
  { id: "past", label: "Past", showCount: false },
  { id: "cancelled", label: "Cancelled & no-show", showCount: false },
];

interface AppointmentTabsProps {
  value: AppointmentTab;
  onChange: (tab: AppointmentTab) => void;
  counts: AppointmentTabCounts;
}

export function AppointmentTabs({ value, onChange, counts }: AppointmentTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Appointment views"
      className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-[#E3E9E5] bg-card p-1 dark:border-border"
    >
      {APPOINTMENT_TABS.map((tab) => {
        const active = tab.id === value;
        const count = counts[tab.id];
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-[#17261F] text-white dark:bg-foreground dark:text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {tab.label}
            {tab.showCount && (
              <span
                className={cn(
                  "min-w-5 rounded-full px-1.5 text-center text-xs tabular-nums",
                  active
                    ? "bg-white/20 text-white dark:bg-background/20 dark:text-background"
                    : tab.id === "needs_approval" && count > 0
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

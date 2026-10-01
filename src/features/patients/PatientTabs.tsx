"use client";

import { cn } from "@/src/lib/utils";
import type { PatientStats, PatientTab } from "./patient";

export const PATIENT_TABS: { id: PatientTab; label: string; statKey: keyof PatientStats }[] = [
  { id: "all", label: "All", statKey: "total" },
  { id: "upcoming_visit", label: "Upcoming visit", statKey: "upcoming_visit" },
  { id: "new_this_week", label: "New this week", statKey: "new_this_week" },
  { id: "missed_last_visit", label: "Missed last visit", statKey: "missed_last_visit" },
];

interface PatientTabsProps {
  value: PatientTab;
  onChange: (tab: PatientTab) => void;
  /** From GET /patients/stats — undefined while loading. */
  stats: PatientStats | undefined;
}

export function PatientTabs({ value, onChange, stats }: PatientTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Patient views"
      className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-[#E3E9E5] bg-card p-1 dark:border-border"
    >
      {PATIENT_TABS.map((tab) => {
        const active = tab.id === value;
        const count = stats?.[tab.statKey];
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
            <span
              className={cn(
                "min-w-5 rounded-full px-1.5 text-center text-xs tabular-nums",
                active
                  ? "bg-white/20 text-white dark:bg-background/20 dark:text-background"
                  : tab.id === "missed_last_visit" && (count ?? 0) > 0
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {count ?? "–"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

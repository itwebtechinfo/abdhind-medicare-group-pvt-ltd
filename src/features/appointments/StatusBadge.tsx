import { cn } from "@/src/lib/utils";
import type { DisplayStatus } from "./appointment";

/** Appointments-page palette from the redesign mockup. Each light value has
 * a dark-mode fallback onto the app's theme tokens, so dark mode keeps working. */
export const APPT_UI = {
  card: "rounded-xl border border-[#E3E9E5] bg-card dark:border-border",
  ink: "text-[#17261F] dark:text-foreground",
  primaryButton:
    "bg-[#1F7A4A] text-white shadow-none hover:bg-[#1F7A4A]/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90",
  dangerOutlineButton:
    "border-red-200 bg-background text-red-700 shadow-none hover:bg-red-50 hover:text-red-800 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10",
} as const;

export const STATUS_META: Record<
  DisplayStatus,
  { label: string; pill: string; dot: string; block: string }
> = {
  needs_approval: {
    label: "Needs approval",
    pill: "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    dot: "bg-amber-500",
    block: "border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200",
  },
  confirmed: {
    label: "Confirmed",
    pill: "bg-blue-50 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
    dot: "bg-blue-500",
    block: "border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-500/15 dark:text-blue-200",
  },
  in_clinic: {
    label: "In clinic",
    pill: "bg-teal-50 text-teal-800 dark:bg-teal-500/15 dark:text-teal-300",
    dot: "bg-teal-500",
    block: "border-teal-500 bg-teal-50 text-teal-900 dark:bg-teal-500/15 dark:text-teal-200",
  },
  completed: {
    label: "Completed",
    pill: "bg-green-50 text-green-800 dark:bg-green-500/15 dark:text-green-300",
    dot: "bg-green-600",
    block: "border-green-600 bg-green-50 text-green-900 dark:bg-green-500/15 dark:text-green-200",
  },
  no_show: {
    label: "No-show",
    pill: "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-300",
    dot: "bg-zinc-400",
    block: "border-zinc-400 bg-zinc-100 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-300",
  },
  cancelled: {
    label: "Cancelled",
    pill: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    dot: "bg-red-500",
    block: "border-red-400 bg-red-50 text-red-800 dark:bg-red-500/15 dark:text-red-300",
  },
};

export function StatusBadge({ status, className }: { status: DisplayStatus; className?: string }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium",
        meta.pill,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

import { cn } from "@/src/lib/utils";
import { STATUS_META } from "@/src/features/appointments/StatusBadge";
import type { EnquiryStatus } from "./enquiry";

/** Same soft pill palette as the Appointments page. */
export const ENQUIRY_STATUS_META: Record<EnquiryStatus, { label: string; pill: string; dot: string }> = {
  NEW: { label: "New", pill: STATUS_META.needs_approval.pill, dot: STATUS_META.needs_approval.dot },
  CONTACTED: { label: "Contacted", pill: STATUS_META.confirmed.pill, dot: STATUS_META.confirmed.dot },
  CONVERTED: { label: "Converted", pill: STATUS_META.completed.pill, dot: STATUS_META.completed.dot },
  CLOSED: { label: "Closed", pill: STATUS_META.no_show.pill, dot: STATUS_META.no_show.dot },
};

export function EnquiryStatusBadge({ status, className }: { status: EnquiryStatus; className?: string }) {
  const meta = ENQUIRY_STATUS_META[status];
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

import { cn } from "@/src/lib/utils";

/** Soft role colours, same pill style as the other redesigned pages. */
export const ROLE_BADGE_CLASS: Record<string, string> = {
  system_admin: "bg-violet-50 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
  admin: "bg-indigo-50 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300",
  reception: "bg-blue-50 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  doctor: "bg-teal-50 text-teal-800 dark:bg-teal-500/15 dark:text-teal-300",
  pharmacy: "bg-rose-50 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300",
  lab: "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  account: "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-300",
};

export function RoleBadge({ role, label, className }: { role: string; label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-semibold",
        ROLE_BADGE_CLASS[role] ?? ROLE_BADGE_CLASS.account,
        className
      )}
    >
      {label}
    </span>
  );
}

const STATUS_META: Record<string, { label: string; pill: string; dot: string }> = {
  active: {
    label: "Active",
    pill: "bg-green-50 text-green-800 dark:bg-green-500/15 dark:text-green-300",
    dot: "bg-green-600",
  },
  invite_sent: {
    label: "Invite sent",
    pill: "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  deactivated: {
    label: "Deactivated",
    pill: "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-300",
    dot: "bg-zinc-400",
  },
};

export function StaffStatusBadge({ status, className }: { status: string; className?: string }) {
  const meta = STATUS_META[status] ?? STATUS_META.active;
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium", meta.pill, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

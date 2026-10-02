"use client";

import { Eye, KeyRound, MoreVertical, RefreshCw, UserCog, UserX } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { cn } from "@/src/lib/utils";
import { avatarColor, initials } from "@/src/features/appointments/AppointmentRow";
import { APPT_UI } from "@/src/features/appointments/StatusBadge";
import { formatPatientPhone } from "@/src/features/patients/patient";
import { describeLastActive, type ApiUser, type RoleInfo } from "./user";
import { RoleBadge, StaffStatusBadge } from "./StaffBadges";

/** Shared with the header row. Fixed-width actions column so rows line up. */
export const STAFF_ROW_GRID =
  "md:grid md:grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,0.95fr)_120px_190px] md:items-center md:gap-4";

export interface StaffActions {
  onOpen: (u: ApiUser) => void;
  onEdit: (u: ApiUser) => void;
  onResetPassword: (u: ApiUser) => void;
  onChangeRole: (u: ApiUser) => void;
  onDeactivate: (u: ApiUser) => void;
  onReactivate: (u: ApiUser) => void;
}

/** Why an action is unavailable for this person, or null if allowed. */
export function blockedReason(
  action: "deactivate" | "role" | "reset" | "edit",
  u: ApiUser,
  isSelf: boolean,
  canManage: boolean,
  roleLabel: string
): string | null {
  if (isSelf) {
    if (action === "deactivate") return "You can't deactivate your own account.";
    if (action === "role") return "You can't change your own role. Ask another admin.";
    if (action === "reset") return "Use “Change password” to change your own password.";
    return null; // own contact details are editable
  }
  if (!canManage) return `Only a system admin can manage ${roleLabel} accounts.`;
  if (action === "reset" && u.status === "deactivated") return "Reactivate the account first.";
  return null;
}

interface StaffRowProps extends StaffActions {
  user: ApiUser;
  role: RoleInfo | undefined;
  isSelf: boolean;
  canManage: boolean;
  busy: boolean;
  nowMs: number;
}

export function StaffRow({ user: u, role, isSelf, canManage, busy, nowMs, ...actions }: StaffRowProps) {
  const label = role?.label ?? u.role;
  const active = describeLastActive(u, nowMs);
  const deactivated = u.status === "deactivated";
  const reason = (a: "deactivate" | "role" | "reset" | "edit") => blockedReason(a, u, isSelf, canManage, label);

  const primary = (() => {
    if (deactivated) {
      return reason("edit") ? null : (
        <Button size="sm" variant="outline" className="h-8 shadow-none" disabled={busy} onClick={() => actions.onReactivate(u)}>
          Reactivate
        </Button>
      );
    }
    if (u.status === "invite_sent" && !reason("reset")) {
      return (
        <Button size="sm" variant="outline" className="h-8 shadow-none" disabled={busy} onClick={() => actions.onResetPassword(u)}>
          Resend invite
        </Button>
      );
    }
    return reason("edit") ? null : (
      <Button size="sm" variant="outline" className="h-8 shadow-none" disabled={busy} onClick={() => actions.onEdit(u)}>
        Edit
      </Button>
    );
  })();

  const item = (
    a: "deactivate" | "role" | "reset",
    icon: React.ReactNode,
    text: string,
    run: () => void,
    destructive = false
  ) => {
    const why = reason(a);
    return (
      <DropdownMenuItem
        disabled={Boolean(why)}
        title={why ?? undefined}
        onSelect={run}
        className={cn(destructive && !why && "text-red-700 focus:text-red-800 dark:text-red-300")}
      >
        {icon}
        <span className="flex flex-col">
          {text}
          {why && <span className="text-[11px] font-normal text-muted-foreground">{why}</span>}
        </span>
      </DropdownMenuItem>
    );
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => actions.onOpen(u)}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          actions.onOpen(u);
        }
      }}
      className={cn(
        "flex cursor-pointer flex-col gap-3 border-b border-[#E3E9E5] px-4 py-3.5 text-sm transition-colors last:border-b-0 hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none dark:border-border md:px-5",
        STAFF_ROW_GRID,
        deactivated && "opacity-60"
      )}
    >
      {/* Staff member */}
      <div className="flex min-w-0 items-center gap-3">
        <span aria-hidden className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold", avatarColor(u.id))}>
          {initials(u.full_name)}
        </span>
        <div className="min-w-0">
          <p className={cn("flex items-center gap-2 font-semibold", APPT_UI.ink)}>
            <span className="truncate">{u.full_name}</span>
            {isSelf && (
              <span className="shrink-0 rounded bg-[#17261F] px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none text-white dark:bg-foreground dark:text-background">
                You
              </span>
            )}
          </p>
          <p className="truncate text-xs text-muted-foreground">{u.email || "No email"}</p>
        </div>
      </div>

      {/* Phone + role (side by side on mobile) */}
      <div className="grid grid-cols-2 gap-3 md:contents">
        <p className={cn("truncate tabular-nums", APPT_UI.ink)}>{formatPatientPhone(u.phone_number)}</p>
        <div className="min-w-0">
          <RoleBadge role={u.role} label={label} />
          {u.role === "doctor" && (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {u.linked_doctor ? `Linked: ${u.linked_doctor.full_name}` : "Not linked to a doctor record"}
            </p>
          )}
        </div>
      </div>

      {/* Last active + status */}
      <div className="flex items-center justify-between gap-3 md:contents">
        <div className="min-w-0">
          <p className={cn("flex items-center gap-1.5 truncate", active.online ? "font-medium text-green-700 dark:text-green-400" : APPT_UI.ink)}>
            {active.online && <span className="h-2 w-2 shrink-0 rounded-full bg-green-600" />}
            {active.primary}
          </p>
          {active.secondary && <p className="truncate text-xs text-muted-foreground">{active.secondary}</p>}
        </div>
        <div>
          <StaffStatusBadge status={u.status} />
        </div>
      </div>

      {/* Actions — clicks here never open the row. */}
      <div className="flex items-center gap-1.5 md:justify-end" onClick={(e) => e.stopPropagation()}>
        {primary ?? (
          <Button size="sm" variant="ghost" className="h-8" onClick={() => actions.onOpen(u)}>
            View
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" disabled={busy} onKeyDown={(e) => e.stopPropagation()}>
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More actions for {u.full_name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuItem onSelect={() => actions.onOpen(u)}>
              <Eye className="h-4 w-4" />
              View details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {item("reset", <KeyRound className="h-4 w-4" />, u.status === "invite_sent" ? "Resend invite" : "Reset password", () => actions.onResetPassword(u))}
            {!deactivated && item("role", <UserCog className="h-4 w-4" />, "Change role", () => actions.onChangeRole(u))}
            {deactivated
              ? item("deactivate", <RefreshCw className="h-4 w-4" />, "Reactivate", () => actions.onReactivate(u))
              : item("deactivate", <UserX className="h-4 w-4" />, "Deactivate", () => actions.onDeactivate(u), true)}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

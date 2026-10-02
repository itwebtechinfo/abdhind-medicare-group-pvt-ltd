"use client";

import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { cn } from "@/src/lib/utils";
import { formatCreatedAt } from "@/src/features/appointments/appointment";
import { avatarColor, initials } from "@/src/features/appointments/AppointmentRow";
import { APPT_UI } from "@/src/features/appointments/StatusBadge";
import { formatPatientPhone } from "@/src/features/patients/patient";
import { AUTH_ROUTES } from "@/src/lib/auth/constants";
import { describeLastActive, firstName, formatDay, formatDayTime, type ApiUser, type RoleInfo } from "./user";
import { RoleAccessList } from "./RoleAccessList";
import { RoleBadge, StaffStatusBadge } from "./StaffBadges";
import { blockedReason, type StaffActions } from "./StaffRow";

interface StaffDrawerProps extends Omit<StaffActions, "onOpen"> {
  user: ApiUser | null;
  role: RoleInfo | undefined;
  rolesLoading: boolean;
  isSelf: boolean;
  canManage: boolean;
  busy: boolean;
  nowMs: number;
  onClose: () => void;
}

/** Disabled buttons don't fire hover events, so the tooltip sits on a wrapper. */
function Gated({ reason, children, className }: { reason: string | null; children: React.ReactNode; className?: string }) {
  return reason ? (
    <span title={reason} className={cn("inline-flex", className)}>
      {children}
    </span>
  ) : (
    <>{children}</>
  );
}

export function StaffDrawer({ user, onClose, ...rest }: StaffDrawerProps) {
  return (
    <DialogPrimitive.Root open={Boolean(user)} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-card text-card-foreground shadow-2xl focus:outline-none sm:max-w-[520px] sm:border-l sm:border-[#E3E9E5] sm:dark:border-border"
        >
          {user && <Body key={user.id} user={user} {...rest} />}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function Body({
  user: u,
  role,
  rolesLoading,
  isSelf,
  canManage,
  busy,
  nowMs,
  ...actions
}: Omit<StaffDrawerProps, "user" | "onClose"> & { user: ApiUser }) {
  const label = role?.label ?? u.role;
  const active = describeLastActive(u, nowMs);
  const deactivated = u.status === "deactivated";
  const reason = (a: "deactivate" | "role" | "reset" | "edit") => blockedReason(a, u, isSelf, canManage, label);
  const first = firstName(u.full_name);

  const addedOn = formatCreatedAt(u.created_at).replace(/, \d.*$/, "");
  const account: { label: string; value: string }[] = [
    { label: "Added", value: `${addedOn}${u.created_by?.name ? `, by ${u.created_by.name}` : ""}` },
    { label: "Last login", value: u.last_login_at ? formatDayTime(u.last_login_at, nowMs) : u.status === "invite_sent" ? "Never logged in" : "No activity recorded yet" },
    { label: "Password changed", value: u.password_changed_at ? formatDay(u.password_changed_at) : "Not recorded" },
  ];
  if (u.must_change_password && u.status !== "deactivated") {
    account.push({ label: "Temporary password", value: "Must be changed at next sign-in" });
  }

  return (
    <>
      <div className="border-b border-[#E3E9E5] px-5 pb-5 pt-5 dark:border-border sm:px-6">
        <div className="flex items-start gap-4">
          <span aria-hidden className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold", avatarColor(u.id))}>
            {initials(u.full_name)}
          </span>
          <div className="min-w-0 flex-1">
            <DialogPrimitive.Title className={cn("truncate text-2xl font-semibold tracking-tight", APPT_UI.ink)}>
              {u.full_name}
              {isSelf && <span className="ml-2 align-middle text-xs font-medium text-muted-foreground">(you)</span>}
            </DialogPrimitive.Title>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {[u.email, formatPatientPhone(u.phone_number)].filter(Boolean).join(" · ")}
            </p>
          </div>
          <DialogPrimitive.Close className="-mr-1 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <StaffStatusBadge status={u.status} />
          <span className={cn("flex items-center gap-1.5", active.online && "font-medium text-green-700 dark:text-green-400")}>
            {active.online && <span className="h-2 w-2 rounded-full bg-green-600" />}
            {active.online ? "Online now" : active.primary === "No activity recorded yet" || active.primary === "Never logged in" ? active.primary : `Last active ${active.primary.toLowerCase()}`}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
        <section>
          <h3 className={cn("mb-3 text-sm font-semibold", APPT_UI.ink)}>Role</h3>
          <div className="flex items-start justify-between gap-4 rounded-xl border border-[#E3E9E5] p-4 dark:border-border">
            <div className="min-w-0">
              <RoleBadge role={u.role} label={label} />
              {u.linked_doctor && <p className="mt-1.5 text-xs text-muted-foreground">Linked to {u.linked_doctor.full_name}</p>}
              {rolesLoading ? <Skeleton className="mt-2 h-4 w-56" /> : <p className="mt-2 text-sm text-muted-foreground">{role?.description}</p>}
            </div>
            {!deactivated && (
              <Gated reason={reason("role")}>
                <Button size="sm" variant="outline" className="shrink-0 shadow-none" disabled={busy || Boolean(reason("role"))} onClick={() => actions.onChangeRole(u)}>
                  Change role
                </Button>
              </Gated>
            )}
          </div>
        </section>

        <section>
          <h3 className={cn("mb-2 text-sm font-semibold", APPT_UI.ink)}>What {first} can open</h3>
          {rolesLoading || !role ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : (
            <RoleAccessList modules={role.modules} />
          )}
          <p className="mt-2 text-xs text-muted-foreground">Access comes from the role. To give more access, change the role.</p>
        </section>

        <section>
          <h3 className={cn("mb-3 text-sm font-semibold", APPT_UI.ink)}>Account</h3>
          <dl className="grid grid-cols-[minmax(130px,auto)_1fr] gap-x-6 gap-y-3 text-sm">
            {account.map((row) => (
              <div key={row.label} className="contents">
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className={cn("min-w-0 break-words font-medium", APPT_UI.ink)}>{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-[#E3E9E5] bg-card px-5 py-4 dark:border-border sm:px-6">
        <Gated reason={reason("edit")} className="flex-1">
          <Button variant="outline" className="w-full flex-1 shadow-none" disabled={busy || Boolean(reason("edit"))} onClick={() => actions.onEdit(u)}>
            Edit details
          </Button>
        </Gated>
        {isSelf ? (
          <Button asChild variant="outline" className="flex-1 shadow-none">
            <Link href={AUTH_ROUTES.changePassword}>Change password</Link>
          </Button>
        ) : (
          <Gated reason={reason("reset")} className="flex-1">
            <Button variant="outline" className="w-full flex-1 shadow-none" disabled={busy || Boolean(reason("reset"))} onClick={() => actions.onResetPassword(u)}>
              {u.status === "invite_sent" ? "Resend invite" : "Reset password"}
            </Button>
          </Gated>
        )}
        <Gated reason={reason("deactivate")} className="flex-1">
          {deactivated ? (
            <Button className={cn("w-full flex-1", APPT_UI.primaryButton)} disabled={busy || Boolean(reason("deactivate"))} onClick={() => actions.onReactivate(u)}>
              Reactivate
            </Button>
          ) : (
            <Button
              variant="outline"
              className={cn("w-full flex-1", APPT_UI.dangerOutlineButton)}
              disabled={busy || Boolean(reason("deactivate"))}
              onClick={() => actions.onDeactivate(u)}
            >
              Deactivate
            </Button>
          )}
        </Gated>
      </div>
    </>
  );
}

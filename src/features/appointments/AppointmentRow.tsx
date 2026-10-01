"use client";

import {
  Building2,
  CalendarClock,
  CheckCircle2,
  Copy,
  Eye,
  Globe,
  Loader2,
  MessageCircle,
  MoreVertical,
  Phone,
  RefreshCw,
  Repeat,
  XCircle,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { toast } from "@/src/lib/toast";
import { cn } from "@/src/lib/utils";
import {
  formatClock,
  friendlyDate,
  maskPhone,
  sourceLabel,
  splitAppointmentDateTime,
  type ApiAppointment,
  type DisplayStatus,
} from "./appointment";
import { APPT_UI, StatusBadge } from "./StatusBadge";

/** Shared by the header row in AppointmentsBoard so columns line up. */
export const APPOINTMENT_ROW_GRID =
  "md:grid md:grid-cols-[84px_minmax(0,1.5fr)_minmax(0,1.15fr)_minmax(0,0.85fr)_132px_minmax(232px,auto)] md:items-center md:gap-4";

const AVATAR_COLORS = [
  "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  "bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
];

export function initials(name: string | undefined): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export function avatarColor(seed: string): string {
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function SourceIcon({ source, className }: { source: string; className?: string }) {
  const cls = cn("h-4 w-4 shrink-0", className);
  switch (source) {
    case "whatsapp":
      return <MessageCircle className={cn(cls, "text-[#25D366]")} />;
    case "follow_up":
      return <Repeat className={cls} />;
    case "web":
      return <Globe className={cls} />;
    case "phone":
      return <Building2 className={cls} />;
    default:
      return <CalendarClock className={cls} />;
  }
}

export interface AppointmentRowActions {
  onOpen: (a: ApiAppointment) => void;
  onApprove: (a: ApiAppointment) => void;
  onDecline: (a: ApiAppointment) => void;
  onArrive: (a: ApiAppointment) => void;
  onComplete: (a: ApiAppointment) => void;
  onReschedule: (a: ApiAppointment) => void;
  onCancel: (a: ApiAppointment) => void;
  onFollowUp: (a: ApiAppointment) => void;
}

interface AppointmentRowProps extends AppointmentRowActions {
  appointment: ApiAppointment;
  status: DisplayStatus;
  todayYmd: string;
  /** Show "Tomorrow" / "Wed, 30 Sep" above the time (every tab except Today). */
  showDate: boolean;
  /** An action for this row is in flight — disables its buttons (no double submits). */
  busy: boolean;
  canManage: boolean;
  canEdit: boolean;
}

const stop = (fn: () => void) => (e: React.MouseEvent) => {
  e.stopPropagation();
  fn();
};

export function AppointmentRow({
  appointment: a,
  status,
  todayYmd,
  showDate,
  busy,
  canManage,
  canEdit,
  ...actions
}: AppointmentRowProps) {
  const { date, minutes } = splitAppointmentDateTime(a.appointment_datetime);
  const clock = formatClock(minutes);
  const isToday = date === todayYmd;
  const name = a.patient?.full_name ?? "Unknown patient";
  const isOpenBooking = status === "needs_approval" || status === "confirmed" || status === "no_show";

  const primary = (() => {
    if (!canManage) return null;
    if (status === "needs_approval") {
      return (
        <>
          <Button
            size="sm"
            variant="outline"
            className={cn("h-8", APPT_UI.dangerOutlineButton)}
            disabled={busy}
            onClick={stop(() => actions.onDecline(a))}
          >
            Decline
          </Button>
          <Button size="sm" className={cn("h-8", APPT_UI.primaryButton)} disabled={busy} onClick={stop(() => actions.onApprove(a))}>
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Approve
          </Button>
        </>
      );
    }
    if ((status === "confirmed" || status === "no_show") && isToday) {
      return (
        <Button size="sm" variant="outline" className="h-8 shadow-none" disabled={busy} onClick={stop(() => actions.onArrive(a))}>
          {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Mark arrived
        </Button>
      );
    }
    if (status === "in_clinic") {
      return (
        <Button size="sm" className={cn("h-8", APPT_UI.primaryButton)} disabled={busy} onClick={stop(() => actions.onComplete(a))}>
          {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Mark done
        </Button>
      );
    }
    return null;
  })();

  const menuItems = [
    canEdit && isOpenBooking && { label: "Reschedule", icon: RefreshCw, onSelect: () => actions.onReschedule(a) },
    canManage && (status === "confirmed" || status === "no_show") && date <= todayYmd && {
      label: "Mark done",
      icon: CheckCircle2,
      onSelect: () => actions.onComplete(a),
    },
    canManage && status === "completed" && !a.follow_up_appointment_id && {
      label: "Book follow-up",
      icon: Repeat,
      onSelect: () => actions.onFollowUp(a),
    },
    canManage && (status === "confirmed" || status === "no_show" || status === "in_clinic") && {
      label: "Cancel appointment",
      icon: XCircle,
      destructive: true,
      onSelect: () => actions.onCancel(a),
    },
  ].filter(Boolean) as { label: string; icon: typeof Eye; destructive?: boolean; onSelect: () => void }[];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => actions.onOpen(a)}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          actions.onOpen(a);
        }
      }}
      className={cn(
        "flex cursor-pointer flex-col gap-3 border-b border-[#E3E9E5] px-4 py-3.5 text-sm transition-colors last:border-b-0 hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none dark:border-border md:px-5",
        APPOINTMENT_ROW_GRID,
        status === "needs_approval" && "bg-amber-50/60 hover:bg-amber-50 dark:bg-amber-500/5 dark:hover:bg-amber-500/10",
        status === "completed" && "opacity-60"
      )}
    >
      {/* Time (+ status on mobile) */}
      <div className="flex items-start justify-between gap-3 md:block">
        <div>
          {showDate && <p className="text-xs font-medium text-muted-foreground">{friendlyDate(date, todayYmd)}</p>}
          <p className={cn("text-lg font-semibold leading-tight tabular-nums", APPT_UI.ink)}>
            {clock.time}
            <span className="ml-1 text-xs font-normal text-muted-foreground md:ml-0 md:block">{clock.period}</span>
          </p>
        </div>
        <StatusBadge status={status} className="md:hidden" />
      </div>

      {/* Patient */}
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
            avatarColor(a.patient_id || name)
          )}
        >
          {initials(name)}
        </span>
        <div className="min-w-0">
          <p className={cn("truncate font-semibold", APPT_UI.ink)}>{name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {maskPhone(a.patient?.phone)}
            {a.reference_code && <> · {a.reference_code}</>}
          </p>
        </div>
      </div>

      {/* Doctor + booked via — side by side on mobile, separate columns on desktop */}
      <div className="grid grid-cols-2 gap-3 md:contents">
        <div className="min-w-0">
          <p className={cn("truncate", APPT_UI.ink)}>{a.doctor?.full_name ?? "—"}</p>
          {a.doctor?.specialization && (
            <p className="truncate text-xs text-muted-foreground">{a.doctor.specialization}</p>
          )}
        </div>

        {/* Booked via */}
        <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
          <SourceIcon source={a.source} />
          <span className="truncate">{sourceLabel(a.source)}</span>
        </div>
      </div>

      {/* Status (desktop) */}
      <div className="hidden md:block">
        <StatusBadge status={status} />
      </div>

      {/* Actions — clicks here never open the row, even on a button that just
          went disabled mid double-click (disabled buttons let clicks through). */}
      <div className="flex items-center gap-1.5 md:justify-end" onClick={(e) => e.stopPropagation()}>
        {primary ?? (
          <Button size="sm" variant="ghost" className="h-8" onClick={stop(() => actions.onOpen(a))}>
            View
          </Button>
        )}
        {a.patient?.phone ? (
          <Button
            asChild
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground"
            title={`Call ${name}`}
          >
            <a href={`tel:${a.patient.phone}`} onClick={(e) => e.stopPropagation()}>
              <Phone className="h-4 w-4" />
              <span className="sr-only">Call {name}</span>
            </a>
          </Button>
        ) : (
          // Keeps the action buttons aligned with rows that do have a phone.
          <span aria-hidden className="hidden h-8 w-8 md:block" />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground"
              disabled={busy}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onSelect={() => actions.onOpen(a)}>
              <Eye className="h-4 w-4" />
              View details
            </DropdownMenuItem>
            {a.reference_code && (
              <DropdownMenuItem
                onSelect={() => {
                  navigator.clipboard
                    ?.writeText(a.reference_code as string)
                    .then(() => toast.success("Booking ID copied"))
                    .catch(() => toast.error("Couldn't copy booking ID"));
                }}
              >
                <Copy className="h-4 w-4" />
                Copy booking ID
              </DropdownMenuItem>
            )}
            {menuItems.length > 0 && <DropdownMenuSeparator />}
            {menuItems.map((item) => (
              <DropdownMenuItem
                key={item.label}
                onSelect={item.onSelect}
                className={cn(item.destructive && "text-red-700 focus:text-red-800 dark:text-red-300")}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

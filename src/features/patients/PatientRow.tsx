"use client";

import Link from "next/link";
import { Copy, Eye, History, MessageCircle, MoreVertical, Pencil, Phone } from "lucide-react";
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
  dayMonth,
  formatClock,
  friendlyDateWithDay,
  getDisplayStatus,
  splitAppointmentDateTime,
} from "@/src/features/appointments/appointment";
import { avatarColor, initials } from "@/src/features/appointments/AppointmentRow";
import { APPT_UI, StatusBadge } from "@/src/features/appointments/StatusBadge";
import { formatPatientPhone, patientPhoneE164, type PatientListRow, type PatientVisitSummary } from "./patient";

/** Shared by the header row in PatientsBoard. Every column is minmax(0, …)
 * and every cell truncates, so no value can bleed into its neighbour. The
 * actions column is a fixed width: each row is its own grid, so an "auto"
 * column ("View" vs "Book visit") would shift every other column per row. */
export const PATIENT_ROW_GRID =
  "md:grid md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.05fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1.15fr)_200px] md:items-center md:gap-4";

export function patientMeta(p: { age: number | null; gender: string | null; uhid: string }): string {
  return [p.age != null ? String(p.age) : null, p.gender || null, p.uhid].filter(Boolean).join(" · ");
}

export function whatsappInboxHref(conversationId: string): string {
  return `/whatsapp?phone=${encodeURIComponent(conversationId)}`;
}

/** "Tomorrow, 2 Oct · 2:00 PM" + status pill — used by the row and the drawer card. */
export function NextAppointmentSummary({
  next,
  todayYmd,
}: {
  next: NonNullable<PatientVisitSummary["next_appointment"]>;
  todayYmd: string;
}) {
  const { date, minutes } = splitAppointmentDateTime(next.appointment_datetime);
  const clock = formatClock(minutes);
  return (
    <div className="min-w-0">
      <p className={cn("truncate text-sm font-medium", APPT_UI.ink)}>
        {friendlyDateWithDay(date, todayYmd)} · {clock.time} {clock.period}
      </p>
      <StatusBadge status={getDisplayStatus(next)} className="mt-1 px-2 py-0.5" />
    </div>
  );
}

/** Missed (red) beats last visit; otherwise last visit date + type, or "No visits yet". */
export function LastVisitSummary({ summary, todayYmd }: { summary: PatientVisitSummary; todayYmd: string }) {
  if (summary.missed) {
    const date = splitAppointmentDateTime(summary.missed.appointment_datetime).date;
    return <p className="truncate text-sm font-medium text-red-700 dark:text-red-400">Missed · {dayMonth(date, todayYmd)}</p>;
  }
  if (summary.last_visit) {
    const date = splitAppointmentDateTime(summary.last_visit.appointment_datetime).date;
    return (
      <div className="min-w-0">
        <p className={cn("truncate text-sm", APPT_UI.ink)}>{dayMonth(date, todayYmd)}</p>
        <p className="truncate text-xs text-muted-foreground">{summary.last_visit.kind}</p>
      </div>
    );
  }
  return <p className="truncate text-sm text-muted-foreground">No visits yet</p>;
}

interface PatientRowProps {
  patient: PatientListRow;
  todayYmd: string;
  canBook: boolean;
  canEdit: boolean;
  canWhatsApp: boolean;
  onOpen: (p: PatientListRow) => void;
  onBook: (p: PatientListRow) => void;
  onEdit: (p: PatientListRow) => void;
  onHistory: (p: PatientListRow) => void;
}

export function PatientRow({ patient: p, todayYmd, canBook, canEdit, canWhatsApp, ...actions }: PatientRowProps) {
  const summary = p.visit_summary;
  const tel = patientPhoneE164(p.phone);
  const showBook = canBook && !summary.next_appointment;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => actions.onOpen(p)}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          actions.onOpen(p);
        }
      }}
      className={cn(
        "flex cursor-pointer flex-col gap-3 border-b border-[#E3E9E5] px-4 py-3.5 text-sm transition-colors last:border-b-0 hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none dark:border-border md:px-5",
        PATIENT_ROW_GRID
      )}
    >
      {/* Patient */}
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
            avatarColor(p.id)
          )}
        >
          {initials(p.full_name)}
        </span>
        <div className="min-w-0">
          <p className={cn("truncate font-semibold", APPT_UI.ink)}>{p.full_name}</p>
          <p className="truncate text-xs text-muted-foreground">{patientMeta(p)}</p>
        </div>
      </div>

      {/* Contact + area — side by side on mobile, separate columns on desktop */}
      <div className="grid grid-cols-2 gap-3 md:contents">
        {/* Contact */}
        <div className="flex min-w-0 items-center gap-2">
          <span className={cn("truncate tabular-nums", APPT_UI.ink)}>{formatPatientPhone(p.phone)}</span>
          {canWhatsApp && p.whatsapp_conversation_id && (
            <Button
              asChild
              size="icon"
              variant="outline"
              className="h-7 w-7 shrink-0 shadow-none"
              title="Open WhatsApp chat"
            >
              <Link href={whatsappInboxHref(p.whatsapp_conversation_id)} onClick={(e) => e.stopPropagation()}>
                <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" />
                <span className="sr-only">Open WhatsApp chat with {p.full_name}</span>
              </Link>
            </Button>
          )}
        </div>

        {/* Area (address) */}
        <div className="min-w-0">
          <p className={cn("truncate", APPT_UI.ink)} title={p.address || undefined}>
            {p.address || <span className="text-muted-foreground">—</span>}
          </p>
        </div>
      </div>

      {/* Last visit + next appointment — side by side on mobile, separate columns on desktop */}
      <div className="grid grid-cols-2 gap-3 md:contents">
        {/* Last visit */}
        <div className="min-w-0">
          <p className="mb-0.5 text-xs text-muted-foreground md:hidden">Last visit</p>
          <LastVisitSummary summary={summary} todayYmd={todayYmd} />
        </div>

        {/* Next appointment */}
        <div className="min-w-0">
          <p className="mb-0.5 text-xs text-muted-foreground md:hidden">Next appointment</p>
          {summary.next_appointment ? (
            <NextAppointmentSummary next={summary.next_appointment} todayYmd={todayYmd} />
          ) : (
            <p className="truncate text-sm text-muted-foreground">None booked</p>
          )}
        </div>
      </div>

      {/* Actions — clicks here never open the row. */}
      <div className="flex items-center gap-1.5 md:justify-end" onClick={(e) => e.stopPropagation()}>
        {showBook ? (
          <Button size="sm" className={cn("h-8", APPT_UI.primaryButton)} onClick={() => actions.onBook(p)}>
            Book visit
          </Button>
        ) : (
          <Button size="sm" variant="ghost" className="h-8" onClick={() => actions.onOpen(p)}>
            View
          </Button>
        )}
        {canEdit && (
          <Button size="sm" variant="outline" className="h-8 shadow-none" onClick={() => actions.onEdit(p)}>
            Edit
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onKeyDown={(e) => e.stopPropagation()}>
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More actions for {p.full_name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => actions.onOpen(p)}>
              <Eye className="h-4 w-4" />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => actions.onHistory(p)}>
              <History className="h-4 w-4" />
              Full history
            </DropdownMenuItem>
            {canEdit && (
              <DropdownMenuItem onSelect={() => actions.onEdit(p)}>
                <Pencil className="h-4 w-4" />
                Edit details
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {tel && (
              <DropdownMenuItem asChild>
                <a href={`tel:${tel}`}>
                  <Phone className="h-4 w-4" />
                  Call
                </a>
              </DropdownMenuItem>
            )}
            {canWhatsApp && p.whatsapp_conversation_id && (
              <DropdownMenuItem asChild>
                <Link href={whatsappInboxHref(p.whatsapp_conversation_id)}>
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp chat
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onSelect={() => {
                navigator.clipboard
                  ?.writeText(p.uhid)
                  .then(() => toast.success("UHID copied"))
                  .catch(() => toast.error("Couldn't copy UHID"));
              }}
            >
              <Copy className="h-4 w-4" />
              Copy UHID
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

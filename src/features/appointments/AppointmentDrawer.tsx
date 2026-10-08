"use client";

import { useMemo, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronDown, Loader2, MessageSquareOff, Phone, Pill, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { usePermission } from "@/src/hooks/usePermission";
import { toast } from "@/src/lib/toast";
import { languageLabel, formatEpochMs } from "@/src/lib/format";
import { cn } from "@/src/lib/utils";
import type { NormalizedApiError } from "@/src/types/api";
import { doctorQuickService } from "@/src/features/dashboard/dashboard";
import { DispenseDialog } from "@/src/features/pharmacy/DispenseDialog";
import { LabOrdersSection } from "@/src/features/lab/LabOrdersSection";
import { PatientHistoryDialog } from "@/src/features/patients/PatientHistoryDialog";
import {
  appointmentService,
  formatClock,
  formatCreatedAt,
  friendlyDate,
  friendlyDateWithDay,
  getDisplayStatus,
  sourceLabel,
  splitAppointmentDateTime,
  type ApiAppointment,
  type AppointmentReminders,
  type AppointmentStatus,
} from "./appointment";
import { SourceIcon } from "./AppointmentRow";
import { APPT_UI, STATUS_META, StatusBadge } from "./StatusBadge";

const HISTORY_LIMIT = 5;

const AUDIT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: "Needs approval",
  APPROVED: "Confirmed",
  PATIENT_CONFIRMED: "Confirmed by patient",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const REMINDER_STAGES: { key: keyof AppointmentReminders; label: string }[] = [
  { key: "24h_sent", label: "24h" },
  { key: "2h_sent", label: "2h" },
  { key: "30m_sent", label: "30m" },
];

export interface AppointmentDrawerActions {
  /** Opens the approve dialog (optionally at a different time). */
  onApprove: (a: ApiAppointment) => void;
  onDecline: (a: ApiAppointment) => void;
  onArrive: (a: ApiAppointment) => void;
  onComplete: (a: ApiAppointment) => void;
  onReschedule: (a: ApiAppointment) => void;
  onCancel: (a: ApiAppointment) => void;
  onFollowUp: (a: ApiAppointment) => void;
}

interface AppointmentDrawerProps extends AppointmentDrawerActions {
  appointment: ApiAppointment | null;
  onClose: () => void;
  todayYmd: string;
  busy: boolean;
}

/** Right-side detail panel (full-screen on mobile). Closes on ×, Esc or backdrop click. */
export function AppointmentDrawer({ appointment, onClose, ...rest }: AppointmentDrawerProps) {
  return (
    <DialogPrimitive.Root open={Boolean(appointment)} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-card text-card-foreground shadow-2xl focus:outline-none sm:max-w-[480px] sm:border-l sm:border-[#E3E9E5] sm:dark:border-border"
        >
          {/* Keyed so per-appointment UI state (expanded sections, dialogs) resets on switch. */}
          {appointment && <DrawerBody key={appointment.id} appointment={appointment} {...rest} />}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function DrawerBody({
  appointment: a,
  todayYmd,
  busy,
  ...actions
}: Omit<AppointmentDrawerProps, "appointment" | "onClose"> & { appointment: ApiAppointment }) {
  const { can } = usePermission();
  const canManage = can("appointments:manage");
  const canEdit = can("appointments:edit");
  const [moreOpen, setMoreOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [dispenseOpen, setDispenseOpen] = useState(false);

  const status = getDisplayStatus(a);
  const { date, minutes } = splitAppointmentDateTime(a.appointment_datetime);
  const clock = formatClock(minutes);
  const isToday = date === todayYmd;
  const notFuture = date <= todayYmd;

  const { data: patientAppointments, isLoading: historyLoading } = useQuery({
    queryKey: ["appointments", "patient-history", a.patient_id],
    queryFn: async () => (await appointmentService.list({ patient_id: a.patient_id })).data.appointments,
    enabled: Boolean(a.patient_id),
  });

  const history = useMemo(() => {
    const all = [...(patientAppointments ?? [])].sort((x, y) =>
      x.appointment_datetime.localeCompare(y.appointment_datetime)
    );
    const firstId = all[0]?.id;
    // Previous visits only — this one and anything booked after it are left out.
    return all
      .filter((x) => x.id !== a.id && x.appointment_datetime < a.appointment_datetime)
      .reverse()
      .map((x) => ({
        appointment: x,
        kind: x.follow_up_of ? "Next Appointment" : x.id === firstId ? "First visit" : "Consultation",
        status: getDisplayStatus(x),
      }));
  }, [patientAppointments, a.id, a.appointment_datetime]);

  const { data: auditLog = [], isLoading: auditLoading } = useQuery({
    queryKey: ["appointments", a.id, "audit-log"],
    queryFn: async () => (await appointmentService.auditLog(a.id)).data.logs,
    enabled: moreOpen && canManage,
  });

  const exitHumanModeMutation = useMutation({
    mutationFn: () => doctorQuickService.exitHumanMode(a.patient?.phone as string),
    onSuccess: (res) => toast.success(res.msg),
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const patientDetails = [
    a.patient?.uhid || null,
    a.patient?.age != null ? `${a.patient.age}y` : null,
    a.patient?.gender || null,
    a.patient?.address || null,
  ]
    .filter(Boolean)
    .join(" · ");

  const details: { label: string; value: React.ReactNode }[] = [
    { label: "Booking ID", value: a.reference_code ?? "—" },
    {
      label: "Phone",
      value: a.patient?.phone ? (
        <a href={`tel:${a.patient.phone}`} className="inline-flex items-center gap-1.5 hover:underline">
          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
          {a.patient.phone}
        </a>
      ) : (
        "—"
      ),
    },
    {
      label: "Booked via",
      value: (
        <span className="inline-flex items-center gap-1.5">
          <SourceIcon source={a.source} className="h-3.5 w-3.5" />
          {sourceLabel(a.source)}
        </span>
      ),
    },
    { label: "Booked by", value: a.booked_by?.full_name ?? (a.source === "whatsapp" || a.source === "web" ? "Patient" : "—") },
    { label: "Created", value: formatCreatedAt(a.created_at) },
  ];
  if (a.arrived_at && status === "in_clinic") {
    const arrived = formatClock(splitAppointmentDateTime(a.arrived_at).minutes);
    details.push({ label: "Arrived", value: `${arrived.time} ${arrived.period}` });
  }
  if (status === "cancelled") {
    details.push({ label: "Cancellation reason", value: a.cancellation_reason || "No reason given" });
  }

  const footer: React.ReactNode[] = [];
  const declineBtn = (label: string, onClick: () => void) => (
    <Button key={label} variant="outline" className={cn("flex-1", APPT_UI.dangerOutlineButton)} disabled={busy} onClick={onClick}>
      {label}
    </Button>
  );
  const rescheduleBtn = canEdit && (
    <Button key="reschedule" variant="outline" className="flex-1 shadow-none" disabled={busy} onClick={() => actions.onReschedule(a)}>
      Reschedule
    </Button>
  );
  const primaryBtn = (label: string, onClick: () => void) => (
    <Button key={label} className={cn("flex-1", APPT_UI.primaryButton)} disabled={busy} onClick={onClick}>
      {busy && <Loader2 className="h-4 w-4 animate-spin" />}
      {label}
    </Button>
  );
  if (status === "needs_approval") {
    if (canManage) footer.push(declineBtn("Decline", () => actions.onDecline(a)));
    footer.push(rescheduleBtn);
    if (canManage) footer.push(primaryBtn("Approve", () => actions.onApprove(a)));
  } else if (status === "confirmed" || status === "no_show") {
    if (canManage) footer.push(declineBtn("Cancel", () => actions.onCancel(a)));
    footer.push(rescheduleBtn);
    if (canManage && isToday) footer.push(primaryBtn("Mark arrived", () => actions.onArrive(a)));
    else if (canManage && notFuture) footer.push(primaryBtn("Mark done", () => actions.onComplete(a)));
  } else if (status === "in_clinic") {
    if (canManage) footer.push(declineBtn("Cancel", () => actions.onCancel(a)));
    if (canManage) footer.push(primaryBtn("Mark done", () => actions.onComplete(a)));
  } else if (status === "completed") {
    if (can("pharmacy:manage")) {
      footer.push(
        <Button key="dispense" variant="outline" className="flex-1 gap-1.5 shadow-none" onClick={() => setDispenseOpen(true)}>
          <Pill className="h-4 w-4" />
          Dispense medicines
        </Button>
      );
    }
    if (canManage && !a.follow_up_appointment_id) {
      footer.push(primaryBtn("Book next appointment", () => actions.onFollowUp(a)));
    }
  }
  const footerButtons = footer.filter(Boolean);

  return (
    <>
      {/* Header */}
      <div className="border-b border-[#E3E9E5] px-5 pb-5 pt-5 dark:border-border sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <StatusBadge status={status} />
          <DialogPrimitive.Close className="-mr-1 -mt-1 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </div>
        <DialogPrimitive.Title className={cn("mt-3 text-2xl font-semibold tracking-tight", APPT_UI.ink)}>
          {a.patient?.full_name ?? "Unknown patient"}
        </DialogPrimitive.Title>
        <p className="mt-1 text-sm text-muted-foreground">
          {friendlyDateWithDay(date, todayYmd)} · {clock.time} {clock.period}
          {a.doctor?.full_name && <> with {a.doctor.full_name}</>}
        </p>
      </div>

      {/* Body */}
      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
        <dl className="grid grid-cols-[minmax(110px,auto)_1fr] gap-x-6 gap-y-3 text-sm">
          {details.map((row) => (
            <div key={row.label} className="contents">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className={cn("min-w-0 break-words font-medium", APPT_UI.ink)}>{row.value}</dd>
            </div>
          ))}
        </dl>

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className={cn("text-sm font-semibold", APPT_UI.ink)}>Visit history</h3>
            {can("patients:view") && history.length > 0 && (
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                className="text-xs font-medium text-[#1F7A4A] hover:underline dark:text-primary"
              >
                View all
              </button>
            )}
          </div>
          {historyLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No previous visits.</p>
          ) : (
            <ol className="relative space-y-3 before:absolute before:bottom-2 before:left-[6px] before:top-2 before:w-px before:bg-[#E3E9E5] dark:before:bg-border">
              {history.slice(0, HISTORY_LIMIT).map(({ appointment: h, kind, status: hs }) => {
                const hd = splitAppointmentDateTime(h.appointment_datetime).date;
                return (
                  <li key={h.id} className="relative flex items-baseline gap-3 pl-6 text-sm">
                    <span
                      className={cn(
                        "absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-2 bg-card",
                        hs === "completed" ? "border-green-600" : "border-muted-foreground/50"
                      )}
                    />
                    <span className={cn("font-semibold", APPT_UI.ink)}>{friendlyDate(hd, todayYmd)}</span>
                    <span className="text-muted-foreground">
                      · {kind}, {STATUS_META[hs].label.toLowerCase()}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        {/* More details — collapsed by default, holds everything the old detail dialog showed. */}
        <section className="rounded-xl border border-[#E3E9E5] dark:border-border">
          <button
            type="button"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((o) => !o)}
            className={cn("flex w-full items-center justify-between px-4 py-3 text-sm font-semibold", APPT_UI.ink)}
          >
            More details
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", moreOpen && "rotate-180")} />
          </button>
          {moreOpen && (
            <div className="space-y-5 border-t border-[#E3E9E5] px-4 py-4 text-sm dark:border-border">
              <dl className="space-y-2 text-xs">
                {patientDetails && <MoreRow label="Patient">{patientDetails}</MoreRow>}
                {a.patient?.preferred_language && (
                  <MoreRow label="WhatsApp language">{languageLabel(a.patient.preferred_language)}</MoreRow>
                )}
                {(a.status === "APPROVED" || a.status === "PATIENT_CONFIRMED" || a.status === "COMPLETED") && (
                  <MoreRow label="WhatsApp reminders">
                    {REMINDER_STAGES.map(({ key, label }) => (
                      <span key={key} className="mr-2">
                        {label} {a.reminders?.[key] ? "✓" : "—"}
                      </span>
                    ))}
                  </MoreRow>
                )}
                {a.status === "PATIENT_CONFIRMED" && <MoreRow label="Patient confirmed">Yes, via WhatsApp</MoreRow>}
                {a.status === "COMPLETED" && (
                  <MoreRow label="Feedback request">{a.feedback_requested ? "Sent" : "Not sent yet"}</MoreRow>
                )}
                {a.no_show_flagged && a.no_show_flagged_at && (
                  <MoreRow label="Flagged no-show">{formatEpochMs(a.no_show_flagged_at)}</MoreRow>
                )}
              </dl>

              {canManage && a.patient?.phone && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 shadow-none"
                  disabled={exitHumanModeMutation.isPending}
                  onClick={() => exitHumanModeMutation.mutate()}
                  title="Hand this patient's WhatsApp conversation back to the bot"
                >
                  {exitHumanModeMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquareOff className="h-4 w-4" />
                  )}
                  Resume WhatsApp bot
                </Button>
              )}

              <LabOrdersSection appointmentId={a.id} />

              {canManage && (
                <div>
                  <p className={cn("mb-2 text-sm font-semibold", APPT_UI.ink)}>Status history</p>
                  {auditLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : auditLog.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No history yet.</p>
                  ) : (
                    <div className="max-h-64 space-y-1.5 overflow-y-auto">
                      {auditLog.map((entry, i) => (
                        <div key={i} className="rounded-lg border border-[#E3E9E5] px-3 py-2 text-xs dark:border-border">
                          {entry.event === "ARRIVED" ? (
                            <span className="font-medium">Marked arrived</span>
                          ) : (
                            <>
                              <span className="font-medium">
                                {entry.from_status ? AUDIT_STATUS_LABELS[entry.from_status] ?? entry.from_status : "Booked"}
                              </span>{" "}
                              → <span className="font-medium">{AUDIT_STATUS_LABELS[entry.to_status] ?? entry.to_status}</span>
                              {entry.event === "BULK_CANCEL" && <span className="text-muted-foreground"> (bulk cancel)</span>}
                            </>
                          )}
                          <span className="ml-2 text-muted-foreground">
                            by {entry.changed_by_name ?? `${entry.changed_by_role} (WhatsApp bot)`} · {formatCreatedAt(entry.created_at)}
                          </span>
                          {entry.notification_status && (
                            <Badge variant="secondary" className="ml-2 align-middle">
                              WhatsApp: {entry.notification_status}
                            </Badge>
                          )}
                          {entry.old_datetime && entry.new_datetime && (
                            <p className="mt-1 text-muted-foreground">
                              Rescheduled: {entry.old_datetime.replace("T", " ")} → {entry.new_datetime.replace("T", " ")}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Sticky footer */}
      {footerButtons.length > 0 && (
        <div className="flex gap-2 border-t border-[#E3E9E5] bg-card px-5 py-4 dark:border-border sm:px-6">
          {footerButtons}
        </div>
      )}

      <PatientHistoryDialog open={historyOpen} onOpenChange={setHistoryOpen} patientId={a.patient_id} />
      <DispenseDialog open={dispenseOpen} onOpenChange={setDispenseOpen} appointmentId={a.id} />
    </>
  );
}

function MoreRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-36 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 flex-1 text-foreground">{children}</dd>
    </div>
  );
}

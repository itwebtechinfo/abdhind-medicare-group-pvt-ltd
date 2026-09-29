"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Loader2,
  MessageSquareOff,
  Pill,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { usePermission } from "@/src/hooks/usePermission";
import { toast } from "@/src/lib/toast";
import type { NormalizedApiError } from "@/src/types/api";
import { doctorQuickService } from "@/src/features/dashboard/dashboard";
import { DispenseDialog } from "@/src/features/pharmacy/DispenseDialog";
import { LabOrdersSection } from "@/src/features/lab/LabOrdersSection";
import { RescheduleDialog } from "./RescheduleDialog";
import { ConfirmAppointmentDialog } from "./ConfirmAppointmentDialog";
import { CancelAppointmentDialog } from "./CancelAppointmentDialog";
import { formatEpochMs, languageLabel } from "@/src/lib/format";
import { appointmentService } from "./appointment";
import type { AppointmentStatus, ApiAppointment, AppointmentReminders } from "./appointment";

interface AppointmentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: ApiAppointment | null;
  onBookFollowUp: (appointment: ApiAppointment) => void;
}

const STATUS_VARIANT: Record<AppointmentStatus, "success" | "warning" | "secondary" | "destructive"> = {
  PENDING: "warning",
  APPROVED: "secondary",
  PATIENT_CONFIRMED: "secondary",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

const APPOINTMENTS_QUERY_KEY = ["appointments"] as const;

const REMINDER_STAGES: { key: keyof AppointmentReminders; label: string }[] = [
  { key: "24h_sent", label: "24h" },
  { key: "2h_sent", label: "2h" },
  { key: "30m_sent", label: "30m" },
];

/** Reminders only go out once staff approve (see reminder_cron_job), so
 * they're meaningless on a PENDING or CANCELLED booking. */
const REMINDER_STATUSES: AppointmentStatus[] = ["APPROVED", "PATIENT_CONFIRMED", "COMPLETED"];

export function AppointmentDetailDialog({
  open,
  onOpenChange,
  appointment,
  onBookFollowUp,
}: AppointmentDetailDialogProps) {
  const queryClient = useQueryClient();
  const { can, role } = usePermission();
  const isPatient = role === "patient";
  const [current, setCurrent] = useState<ApiAppointment | null>(appointment);
  const [dispenseOpen, setDispenseOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const { data: auditLog = [] } = useQuery({
    queryKey: ["appointments", current?.id, "audit-log"],
    queryFn: async () => (await appointmentService.auditLog(current?.id as string)).data.logs,
    enabled: open && Boolean(current),
  });

  const invalidateList = () => queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY });

  // Mutation responses are the bare appointment doc — no patient/doctor
  // join, and booked_by only on some endpoints — so keep the joined data
  // from the row we opened with instead of blanking it out.
  const mergeIn = (updated: ApiAppointment) =>
    setCurrent((prev) =>
      prev
        ? {
            ...updated,
            patient: updated.patient ?? prev.patient,
            doctor: updated.doctor ?? prev.doctor,
            booked_by: updated.booked_by ?? prev.booked_by,
          }
        : updated
    );

  const confirmMutation = useMutation({
    mutationFn: (slotId?: string) => appointmentService.confirm(current?.id as string, { slot_id: slotId }),
    onSuccess: (res) => {
      toast.success(res.msg);
      mergeIn(res.data.appointment);
      setConfirmOpen(false);
      invalidateList();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const completeMutation = useMutation({
    mutationFn: () => appointmentService.complete(current?.id as string),
    onSuccess: (res) => {
      toast.success(res.msg);
      mergeIn(res.data.appointment);
      invalidateList();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  // Patients don't have access to the staff-only POST /{id}/cancel endpoint —
  // they cancel through the newer PATCH endpoint instead, scoped server-side
  // to their own/booked-by-them appointments. Staff keep the original path.
  const cancelMutation = useMutation({
    mutationFn: (reason?: string) =>
      isPatient
        ? appointmentService.update(current?.id as string, { status: "CANCELLED", reason })
        : appointmentService.cancel(current?.id as string, reason),
    onSuccess: (res) => {
      toast.success(res.msg);
      mergeIn(res.data.appointment);
      setCancelOpen(false);
      invalidateList();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const rescheduleMutation = useMutation({
    mutationFn: (slotId: string) =>
      appointmentService.update(current?.id as string, { slot_id: slotId }),
    onSuccess: (res) => {
      toast.success(res.msg);
      mergeIn(res.data.appointment);
      setRescheduleOpen(false);
      invalidateList();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const exitHumanModeMutation = useMutation({
    mutationFn: () => doctorQuickService.exitHumanMode(current?.patient?.phone as string),
    onSuccess: (res) => toast.success(res.msg),
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  if (!current) return null;

  // Only the pieces that are actually present — an old record missing
  // address/gender just shows fewer segments instead of a blank/"null".
  const patientDetails = [
    current.patient?.uhid || null,
    current.patient?.age != null ? `${current.patient.age}y` : null,
    current.patient?.gender || null,
    current.patient?.address || null,
    current.patient?.preferred_language
      ? `WhatsApp: ${languageLabel(current.patient.preferred_language)}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {current.patient?.full_name ?? "Appointment"}
            <Badge variant={STATUS_VARIANT[current.status]}>{current.status}</Badge>
          </DialogTitle>
          {current.reference_code && (
            <p className="font-mono text-xs text-muted-foreground">Booking ID: {current.reference_code}</p>
          )}
          {patientDetails && (
            <p className="text-xs text-muted-foreground">{patientDetails}</p>
          )}
          <DialogDescription>
            {current.doctor?.full_name ?? "—"} · {current.appointment_datetime.replace("T", " ")} ·
            Source: {current.source}
            {current.booked_by && <> · Booked by {current.booked_by.full_name}</>}
          </DialogDescription>
          {current.status === "CANCELLED" && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Cancellation reason:</span>{" "}
              {current.cancellation_reason || "No reason given"}
            </p>
          )}
          {REMINDER_STATUSES.includes(current.status) && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">WhatsApp reminders:</span>{" "}
              {REMINDER_STAGES.map(({ key, label }) => (
                <span key={key} className="mr-2">
                  {label} {current.reminders?.[key] ? "✓" : "—"}
                </span>
              ))}
            </p>
          )}
          {current.status === "COMPLETED" && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Feedback request:</span>{" "}
              {current.feedback_requested ? "Sent" : "Not sent yet"}
            </p>
          )}
          {current.no_show_flagged && (
            <p className="text-xs text-destructive">
              Flagged as no-show
              {current.no_show_flagged_at ? ` on ${formatEpochMs(current.no_show_flagged_at)}` : ""}
            </p>
          )}
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {current.status === "PENDING" &&
            !isPatient &&
            (can("appointments:edit") || can("appointments:manage")) && (
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => setConfirmOpen(true)}
              >
                <CalendarCheck className="h-4 w-4" />
                Confirm Appointment
              </Button>
            )}
          {current.status === "APPROVED" &&
            !isPatient &&
            (can("appointments:edit") || can("appointments:manage")) && (
              <Button
                size="sm"
                className="gap-1.5"
                disabled={completeMutation.isPending}
                onClick={() => completeMutation.mutate()}
              >
                {completeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Mark Completed
              </Button>
            )}
          {(current.status === "PENDING" || current.status === "APPROVED") &&
            (isPatient || can("appointments:edit") || can("appointments:manage")) && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => setRescheduleOpen(true)}
              >
                <CalendarClock className="h-4 w-4" />
                Reschedule
              </Button>
            )}
          {(current.status === "PENDING" || current.status === "APPROVED") && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              disabled={cancelMutation.isPending}
              onClick={() => setCancelOpen(true)}
            >
              {cancelMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Cancel
            </Button>
          )}
          {current.status === "COMPLETED" && !current.follow_up_appointment_id && (
            <Button size="sm" variant="outline" onClick={() => onBookFollowUp(current)}>
              Book Follow-up
            </Button>
          )}
          {current.status === "COMPLETED" && can("pharmacy:manage") && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => setDispenseOpen(true)}
            >
              <Pill className="h-4 w-4" />
              Dispense Medicines
            </Button>
          )}
          {!isPatient && current.patient?.phone && (
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5"
              disabled={exitHumanModeMutation.isPending}
              onClick={() => exitHumanModeMutation.mutate()}
              title="Hand this patient's WhatsApp conversation back to the bot"
            >
              {exitHumanModeMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageSquareOff className="h-4 w-4" />
              )}
              Resume Bot
            </Button>
          )}
        </div>

        <LabOrdersSection appointmentId={current.id} />

        <div>
          <p className="mb-2 text-sm font-medium">Status History</p>
          <div className="max-h-[30vh] space-y-1.5 overflow-y-auto">
            {auditLog.map((entry, i) => (
              <div key={i} className="rounded-lg border border-border px-3 py-2 text-xs">
                <span className="font-medium">{entry.from_status ?? "—"}</span> →{" "}
                <span className="font-medium">{entry.to_status}</span>
                <span className="ml-2 text-muted-foreground">
                  by {entry.changed_by_name ?? `${entry.changed_by_role} (WhatsApp bot)`} ·{" "}
                  {entry.created_at}
                </span>
                {entry.notification_status && (
                  <Badge variant="secondary" className="ml-2 align-middle">
                    WhatsApp: {entry.notification_status}
                  </Badge>
                )}
                {entry.old_datetime && entry.new_datetime && (
                  <p className="mt-1 text-muted-foreground">
                    Rescheduled: {entry.old_datetime.replace("T", " ")} →{" "}
                    {entry.new_datetime.replace("T", " ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
        </DialogContent>
      </Dialog>

      <DispenseDialog
        open={dispenseOpen}
        onOpenChange={setDispenseOpen}
        appointmentId={current.id}
      />

      <RescheduleDialog
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
        appointment={current}
        isSubmitting={rescheduleMutation.isPending}
        onSubmit={(slotId) => rescheduleMutation.mutate(slotId)}
      />

      <ConfirmAppointmentDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        appointment={current}
        isSubmitting={confirmMutation.isPending}
        onSubmit={(slotId) => confirmMutation.mutate(slotId)}
      />

      <CancelAppointmentDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        appointment={current}
        isSubmitting={cancelMutation.isPending}
        onSubmit={(reason) => cancelMutation.mutate(reason)}
      />
    </>
  );
}

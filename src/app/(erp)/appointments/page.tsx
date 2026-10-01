"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, CalendarClock, Plus, Stethoscope } from "lucide-react";
import { ErpPageShell } from "@/src/components/dashboard/ErpPageShell";
import { Can } from "@/src/components/rbac/PermissionGate";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent } from "@/src/components/ui/card";
import { usePermission } from "@/src/hooks/usePermission";
import { toast } from "@/src/lib/toast";
import type { NormalizedApiError } from "@/src/types/api";
import { appointmentService } from "@/src/features/appointments/appointment";
import { BookAppointmentDialog } from "@/src/features/appointments/BookAppointmentDialog";
import { AppointmentDetailDialog } from "@/src/features/appointments/AppointmentDetailDialog";
import { FollowUpDialog } from "@/src/features/appointments/FollowUpDialog";
import { AppointmentsBoard } from "@/src/features/appointments/AppointmentsBoard";
import type {
  ApiAppointment,
  AppointmentListFilters,
  AppointmentStatus,
  CreateAppointmentPayload,
} from "@/src/features/appointments/appointment";

const APPOINTMENTS_QUERY_KEY = ["appointments"] as const;

const STATUS_VARIANT: Record<AppointmentStatus, "success" | "warning" | "secondary" | "destructive"> = {
  PENDING: "warning",
  APPROVED: "secondary",
  PATIENT_CONFIRMED: "secondary",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

const UPCOMING_STATUSES: AppointmentStatus[] = ["PENDING", "APPROVED", "PATIENT_CONFIRMED"];

function AppointmentCard({
  appointment,
  onView,
  onFollowUp,
}: {
  appointment: ApiAppointment;
  onView: () => void;
  onFollowUp: () => void;
}) {
  const canFollowUp =
    appointment.status === "COMPLETED" && !appointment.follow_up_appointment_id;

  return (
    <button
      type="button"
      onClick={onView}
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 text-left text-sm transition-colors hover:bg-muted/50"
    >
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 font-medium">
          <Stethoscope className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          {appointment.doctor?.full_name ?? "Doctor"}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarClock className="h-3.5 w-3.5 shrink-0" />
          {appointment.appointment_datetime.replace("T", " ")}
        </p>
        {appointment.patient?.full_name && (
          <p className="mt-0.5 text-xs text-muted-foreground">For {appointment.patient.full_name}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {canFollowUp && (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onFollowUp();
            }}
          >
            Book Follow-up
          </Button>
        )}
        <Badge variant={STATUS_VARIANT[appointment.status]}>{appointment.status}</Badge>
      </div>
    </button>
  );
}

export default function AppointmentsPage() {
  const { role } = usePermission();
  // Staff and doctors get the redesigned workspace; patients keep their own view.
  if (role === "patient") return <PatientAppointmentsView />;
  return <AppointmentsBoard />;
}

function PatientAppointmentsView() {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<AppointmentListFilters>({});
  const [bookOpen, setBookOpen] = useState(false);
  const [detailAppointment, setDetailAppointment] = useState<ApiAppointment | null>(null);
  const [followUpSource, setFollowUpSource] = useState<ApiAppointment | null>(null);

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: [...APPOINTMENTS_QUERY_KEY, filters],
    queryFn: async () => (await appointmentService.list(filters)).data.appointments,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY });

  const createMutation = useMutation({
    mutationFn: (payload: CreateAppointmentPayload) => appointmentService.create(payload),
    onSuccess: (res) => {
      toast.success(res.msg);
      setBookOpen(false);
      invalidate();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const followUpMutation = useMutation({
    mutationFn: ({ id, slotId }: { id: string; slotId: string }) =>
      appointmentService.followUp(id, { slot_id: slotId }),
    onSuccess: (res) => {
      toast.success(res.msg);
      setFollowUpSource(null);
      setDetailAppointment(null);
      invalidate();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const { upcoming, history } = useMemo(() => {
    const sorted = [...appointments].sort(
      (a, b) => a.appointment_datetime.localeCompare(b.appointment_datetime)
    );
    return {
      upcoming: sorted.filter((a) => UPCOMING_STATUSES.includes(a.status)),
      history: sorted
        .filter((a) => !UPCOMING_STATUSES.includes(a.status))
        .reverse(),
    };
  }, [appointments]);

  const bookDialog = (
    <BookAppointmentDialog
      key={bookOpen ? "open" : "closed"}
      open={bookOpen}
      onOpenChange={setBookOpen}
      isSubmitting={createMutation.isPending}
      onSubmit={(payload) => createMutation.mutate(payload)}
    />
  );

  const detailDialog = (
    <AppointmentDetailDialog
      key={`detail-${detailAppointment?.id ?? "none"}`}
      open={Boolean(detailAppointment)}
      onOpenChange={(open) => !open && setDetailAppointment(null)}
      appointment={detailAppointment}
      onBookFollowUp={(appt) => setFollowUpSource(appt)}
    />
  );

  const followUpDialog = (
    <FollowUpDialog
      key={`followup-${followUpSource?.id ?? "none"}`}
      open={Boolean(followUpSource)}
      onOpenChange={(open) => !open && setFollowUpSource(null)}
      sourceAppointment={followUpSource}
      isSubmitting={followUpMutation.isPending}
      onSubmit={(slotId) =>
        followUpSource && followUpMutation.mutate({ id: followUpSource.id, slotId })
      }
    />
  );

  return (
    <ErpPageShell
      title="My Appointments"
      description="Book visits, manage follow-ups, and track your visit history."
      icon={Calendar}
      actions={
        <Can module="appointments" action="create">
          <Button size="sm" className="gap-2" onClick={() => setBookOpen(true)}>
            <Plus className="h-4 w-4" />
            Book Appointment
          </Button>
        </Can>
      }
    >
      <div className="mb-4 flex w-fit rounded-lg bg-muted p-1">
        <button
          type="button"
          onClick={() => setFilters((f) => ({ ...f, scope: undefined }))}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            filters.scope === undefined || filters.scope === "mine"
              ? "bg-background shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          My Appointments
        </button>
        <button
          type="button"
          onClick={() => setFilters((f) => ({ ...f, scope: "booked_by_me" }))}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            filters.scope === "booked_by_me" ? "bg-background shadow-sm" : "text-muted-foreground"
          }`}
        >
          Booked for Others
        </button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:max-w-md">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
            <p className="mt-1 text-2xl font-bold">{upcoming.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Completed Visits</p>
            <p className="mt-1 text-2xl font-bold">
              {history.filter((a) => a.status === "COMPLETED").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading your appointments…</p>}

      {!isLoading && appointments.length === 0 && (
        <div className="rounded-xl border border-dashed border-border py-10 text-center">
          <p className="text-sm text-muted-foreground">You don&rsquo;t have any appointments yet.</p>
          <Can module="appointments" action="create">
            <Button size="sm" className="mt-3 gap-2" onClick={() => setBookOpen(true)}>
              <Plus className="h-4 w-4" />
              Book your first appointment
            </Button>
          </Can>
        </div>
      )}

      {!isLoading && upcoming.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 text-sm font-semibold">Upcoming</h2>
          <div className="space-y-2">
            {upcoming.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                onView={() => setDetailAppointment(appt)}
                onFollowUp={() => setFollowUpSource(appt)}
              />
            ))}
          </div>
        </div>
      )}

      {!isLoading && history.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold">Visit History</h2>
          <div className="space-y-2">
            {history.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                onView={() => setDetailAppointment(appt)}
                onFollowUp={() => setFollowUpSource(appt)}
              />
            ))}
          </div>
        </div>
      )}

      {bookDialog}
      {detailDialog}
      {followUpDialog}
    </ErpPageShell>
  );
}

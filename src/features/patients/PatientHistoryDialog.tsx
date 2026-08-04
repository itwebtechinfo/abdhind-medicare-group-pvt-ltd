"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Badge } from "@/src/components/ui/badge";
import { patientService } from "./patient";
import type { AppointmentStatus, PatientAppointmentRecord } from "./patient";

interface PatientHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string | null;
}

const STATUS_VARIANT: Record<AppointmentStatus, "success" | "warning" | "secondary" | "destructive"> = {
  PENDING: "warning",
  APPROVED: "secondary",
  PATIENT_CONFIRMED: "secondary",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

/** Oldest-first visit numbering with each entry's follow-up source resolved
 * to a visit number, so the list reads as a chain: Visit 1 -> Visit 2
 * (Follow-up of Visit 1) -> Visit 3 (Follow-up of Visit 2), etc. */
function buildTimeline(appointments: PatientAppointmentRecord[]) {
  const sorted = [...appointments].sort((a, b) =>
    a.appointment_datetime.localeCompare(b.appointment_datetime)
  );
  const visitNumberById = new Map(sorted.map((appt, i) => [appt.id, i + 1]));
  return sorted.map((appt) => ({
    ...appt,
    visitNumber: visitNumberById.get(appt.id) as number,
    followUpOfVisitNumber: appt.follow_up_of ? visitNumberById.get(appt.follow_up_of) ?? null : null,
  }));
}

export function PatientHistoryDialog({ open, onOpenChange, patientId }: PatientHistoryDialogProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["patients", patientId, "history"],
    queryFn: async () => (await patientService.get(patientId as string)).data,
    enabled: open && Boolean(patientId),
  });

  const timeline = useMemo(() => buildTimeline(data?.appointments ?? []), [data?.appointments]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{data?.patient.full_name ?? "Patient History"}</DialogTitle>
          <DialogDescription>
            {data ? `${data.patient.uhid} · ${data.patient.phone}` : "Loading patient details…"}
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}

        {!isLoading && data && (
          <div className="max-h-[50vh] space-y-2 overflow-y-auto">
            {timeline.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No appointment history yet.
              </p>
            )}
            {timeline.map((appt) => (
              <div
                key={appt.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">
                    Visit {appt.visitNumber}
                    {appt.followUpOfVisitNumber && (
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        (Follow-up of Visit {appt.followUpOfVisitNumber})
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {appt.appointment_datetime.replace("T", " ")} · Source: {appt.source}
                  </p>
                </div>
                <Badge variant={STATUS_VARIANT[appt.status]}>{appt.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

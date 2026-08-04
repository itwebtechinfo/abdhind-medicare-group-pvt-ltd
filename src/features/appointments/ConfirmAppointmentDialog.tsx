"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { usePermission } from "@/src/hooks/usePermission";
import { doctorService } from "@/src/features/doctors/doctor";
import { publicBookingService } from "@/src/features/public-booking/public-booking";
import type { ApiAppointment } from "./appointment";

interface ConfirmAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: ApiAppointment | null;
  isSubmitting: boolean;
  onSubmit: (slotId?: string) => void;
}

const today = () => new Date().toISOString().slice(0, 10);

/** PENDING -> APPROVED, in one action. Slot selection is optional: leaving it
 * unset confirms the appointment at the time the patient already picked;
 * choosing a slot here confirms at the doctor's preferred time instead. */
export function ConfirmAppointmentDialog({
  open,
  onOpenChange,
  appointment,
  isSubmitting,
  onSubmit,
}: ConfirmAppointmentDialogProps) {
  const [date, setDate] = useState(today());
  const [slotId, setSlotId] = useState("");
  const { role } = usePermission();
  // Doctor logins hold appointments:manage but not the staff-only
  // doctors:view the authenticated /doctors/{id}/slots route requires - fall
  // back to the unauthenticated public slots endpoint, same as
  // RescheduleDialog/FollowUpDialog.
  const usesPublicSlotsApi = role === "doctor";

  const doctorId = appointment?.doctor_id;

  const { data: slots = [], isFetching } = useQuery({
    queryKey: ["doctors", doctorId, "slots", date, usesPublicSlotsApi],
    queryFn: async () =>
      usesPublicSlotsApi
        ? (await publicBookingService.listSlots(doctorId as string, date)).data.slots
        : (await doctorService.listSlots(doctorId as string, date)).data.slots,
    enabled: open && Boolean(doctorId) && Boolean(date),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Confirm Appointment</DialogTitle>
          <DialogDescription>
            With {appointment?.doctor?.full_name ?? "the doctor"} for{" "}
            {appointment?.patient?.full_name ?? "this patient"}. Currently booked for{" "}
            {appointment?.appointment_datetime.replace("T", " ") ?? "—"}.
          </DialogDescription>
        </DialogHeader>

        <div>
          <label htmlFor="confirm-date" className="mb-1.5 block text-sm font-medium">
            Change time to (optional)
          </label>
          <Input
            id="confirm-date"
            type="date"
            min={today()}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setSlotId("");
            }}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Available Slots</label>
          {isFetching && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading slots…
            </div>
          )}
          {!isFetching && slots.length === 0 && (
            <p className="text-sm text-muted-foreground">No open slots for this date.</p>
          )}
          {!isFetching && slots.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSlotId(slot.id === slotId ? "" : slot.id)}
                  className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                    slotId === slot.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input hover:bg-accent"
                  }`}
                >
                  {slot.start_time}
                </button>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button disabled={isSubmitting} onClick={() => onSubmit(slotId || undefined)}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Appointment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: ApiAppointment | null;
  isSubmitting: boolean;
  onSubmit: (slotId: string) => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export function RescheduleDialog({
  open,
  onOpenChange,
  appointment,
  isSubmitting,
  onSubmit,
}: RescheduleDialogProps) {
  const [date, setDate] = useState(today());
  const [slotId, setSlotId] = useState("");
  const { role } = usePermission();
  const usesPublicSlotsApi = role === "patient" || role === "doctor";

  const doctorId = appointment?.doctor_id;

  // Neither patients nor doctors have "doctors:view" (staff-only), so the
  // authenticated /doctors/{id}/slots endpoint would 403 for them — use the
  // same unauthenticated public endpoint BookAppointmentDialog uses instead.
  // (doctorId here comes from the existing appointment being rescheduled, so
  // there's no "which doctor am I" lookup needed, unlike a new booking.)
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
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogDescription>
            With {appointment?.doctor?.full_name ?? "the same doctor"} for{" "}
            {appointment?.patient?.full_name ?? "this patient"}.
          </DialogDescription>
        </DialogHeader>

        <div>
          <label htmlFor="reschedule-date" className="mb-1.5 block text-sm font-medium">
            Date
          </label>
          <Input
            id="reschedule-date"
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
                  onClick={() => setSlotId(slot.id)}
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
          <Button disabled={!slotId || isSubmitting} onClick={() => onSubmit(slotId)}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Reschedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

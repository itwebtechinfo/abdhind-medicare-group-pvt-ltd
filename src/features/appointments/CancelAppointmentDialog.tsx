"use client";

import { useState } from "react";
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
import { Textarea } from "@/src/components/ui/textarea";
import type { ApiAppointment } from "./appointment";

interface CancelAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: ApiAppointment | null;
  isSubmitting: boolean;
  /** reason is optional — leaving it blank cancels exactly as before. */
  onSubmit: (reason?: string) => void;
}

export function CancelAppointmentDialog({
  open,
  onOpenChange,
  appointment,
  isSubmitting,
  onSubmit,
}: CancelAppointmentDialogProps) {
  const [reason, setReason] = useState("");

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setReason("");
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
          <DialogDescription>
            {appointment?.patient?.full_name ?? "This patient"}&apos;s appointment with{" "}
            {appointment?.doctor?.full_name ?? "the doctor"} will be cancelled.
          </DialogDescription>
        </DialogHeader>

        <div>
          <label htmlFor="cancel-reason" className="mb-1.5 block text-sm font-medium">
            Reason for cancellation (optional)
          </label>
          <Textarea
            id="cancel-reason"
            placeholder="e.g. Patient requested reschedule, doctor unavailable…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Go Back
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isSubmitting}
            onClick={() => onSubmit(reason.trim() || undefined)}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

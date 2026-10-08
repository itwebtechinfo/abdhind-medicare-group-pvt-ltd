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
import type { ApiAppointment, CancelledBy } from "./appointment";

const REASONS = ["Patient not available", "Doctor unavailable", "Duplicate booking", "Other"] as const;
type Reason = (typeof REASONS)[number];

interface DeclineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: ApiAppointment | null;
  /** "decline" for a booking still awaiting approval, "cancel" for a confirmed one. */
  mode: "decline" | "cancel";
  isSubmitting: boolean;
  /** reason is saved as-is to cancellation_reason; cancelledBy picks the patient's WhatsApp message. */
  onSubmit: (reason: string, cancelledBy: CancelledBy) => void;
}

const WHO_OPTIONS: { value: CancelledBy; label: string; hint: string }[] = [
  { value: "clinic", label: "Clinic", hint: "Patient gets the “Sorry, cancelled by the clinic” message." },
  {
    value: "patient",
    label: "Patient requested",
    hint: "Patient gets a short confirmation — only if they messaged in the last 24 hours.",
  },
];

/** Staff decline/cancel with a required reason. Mount with a fresh `key` per
 * appointment so the form resets between opens. */
export function DeclineDialog({ open, onOpenChange, appointment, mode, isSubmitting, onSubmit }: DeclineDialogProps) {
  const [reason, setReason] = useState<Reason | "">("");
  const [otherText, setOtherText] = useState("");
  const [cancelledBy, setCancelledBy] = useState<CancelledBy | "">("");

  const finalReason = reason === "Other" ? otherText.trim() : reason;
  const verb = mode === "decline" ? "Decline" : "Cancel";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{verb} appointment</DialogTitle>
          <DialogDescription>
            {appointment?.patient?.full_name ?? "This patient"}
            {appointment?.reference_code ? ` · ${appointment.reference_code}` : ""}. The slot will be freed up.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (finalReason && cancelledBy) onSubmit(finalReason, cancelledBy);
          }}
        >
          <fieldset>
            <legend className="mb-1.5 block text-sm font-medium">Who cancelled?</legend>
            <div className="grid grid-cols-2 gap-2">
              {WHO_OPTIONS.map((o) => (
                <label
                  key={o.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    cancelledBy === o.value ? "border-primary bg-primary/5" : "border-input hover:bg-accent"
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelled-by"
                    required
                    value={o.value}
                    checked={cancelledBy === o.value}
                    onChange={() => setCancelledBy(o.value)}
                  />
                  {o.label}
                </label>
              ))}
            </div>
            {cancelledBy && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                {WHO_OPTIONS.find((o) => o.value === cancelledBy)?.hint}
              </p>
            )}
          </fieldset>

          <div>
            <label htmlFor="decline-reason" className="mb-1.5 block text-sm font-medium">
              Reason
            </label>
            <select
              id="decline-reason"
              required
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={reason}
              onChange={(e) => setReason(e.target.value as Reason | "")}
            >
              <option value="" disabled>
                Select a reason
              </option>
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {reason === "Other" && (
            <div>
              <label htmlFor="decline-other" className="mb-1.5 block text-sm font-medium">
                Details
              </label>
              <Textarea
                id="decline-other"
                autoFocus
                rows={3}
                maxLength={300}
                placeholder="Tell the team why"
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
              />
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Keep appointment
            </Button>
            <Button type="submit" variant="destructive" disabled={!finalReason || !cancelledBy || isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {verb} appointment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

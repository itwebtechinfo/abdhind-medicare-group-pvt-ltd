"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Repeat } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { toast } from "@/src/lib/toast";
import { cn } from "@/src/lib/utils";
import type { NormalizedApiError } from "@/src/types/api";
import {
  appointmentService,
  sittingLabel,
  type ApiAppointment,
  type DoneType,
} from "./appointment";

type NextBooked = { id: string; appointment_datetime: string; reference_code: string | null; sitting_no: number | null };

interface CompleteDialogProps {
  /** "visit": Mark done (two choices). "treatment": complete the treatment from its last sitting (drawer). */
  mode: "visit" | "treatment";
  appointment: ApiAppointment | null;
  onOpenChange: (open: boolean) => void;
  /** After success — the board refetches; "sitting" also opens Book next. */
  onDone: (updated: ApiAppointment, doneType: DoneType) => void;
}

/** Mark done: "Sitting done – book next" or "Treatment complete". If a later
 * sitting is already booked when completing, asks whether to cancel it or keep
 * it as a normal visit. Mount with a fresh `key` per appointment. */
export function CompleteDialog({ mode, appointment, onOpenChange, onDone }: CompleteDialogProps) {
  const [submitting, setSubmitting] = useState<DoneType | null>(null);
  const [nextBooked, setNextBooked] = useState<NextBooked | null>(null);
  const label = appointment ? sittingLabel(appointment) : null;

  const run = async (doneType: DoneType, nextSitting?: "cancel" | "keep") => {
    if (!appointment || submitting) return;
    // Ask up front when we already know a later sitting is booked (the 409 below is the safety net).
    const laterBooked = appointment.chain?.next && appointment.chain.next.id !== appointment.id ? appointment.chain.next : null;
    if (doneType === "final" && !nextSitting && laterBooked) {
      setNextBooked(laterBooked);
      return;
    }
    setSubmitting(doneType);
    try {
      const res =
        mode === "treatment"
          ? await appointmentService.treatment(appointment.id, { action: "complete", next_sitting: nextSitting })
          : await appointmentService.complete(appointment.id, { done_type: doneType, next_sitting: nextSitting });
      toast.success(doneType === "sitting" ? "Sitting done" : mode === "treatment" ? "Treatment marked complete" : "Appointment marked done");
      onDone(res.data.appointment, doneType);
    } catch (err) {
      const e = err as NormalizedApiError & { data?: { code?: string; next?: NextBooked } };
      if (e.data?.code === "next_sitting_booked" && e.data.next) {
        setNextBooked(e.data.next);
      } else {
        toast.error(e.error ?? "Something went wrong", e.msg);
      }
    } finally {
      setSubmitting(null);
    }
  };

  const when = nextBooked ? nextBooked.appointment_datetime.replace("T", " · ") : "";

  return (
    <Dialog open={Boolean(appointment)} onOpenChange={(open) => !submitting && onOpenChange(open)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {nextBooked ? "A later sitting is booked" : mode === "treatment" ? "Complete the treatment?" : "Mark done"}
          </DialogTitle>
          <DialogDescription>
            {nextBooked
              ? `Sitting ${nextBooked.sitting_no ?? ""} is booked for ${when}${nextBooked.reference_code ? ` (${nextBooked.reference_code})` : ""}. The patient won't get a WhatsApp message about this — let them know.`
              : `${appointment?.patient?.full_name ?? "This patient"}${label ? ` · ${label}` : ""}`}
          </DialogDescription>
        </DialogHeader>

        {nextBooked ? (
          <DialogFooter className="gap-2 sm:justify-between">
            <Button variant="outline" disabled={Boolean(submitting)} onClick={() => run("final", "keep")}>
              Keep it as a normal visit
            </Button>
            <Button variant="destructive" disabled={Boolean(submitting)} onClick={() => run("final", "cancel")}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Cancel that sitting
            </Button>
          </DialogFooter>
        ) : mode === "treatment" ? (
          <>
            <p className="text-sm text-muted-foreground">
              No more sittings. The patient gets the Google review request (once per treatment).
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={Boolean(submitting)}>Not yet</Button>
              <Button onClick={() => run("final")} disabled={Boolean(submitting)}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Treatment complete
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="grid gap-2">
            <Choice
              icon={Repeat}
              title="Sitting done – book next"
              hint="More sittings to come. Next you'll pick the date for the next sitting."
              loading={submitting === "sitting"}
              disabled={Boolean(submitting)}
              onClick={() => run("sitting")}
            />
            <Choice
              icon={CheckCircle2}
              title="Treatment complete"
              hint="No more sittings (or a single visit). The Google review request goes out."
              loading={submitting === "final"}
              disabled={Boolean(submitting)}
              onClick={() => run("final")}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Choice({ icon: Icon, title, hint, loading, disabled, onClick }: {
  icon: typeof Repeat;
  title: string;
  hint: string;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-start gap-3 rounded-xl border border-border p-4 text-left transition-colors hover:border-primary/50 hover:bg-muted/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
      )}
    >
      {loading ? <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin" /> : <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#1F7A4A] dark:text-emerald-400" />}
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="block text-sm text-muted-foreground">{hint}</span>
      </span>
    </button>
  );
}

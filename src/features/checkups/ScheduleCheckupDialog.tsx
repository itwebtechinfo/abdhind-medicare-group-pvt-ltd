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
import { Switch } from "@/src/components/ui/switch";
import { useMinuteClock } from "@/src/hooks/useMinuteClock";
import { cn } from "@/src/lib/utils";
import { doctorService } from "@/src/features/doctors/doctor";
import { APPT_UI } from "@/src/features/appointments/StatusBadge";
import { formatClock, istNow } from "@/src/features/appointments/appointment";
import type { CheckupRequest } from "./checkups";

interface Props {
  request: CheckupRequest | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: { doctor_id: string; slot_id: string; notify: boolean }) => void;
}

const SELECT =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring";

/** Pick the check-up's doctor, date and slot. Booked already confirmed; the
 * patient gets the date/time on WhatsApp now (default) or later from the row.
 * Mount with a fresh `key` per request. */
export function ScheduleCheckupDialog({ request, isSubmitting, onOpenChange, onSubmit }: Props) {
  const now = istNow(useMinuteClock() ?? 0);
  const todayYmd = now.date;
  const [doctorId, setDoctorId] = useState(request?.last_visit?.doctor_id ?? "");
  const [pickedDate, setDate] = useState("");
  const date = pickedDate || todayYmd;
  const [slotId, setSlotId] = useState("");
  const [notify, setNotify] = useState(true);
  const open = Boolean(request);

  const { data: doctors = [], isLoading: doctorsLoading } = useQuery({
    queryKey: ["doctors", "checkup-dialog"],
    queryFn: async () => (await doctorService.list()).data.doctors,
    enabled: open,
    staleTime: 300_000,
  });
  // The last visit's doctor may have left - fall back to the first active one.
  const effectiveDoctorId = doctors.some((d) => d.id === doctorId) ? doctorId : (doctors[0]?.id ?? "");

  const { data: slots = [], isFetching: slotsLoading } = useQuery({
    queryKey: ["doctors", effectiveDoctorId, "slots", date],
    queryFn: async () => (await doctorService.listSlots(effectiveDoctorId, date)).data.slots,
    enabled: open && Boolean(effectiveDoctorId) && Boolean(date),
  });
  // Free slots only; today, only times still ahead.
  const bookable = slots.filter((s) => {
    if (s.is_booked) return false;
    if (date !== now.date) return true;
    const [h, m] = s.start_time.split(":").map(Number);
    return h * 60 + m > now.minutes;
  });

  const name = request?.patient?.full_name ?? request?.patient_name ?? "this patient";
  return (
    <Dialog open={open} onOpenChange={(o) => !isSubmitting && onOpenChange(o)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book free check-up</DialogTitle>
          <DialogDescription>
            For {name}. It&rsquo;s booked as a confirmed appointment (no approval step).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label htmlFor="checkup-doctor" className="mb-1.5 block text-sm font-medium">Doctor</label>
            <select
              id="checkup-doctor"
              className={SELECT}
              value={effectiveDoctorId}
              disabled={doctorsLoading}
              onChange={(e) => {
                setDoctorId(e.target.value);
                setSlotId("");
              }}
            >
              {doctorsLoading && <option value="">Loading…</option>}
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.full_name}
                  {d.specialization ? ` — ${d.specialization}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="checkup-date" className="mb-1.5 block text-sm font-medium">Date</label>
            <Input
              id="checkup-date"
              type="date"
              min={todayYmd}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setSlotId("");
              }}
            />
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium">Time</p>
            {slotsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading slots…
              </div>
            ) : bookable.length === 0 ? (
              <p className="text-sm text-muted-foreground">No open slots on this date — try another day.</p>
            ) : (
              <div role="radiogroup" aria-label="Available times" className="flex max-h-44 flex-wrap gap-2 overflow-y-auto">
                {bookable.map((s) => {
                  const [h, m] = s.start_time.split(":").map(Number);
                  const clock = formatClock(h * 60 + m);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      role="radio"
                      aria-checked={slotId === s.id}
                      onClick={() => setSlotId(s.id)}
                      className={cn(
                        "rounded-md border px-3 py-1.5 text-sm tabular-nums transition-colors",
                        slotId === s.id ? "border-primary bg-primary text-primary-foreground" : "border-input hover:bg-accent"
                      )}
                    >
                      {clock.time} {clock.period}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <label className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
            <span>
              <span className="block text-sm font-medium">Send the date &amp; time on WhatsApp</span>
              <span className="block text-xs text-muted-foreground">
                The patient gets the &ldquo;Appointment Approved&rdquo; message. You can also send it later.
              </span>
            </span>
            <Switch checked={notify} onCheckedChange={setNotify} aria-label="Send the date and time on WhatsApp" />
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
          <Button
            className={APPT_UI.primaryButton}
            disabled={!slotId || !effectiveDoctorId || isSubmitting}
            onClick={() => onSubmit({ doctor_id: effectiveDoctorId, slot_id: slotId, notify })}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {notify ? "Book & send" : "Book"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

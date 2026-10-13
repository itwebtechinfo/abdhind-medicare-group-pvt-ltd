"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CalendarCheck, CalendarPlus, CheckCircle2, Loader2, RotateCcw, Send, Stethoscope, XCircle } from "lucide-react";
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
import { useMinuteClock } from "@/src/hooks/useMinuteClock";
import { usePermission } from "@/src/hooks/usePermission";
import { toast } from "@/src/lib/toast";
import { cn } from "@/src/lib/utils";
import type { NormalizedApiError } from "@/src/types/api";
import { APPT_UI } from "@/src/features/appointments/StatusBadge";
import { formatClock, friendlyDate, istNow, splitAppointmentDateTime } from "@/src/features/appointments/appointment";
import { ScheduleCheckupDialog } from "./ScheduleCheckupDialog";
import { CHECKUPS_KEY, checkupService, isLiveAppointment, notifyStatusNote } from "./checkups";

const CLOSED_VISIBLE_MS = 7 * 24 * 60 * 60 * 1000;

/** "Wed, 15 Oct · 12:00 PM" from a naive-IST appointment_datetime. */
function apptWhen(value: string, todayYmd: string): string {
  const { date, minutes } = splitAppointmentDateTime(value);
  const clock = formatClock(minutes);
  return `${friendlyDate(date, todayYmd)} · ${clock.time} ${clock.period}`;
}

function ago(ms: number, nowMs: number): string {
  const mins = Math.max(0, Math.round((nowMs - ms) / 60_000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

interface Props {
  /** The chat's conversation id (E.164 phone). */
  phone: string;
  /** From the inbox row - the strip only fetches when there is a request. */
  status: "open" | "scheduled" | "closed" | null;
  requestedAt: number | null;
  /** After any change - refreshes the inbox list/header (the chat may leave the check-up group). */
  onChanged: () => void;
}

/** Free routine check-up request for this chat, under the chat header: book
 * the check-up, send the patient the date/time, close or reopen. */
export function CheckupStrip({ phone, status, requestedAt, onChanged }: Props) {
  const queryClient = useQueryClient();
  const { can } = usePermission();
  const canManage = can("appointments:manage");
  const nowMs = useMinuteClock() ?? 0;
  const todayYmd = istNow(nowMs).date;
  const [scheduling, setScheduling] = useState(false);
  const [closing, setClosing] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: req } = useQuery({
    queryKey: [...CHECKUPS_KEY, "phone", phone, status, requestedAt],
    queryFn: async () => (await checkupService.list({ status: "all", phone, limit: 1 })).data.requests[0] ?? null,
    enabled: Boolean(status),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: CHECKUPS_KEY });
    onChanged();
  };
  const fail = (err: unknown) => {
    const e = err as NormalizedApiError;
    toast.error(e.error ?? "Something went wrong", e.msg);
    refresh();
  };
  const run = async (action: () => Promise<unknown>, success: string) => {
    setBusy(true);
    try {
      await action();
      toast.success(success);
      refresh();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const schedule = useMutation({
    mutationFn: (v: { doctor_id: string; slot_id: string; notify: boolean }) => checkupService.schedule(req!.id, v),
    onSuccess: (res) => {
      const { request, notify_status } = res.data;
      const when = request.appointment ? apptWhen(request.appointment.appointment_datetime, todayYmd) : "";
      if (notify_status && notify_status !== "sent") {
        toast.warning("Check-up booked, message not sent", notifyStatusNote(notify_status) ?? undefined);
      } else {
        toast.success("Check-up booked", notify_status === "sent" ? `${when} — sent to the patient on WhatsApp.` : when);
      }
      setScheduling(false);
      refresh();
    },
    onError: fail,
  });

  if (!status || !req) return null;
  if (req.status === "closed" && nowMs - (req.closed_at ?? 0) > CLOSED_VISIBLE_MS) return null;
  if (req.status === "scheduled" && req.appointment?.status === "COMPLETED") return null;

  const live = isLiveAppointment(req.appointment);
  const note = notifyStatusNote(req.notify_status);
  return (
    <div data-testid="checkup-strip" className="border-b border-sky-200 bg-sky-50/80 px-4 py-2.5 text-sm text-sky-950 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="min-w-0 space-y-0.5">
          <p className="flex flex-wrap items-center gap-x-1.5 font-medium">
            <Stethoscope className="h-4 w-4 shrink-0" aria-hidden />
            {req.status === "open" ? "Free Routine Check-up request"
              : req.status === "closed" ? "Check-up request closed"
                : live ? "Free check-up booked" : "Check-up appointment cancelled"}
            {req.status === "open" && (
              <span className="font-normal text-sky-900/80 dark:text-sky-200/80">
                · {ago(req.last_requested_at, nowMs)}{req.request_count > 1 ? ` · asked ${req.request_count} times` : ""}
              </span>
            )}
          </p>

          {req.status === "open" && req.upcoming && (
            <p className="flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Already has an appointment: {apptWhen(req.upcoming.appointment_datetime, todayYmd)}
              {req.upcoming.reference_code ? ` (${req.upcoming.reference_code})` : ""}
            </p>
          )}
          {req.status === "open" && !req.patient && (
            <p className="text-xs text-sky-900/80 dark:text-sky-200/80">New number — a patient record is created when you book.</p>
          )}
          {req.appointment && (
            <p className={cn("flex flex-wrap items-center gap-x-1.5 text-xs", !live && "line-through opacity-70")}>
              <CalendarCheck className="h-3.5 w-3.5" aria-hidden />
              <span className="font-medium">{apptWhen(req.appointment.appointment_datetime, todayYmd)}</span>
              {req.appointment.doctor_name && <span>· {req.appointment.doctor_name}</span>}
              {req.appointment.reference_code && <span className="font-mono">· {req.appointment.reference_code}</span>}
            </p>
          )}
          {req.status === "scheduled" && live && (
            req.notified_at && !note ? (
              <p className="flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Date &amp; time sent to the patient
              </p>
            ) : (
              <p className="flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> {note ?? "Date & time not sent to the patient yet."}
              </p>
            )
          )}
          {req.status === "closed" && req.close_reason && (
            <p className="text-xs text-sky-900/80 dark:text-sky-200/80">“{req.close_reason}”{req.closed_by?.name ? ` — ${req.closed_by.name}` : ""}</p>
          )}
        </div>

        {canManage && (
          <div className="flex shrink-0 flex-wrap gap-2">
            {req.status === "open" && (
              <>
                <Button size="sm" variant="outline" className="h-8 gap-1.5 bg-card shadow-none" disabled={busy}
                        onClick={() => { setReason(""); setClosing(true); }}>
                  <XCircle className="h-4 w-4" /> Close
                </Button>
                <Button size="sm" className={cn("h-8 gap-1.5", APPT_UI.primaryButton)} disabled={busy} onClick={() => setScheduling(true)}>
                  <CalendarPlus className="h-4 w-4" /> Book check-up
                </Button>
              </>
            )}
            {req.status === "scheduled" && live && (
              <Button size="sm" variant="outline" className="h-8 gap-1.5 bg-card shadow-none" disabled={busy}
                      onClick={() => run(() => checkupService.notify(req.id), "Date & time sent on WhatsApp")}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {req.notified_at ? "Send again" : "Send update"}
              </Button>
            )}
            {(req.status === "closed" || (req.status === "scheduled" && req.appointment?.status === "CANCELLED")) && (
              <Button size="sm" variant="outline" className="h-8 gap-1.5 bg-card shadow-none" disabled={busy}
                      onClick={() => run(() => checkupService.reopen(req.id), "Check-up request reopened")}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                {req.status === "closed" ? "Reopen" : "Book again"}
              </Button>
            )}
          </div>
        )}
      </div>

      <ScheduleCheckupDialog
        key={scheduling ? req.id : "closed"}
        request={scheduling ? req : null}
        isSubmitting={schedule.isPending}
        onOpenChange={(o) => !o && setScheduling(false)}
        onSubmit={(v) => schedule.mutate(v)}
      />

      <Dialog open={closing} onOpenChange={(o) => !busy && setClosing(o)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Close this check-up request?</DialogTitle>
            <DialogDescription>
              Use this when no check-up is needed — e.g. the patient couldn&rsquo;t be reached or already visited.
              Nothing is sent to the patient. You can reopen it later.
            </DialogDescription>
          </DialogHeader>
          <div>
            <label htmlFor="checkup-close-reason" className="mb-1.5 block text-sm font-medium">Reason (optional)</label>
            <Textarea id="checkup-close-reason" maxLength={200} rows={3} value={reason}
                      onChange={(e) => setReason(e.target.value)} placeholder="e.g. Not reachable on phone" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClosing(false)} disabled={busy}>Keep open</Button>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={async () => {
                await run(() => checkupService.close(req.id, reason.trim()), "Check-up request closed");
                setClosing(false);
              }}
            >
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Close request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


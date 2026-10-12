"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CalendarCheck,
  CalendarPlus,
  CheckCircle2,
  Loader2,
  MessageCircle,
  RotateCcw,
  Search,
  Send,
  Stethoscope,
  XCircle,
} from "lucide-react";
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
import { Skeleton } from "@/src/components/ui/skeleton";
import { Textarea } from "@/src/components/ui/textarea";
import { useMinuteClock } from "@/src/hooks/useMinuteClock";
import { usePermission } from "@/src/hooks/usePermission";
import { toast } from "@/src/lib/toast";
import { cn } from "@/src/lib/utils";
import type { NormalizedApiError } from "@/src/types/api";
import { APPT_UI } from "@/src/features/appointments/StatusBadge";
import { BlockError } from "@/src/features/dashboard/BlockCard";
import {
  dayMonth,
  formatClock,
  friendlyDate,
  istNow,
  splitAppointmentDateTime,
} from "@/src/features/appointments/appointment";
import { ScheduleCheckupDialog } from "./ScheduleCheckupDialog";
import {
  CHECKUPS_KEY,
  checkupService,
  isLiveAppointment,
  notifyStatusNote,
  type CheckupAppointment,
  type CheckupRequest,
  type CheckupTab,
} from "./checkups";

const TABS: { key: CheckupTab; label: string }[] = [
  { key: "open", label: "New requests" },
  { key: "scheduled", label: "Booked" },
  { key: "closed", label: "Closed" },
  { key: "all", label: "All" },
];
const PAGE_SIZE = 100;

/** "Wed, 15 Oct · 12:00 PM" from a naive-IST appointment_datetime. */
function apptWhen(value: string, todayYmd: string): string {
  const { date, minutes } = splitAppointmentDateTime(value);
  const clock = formatClock(minutes);
  return `${friendlyDate(date, todayYmd)} · ${clock.time} ${clock.period}`;
}

/** Epoch ms -> "12 Oct, 3:10 PM" (IST). */
function epochWhen(ms: number | null, todayYmd: string): string {
  if (!ms) return "—";
  const { date, minutes } = istNow(ms);
  const clock = formatClock(minutes);
  return `${dayMonth(date, todayYmd)}, ${clock.time} ${clock.period}`;
}

/** "just now" / "3 hours ago" / "2 days ago". */
function ago(ms: number, nowMs: number): string {
  const mins = Math.max(0, Math.round((nowMs - ms) / 60_000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

/** WhatsApp > Free Routine Check-up. Patients who tapped "Routine Check-up" on
 * the 3-month reminder; staff pick a date/time and send it to them. */
export function CheckupsBoard() {
  const queryClient = useQueryClient();
  const { can } = usePermission();
  const canManage = can("appointments:manage");
  const [tab, setTab] = useState<CheckupTab>("open");
  const [search, setSearch] = useState("");
  const [scheduling, setScheduling] = useState<CheckupRequest | null>(null);
  const [closing, setClosing] = useState<CheckupRequest | null>(null);
  const [closeReason, setCloseReason] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const nowMs = useMinuteClock() ?? 0;
  const todayYmd = istNow(nowMs).date;
  // Search hits the API - wait for a pause in typing.
  const [term, setTerm] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setTerm(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: [...CHECKUPS_KEY, tab, term],
    queryFn: async () => (await checkupService.list({ status: tab, q: term, limit: PAGE_SIZE })).data,
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: CHECKUPS_KEY });
  const fail = (err: unknown) => {
    const e = err as NormalizedApiError;
    toast.error(e.error ?? "Something went wrong", e.msg);
    invalidate();
  };

  const scheduleMutation = useMutation({
    mutationFn: (v: { id: string; doctor_id: string; slot_id: string; notify: boolean }) =>
      checkupService.schedule(v.id, { doctor_id: v.doctor_id, slot_id: v.slot_id, notify: v.notify }),
    onSuccess: (res) => {
      const { request, notify_status } = res.data;
      const when = request.appointment ? apptWhen(request.appointment.appointment_datetime, todayYmd) : "";
      if (notify_status && notify_status !== "sent") {
        toast.warning("Check-up booked, message not sent", notifyStatusNote(notify_status) ?? undefined);
      } else {
        toast.success("Check-up booked", notify_status === "sent" ? `${when} — sent to the patient on WhatsApp.` : when);
      }
      setScheduling(null);
      invalidate();
    },
    onError: fail,
  });

  const run = async (id: string, action: () => Promise<unknown>, success: string) => {
    setBusyId(id);
    try {
      await action();
      toast.success(success);
      invalidate();
    } catch (err) {
      fail(err);
    } finally {
      setBusyId(null);
    }
  };

  const counts = data?.counts;
  const requests = data?.requests ?? [];
  return (
    <div className="-m-4 min-h-full bg-[#F5F7F6] p-4 dark:bg-background sm:-m-5 sm:p-5 lg:-m-6 lg:p-6 xl:-m-8 xl:p-8">
      <div className="mx-auto w-full max-w-[1200px] space-y-4">
        <header>
          <h1 className={cn("text-3xl font-semibold tracking-tight", APPT_UI.ink)}>Free Routine Check-up</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Patients who tapped <span className="font-medium text-foreground">Routine Check-up</span>{" "}on the
            3-month check-up reminder. Pick a date &amp; time, then send them the details.
          </p>
        </header>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div role="tablist" aria-label="Filter requests" className={cn(APPT_UI.card, "flex w-fit flex-wrap gap-1 p-1")}>
            {TABS.map((t) => {
              const count = t.key === "all" ? undefined : counts?.[t.key];
              return (
                <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
                        className={cn("flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm",
                          tab === t.key ? "bg-[#17261F] font-semibold text-white dark:bg-foreground dark:text-background" : "hover:bg-muted")}>
                  {t.label}
                  {count !== undefined && (
                    <span className={cn("min-w-5 rounded-full px-1.5 text-center text-xs tabular-nums",
                      tab === t.key ? "bg-white/20" : t.key === "open" && count > 0 ? "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200" : "bg-muted text-muted-foreground")}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="relative lg:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, phone or UHID"
                   aria-label="Search requests" className="h-9 bg-card pl-9 shadow-none" />
            {isFetching && !isLoading && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden />
            )}
          </div>
        </div>

        <section aria-label="Check-up requests" className="space-y-3">
          {isLoading ? (
            Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          ) : isError ? (
            <div className={APPT_UI.card}><BlockError onRetry={() => refetch()} /></div>
          ) : requests.length === 0 ? (
            <div className={cn(APPT_UI.card, "flex flex-col items-center gap-2 px-6 py-14 text-center")}>
              <Stethoscope className="h-8 w-8 text-muted-foreground" aria-hidden />
              <p className="text-sm text-muted-foreground">
                {term ? `No requests match “${term}”.`
                  : tab === "open" ? "No new check-up requests. They appear here when a patient taps Routine Check-up."
                    : "Nothing here yet."}
              </p>
            </div>
          ) : (
            requests.map((r) => (
              <RequestCard
                key={r.id}
                r={r}
                todayYmd={todayYmd}
                nowMs={nowMs}
                canManage={canManage}
                busy={busyId === r.id}
                onSchedule={() => setScheduling(r)}
                onClose={() => { setCloseReason(""); setClosing(r); }}
                onNotify={() => run(r.id, () => checkupService.notify(r.id), "Appointment details sent on WhatsApp")}
                onReopen={() => run(r.id, () => checkupService.reopen(r.id), "Moved back to new requests")}
              />
            ))
          )}
          {data && data.total > requests.length && (
            <p className="text-center text-xs text-muted-foreground">
              Showing {requests.length} of {data.total} — search to narrow it down.
            </p>
          )}
        </section>
      </div>

      <ScheduleCheckupDialog
        key={scheduling?.id ?? "none"}
        request={scheduling}
        isSubmitting={scheduleMutation.isPending}
        onOpenChange={(o) => !o && setScheduling(null)}
        onSubmit={(v) => scheduling && scheduleMutation.mutate({ id: scheduling.id, ...v })}
      />

      <Dialog open={Boolean(closing)} onOpenChange={(o) => !o && busyId === null && setClosing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Close this request?</DialogTitle>
            <DialogDescription>
              Use this when no check-up is needed — e.g. the patient couldn&rsquo;t be reached or already visited.
              Nothing is sent to the patient. You can reopen it later.
            </DialogDescription>
          </DialogHeader>
          <div>
            <label htmlFor="checkup-close-reason" className="mb-1.5 block text-sm font-medium">Reason (optional)</label>
            <Textarea id="checkup-close-reason" maxLength={200} rows={3} value={closeReason}
                      onChange={(e) => setCloseReason(e.target.value)} placeholder="e.g. Not reachable on phone" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClosing(null)} disabled={busyId !== null}>Keep open</Button>
            <Button
              variant="destructive"
              disabled={busyId !== null}
              onClick={async () => {
                if (!closing) return;
                await run(closing.id, () => checkupService.close(closing.id, closeReason.trim()), "Request closed");
                setClosing(null);
              }}
            >
              {busyId !== null && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Close request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RequestCard({ r, todayYmd, nowMs, canManage, busy, onSchedule, onClose, onNotify, onReopen }: {
  r: CheckupRequest;
  todayYmd: string;
  nowMs: number;
  canManage: boolean;
  busy: boolean;
  onSchedule: () => void;
  onClose: () => void;
  onNotify: () => void;
  onReopen: () => void;
}) {
  const name = r.patient?.full_name ?? r.patient_name ?? "Unknown patient";
  const meta = [r.patient?.uhid, r.patient?.age ? `${r.patient.age} yrs` : null, r.patient?.gender].filter(Boolean).join(" · ");
  const live = isLiveAppointment(r.appointment);
  const note = notifyStatusNote(r.notify_status);
  return (
    <article className={cn(APPT_UI.card, "p-4 sm:p-5")}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h2 className={cn("truncate text-base font-semibold", APPT_UI.ink)}>{name}</h2>
            <StatusChip r={r} live={live} />
            {!r.patient && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">New number — no patient record yet</span>
            )}
          </div>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="tabular-nums">{r.phone}</span>
            {meta && <span>{meta}</span>}
            <Link href={`/whatsapp?c=${encodeURIComponent(r.phone)}`}
                  className="inline-flex items-center gap-1 font-medium text-[#1F7A4A] hover:underline dark:text-primary">
              <MessageCircle className="h-3.5 w-3.5" /> Open chat
            </Link>
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Requested </span>
            <span title={epochWhen(r.last_requested_at, todayYmd)}>{ago(r.last_requested_at, nowMs)}</span>
            {r.request_count > 1 && <span className="text-muted-foreground"> · asked {r.request_count} times</span>}
            {r.last_visit && (
              <>
                <span className="text-muted-foreground"> · Last visit </span>
                {friendlyDate(splitAppointmentDateTime(r.last_visit.appointment_datetime).date, todayYmd)}
                {r.last_visit.doctor_name && <span className="text-muted-foreground"> with {r.last_visit.doctor_name}</span>}
              </>
            )}
          </p>

          {r.upcoming && r.status === "open" && (
            <p role="note" className="flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              Already has an appointment: {apptWhen(r.upcoming.appointment_datetime, todayYmd)}
              {r.upcoming.reference_code ? ` (${r.upcoming.reference_code})` : ""}. Check before booking another one.
            </p>
          )}

          {r.appointment && <BookedLine a={r.appointment} todayYmd={todayYmd} live={live} />}
          {r.status === "scheduled" && live && (
            r.notified_at && !note ? (
              <p className="flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Sent to the patient on WhatsApp · {epochWhen(r.notified_at, todayYmd)}
              </p>
            ) : (
              <p className="flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> {note ?? "Not sent to the patient yet."}
              </p>
            )
          )}
          {r.status === "closed" && (
            <p className="text-xs text-muted-foreground">
              Closed {epochWhen(r.closed_at, todayYmd)}{r.closed_by?.name ? ` by ${r.closed_by.name}` : ""}
              {r.close_reason ? ` — “${r.close_reason}”` : ""}
            </p>
          )}
        </div>

        {canManage && (
          <div className="flex shrink-0 flex-wrap gap-2 md:justify-end">
            {r.status === "open" && (
              <>
                <Button size="sm" variant="outline" className="gap-1.5 shadow-none" disabled={busy} onClick={onClose}>
                  <XCircle className="h-4 w-4" /> Close
                </Button>
                <Button size="sm" className={cn("gap-1.5", APPT_UI.primaryButton)} disabled={busy} onClick={onSchedule}>
                  <CalendarPlus className="h-4 w-4" /> Book check-up
                </Button>
              </>
            )}
            {r.status === "scheduled" && live && (
              <Button size="sm" variant="outline" className="gap-1.5 shadow-none" disabled={busy} onClick={onNotify}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {r.notified_at ? "Send again" : "Send update"}
              </Button>
            )}
            {(r.status === "closed" || (r.status === "scheduled" && r.appointment?.status === "CANCELLED")) && (
              <Button size="sm" variant="outline" className="gap-1.5 shadow-none" disabled={busy} onClick={onReopen}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                {r.status === "closed" ? "Reopen" : "Book again"}
              </Button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function StatusChip({ r, live }: { r: CheckupRequest; live: boolean }) {
  const [text, tone] =
    r.status === "open" ? ["New", "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"]
      : r.status === "closed" ? ["Closed", "bg-muted text-muted-foreground"]
        : r.appointment?.status === "COMPLETED" ? ["Visited", "bg-green-50 text-green-800 dark:bg-green-500/15 dark:text-green-300"]
          : live ? ["Booked", "bg-blue-50 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300"]
            : ["Appointment cancelled", "bg-red-50 text-red-800 dark:bg-red-500/15 dark:text-red-300"];
  return <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", tone)}>{text}</span>;
}

function BookedLine({ a, todayYmd, live }: { a: CheckupAppointment; todayYmd: string; live: boolean }) {
  return (
    <p className={cn("flex flex-wrap items-center gap-x-1.5 text-sm", !live && a.status !== "COMPLETED" && "text-muted-foreground line-through")}>
      <CalendarCheck className="h-4 w-4 text-[#1F7A4A] dark:text-primary" aria-hidden />
      <span className="font-medium">{apptWhen(a.appointment_datetime, todayYmd)}</span>
      {a.doctor_name && <span className="text-muted-foreground">· {a.doctor_name}</span>}
      {a.reference_code && <span className="font-mono text-xs text-muted-foreground">· {a.reference_code}</span>}
    </p>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronRight, FileText, Link2, Loader2, Search, Sparkles, UserPlus, UserRound, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { usePermission } from "@/src/hooks/usePermission";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { languageLabel } from "@/src/lib/format";
import { toast } from "@/src/lib/toast";
import { cn } from "@/src/lib/utils";
import type { NormalizedApiError } from "@/src/types/api";
import { avatarColor, initials } from "@/src/features/appointments/AppointmentRow";
import { APPT_UI } from "@/src/features/appointments/StatusBadge";
import { doctorService } from "@/src/features/doctors/doctor";
import { PatientFormDialog } from "@/src/features/patients/PatientFormDialog";
import { LastVisitSummary, NextAppointmentSummary } from "@/src/features/patients/PatientRow";
import { mapVisitSummary, patientService, type CreatePatientFormValues } from "@/src/features/patients/patient";
import { inboxService, istDayStart, newClientId, type InboxAction, type InboxHeader, type PatientContext } from "./inbox";
import { useInbox } from "./InboxProvider";

const DAY = 86_400_000;
const shortDate = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", timeZone: "Asia/Kolkata" });
const longDay = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

function ymd(ms: number): string {
  return new Date(ms + 5.5 * 3_600_000).toISOString().slice(0, 10);
}

function clock12(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")}`;
}

export function PatientPanel({ onCollapse, mobile }: { onCollapse: () => void; mobile?: boolean }) {
  const { state, putHeader, putContext, putMessage, syncNow } = useInbox();
  const open = state.open;
  if (!open) return null;
  const h = open.conversation;
  const ctx = open.context;

  const run = async (action: InboxAction) => {
    const res = await inboxService.action(h.id, action);
    putHeader(res.data.conversation);
    if (res.data.context) putContext(res.data.context);
    if (res.data.message) putMessage(res.data.message);
    syncNow();
    return res.data;
  };

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-y-auto bg-card" aria-label="Patient details" data-testid="patient-panel">
      <div className="flex items-start gap-3 border-b border-[#E3E9E5] p-4 dark:border-border">
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-semibold", ctx.patient ? avatarColor(h.id) : "bg-muted text-muted-foreground")}>
          {ctx.patient ? initials(ctx.patient.name) : <UserRound className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-[#17261F] dark:text-foreground">{ctx.patient?.name ?? ctx.profile_name ?? "Unknown number"}</p>
          <p className="truncate text-sm text-muted-foreground">
            {ctx.patient
              ? [ctx.patient.age && `${ctx.patient.age}`, ctx.patient.gender, ctx.patient.uhid].filter(Boolean).join(" · ")
              : "Not linked to a patient record"}
          </p>
        </div>
        <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={onCollapse} aria-label={mobile ? "Close patient details" : "Collapse patient panel"}>
          {mobile ? <X className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      <div className="space-y-4 p-4">
        {open.ai?.summary && (
          <section className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm dark:border-violet-500/30 dark:bg-violet-500/10" data-testid="ai-summary">
            <p className="mb-1 flex items-center gap-1 font-semibold text-violet-700 dark:text-violet-300"><Sparkles className="h-4 w-4" />Chat summary</p>
            <p>{open.ai.summary}</p>
          </section>
        )}
        {ctx.patient ? (
          <KnownPatient h={h} ctx={ctx} run={run} />
        ) : (
          <UnknownNumber h={h} ctx={ctx} run={run} />
        )}
      </div>
    </aside>
  );
}

function KnownPatient({ h, ctx, run }: { h: InboxHeader; ctx: PatientContext; run: (a: InboxAction) => Promise<unknown> }) {
  const { state } = useInbox();
  const { canAction } = usePermission();
  const p = ctx.patient!;
  const todayYmd = ymd(state.now);
  const summary = useMemo(() => mapVisitSummary(p.visit_summary), [p.visit_summary]);
  const [reportOpen, setReportOpen] = useState(false);
  const canBook = canAction("appointments", "manage") && Boolean(state.me?.can_reply);

  return (
    <>
      {canBook && <QuickBook h={h} lastDoctorId={p.last_doctor_id} run={run} />}

      <section className="rounded-xl border border-[#E3E9E5] p-3 text-sm dark:border-border" aria-label="Patient">
        <p className="mb-2 font-semibold text-muted-foreground">Patient</p>
        <dl className="grid grid-cols-[96px_1fr] gap-y-2">
          <dt className="text-muted-foreground">Next visit</dt>
          <dd className="min-w-0">{summary.next_appointment ? <NextAppointmentSummary next={summary.next_appointment} todayYmd={todayYmd} /> : <span className="font-semibold">None booked</span>}</dd>
          <dt className="text-muted-foreground">Last visit</dt>
          <dd className="min-w-0">{summary.last_visit || summary.missed ? <LastVisitSummary summary={summary} todayYmd={todayYmd} /> : <span className="font-semibold">No visits yet</span>}</dd>
          <dt className="text-muted-foreground">Language</dt>
          <dd className="font-semibold">{languageLabel(p.language)}</dd>
          <dt className="text-muted-foreground">Visits</dt>
          <dd className="font-semibold" data-testid="visit-counts">{p.visits.completed} completed, {p.visits.missed} missed</dd>
        </dl>
      </section>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          className="font-semibold"
          onClick={() => setReportOpen(true)}
          disabled={!state.me?.can_reply || !h.window.open || h.blocked || !(ctx.reports?.length)}
          title={
            !h.window.open ? "The 24-hour window is closed and no approved template can carry a document - ask the patient to message first."
            : !(ctx.reports?.length) ? "No lab report files for this patient yet." : undefined
          }
        >
          <FileText className="mr-1.5 h-4 w-4" />Send report
        </Button>
        <Button variant="outline" className="font-semibold" asChild>
          <Link href={`/patients?open=${encodeURIComponent(p.uhid)}`}>View patient</Link>
        </Button>
      </div>

      <section aria-label="Activity">
        <p className="mb-2 font-semibold text-muted-foreground">Activity</p>
        {ctx.activity?.length ? (
          <ol className="space-y-2.5" data-testid="activity">
            {ctx.activity.map((a, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-muted-foreground/60" />
                <span><strong>{shortDate.format(a.at)}</strong> · {a.text}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        )}
      </section>

      <SendReportDialog open={reportOpen} onOpenChange={setReportOpen} ctx={ctx} run={run} />
    </>
  );
}

function QuickBook({ h, lastDoctorId, run }: { h: InboxHeader; lastDoctorId: string | null; run: (a: InboxAction) => Promise<unknown> }) {
  const { state } = useInbox();
  const tomorrow = ymd(istDayStart(state.now) + DAY + 12 * 3_600_000);
  const [date, setDate] = useState(tomorrow);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [slotId, setSlotId] = useState<string | null>(null);

  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors", "active"],
    queryFn: async () => (await doctorService.list()).data.doctors.filter((d) => d.active),
    staleTime: 5 * 60_000,
  });
  const chosenDoctor = doctorId ?? (doctors.find((d) => d.id === lastDoctorId) ?? doctors[0])?.id ?? null;
  const { data: slots = [], isFetching } = useQuery({
    queryKey: ["doctors", chosenDoctor, "slots", date],
    queryFn: async () => (await doctorService.listSlots(chosenDoctor!, date)).data.slots.filter((s) => !s.is_booked),
    enabled: Boolean(chosenDoctor && date),
  });
  const slot = slots.find((s) => s.id === slotId);

  const book = useMutation({
    mutationFn: () => run({ type: "book", doctor_id: chosenDoctor!, slot_id: slotId! }),
    onSuccess: () => {
      toast.success("Appointment booked", "Confirmation sent on WhatsApp.");
      setSlotId(null);
    },
    onError: (err: NormalizedApiError) => toast.error(err.error || "Not booked", err.msg),
  });

  return (
    <section className="rounded-xl border border-[#E3E9E5] p-3 dark:border-border" aria-label="Quick book" data-testid="quick-book">
      <p className="mb-2 text-sm font-semibold text-muted-foreground">
        Quick book · {date === tomorrow ? "Tomorrow, " : ""}{longDay.format(new Date(`${date}T00:00:00Z`))}
      </p>
      <div className="mb-2 grid grid-cols-[minmax(0,1fr)_138px] gap-2">
        <select
          className="h-9 min-w-0 rounded-md border border-input bg-background px-2 text-sm"
          value={chosenDoctor ?? ""}
          onChange={(e) => { setDoctorId(e.target.value); setSlotId(null); }}
          aria-label="Doctor"
        >
          {doctors.map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}
        </select>
        <Input type="date" className="h-9 w-full px-2" value={date} min={ymd(state.now)} onChange={(e) => { if (e.target.value) { setDate(e.target.value); setSlotId(null); } }} aria-label="Date" />
      </div>
      <div className="mb-3 flex min-h-9 flex-wrap gap-1.5">
        {isFetching ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : !slots.length ? (
          <p className="text-sm text-muted-foreground">No open slots that day.</p>
        ) : slots.slice(0, 12).map((s) => (
          <button key={s.id} type="button" onClick={() => setSlotId(s.id)} aria-pressed={slotId === s.id}
            className={cn("rounded-md border px-2.5 py-1 text-sm font-semibold",
              slotId === s.id ? "border-[#1F7A4A] bg-[#1F7A4A] text-white dark:border-primary dark:bg-primary dark:text-primary-foreground" : "border-[#1F7A4A]/30 text-[#1F7A4A] hover:bg-[#1F7A4A]/5 dark:text-primary")}>
            {clock12(s.start_time)}
          </button>
        ))}
      </div>
      <Button className={cn("w-full", APPT_UI.primaryButton)} disabled={!slot || book.isPending || h.blocked} onClick={() => book.mutate()}>
        {book.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
        {slot ? `Book ${clock12(slot.start_time)} ${Number(slot.start_time.slice(0, 2)) < 12 ? "AM" : "PM"} & send confirmation` : "Pick a slot"}
      </Button>
    </section>
  );
}

function SendReportDialog({ open, onOpenChange, ctx, run }: { open: boolean; onOpenChange: (o: boolean) => void; ctx: PatientContext; run: (a: InboxAction) => Promise<unknown> }) {
  const send = useMutation({
    mutationFn: (labOrderId: string) => run({ type: "send_report", lab_order_id: labOrderId, client_id: newClientId() }),
    onSuccess: () => {
      toast.success("Report sent on WhatsApp");
      onOpenChange(false);
    },
    onError: (err: NormalizedApiError) => toast.error(err.error || "Not sent", err.msg),
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send a report</DialogTitle>
          <DialogDescription>Sent as a WhatsApp document to {ctx.patient?.name}.</DialogDescription>
        </DialogHeader>
        <ul className="space-y-2">
          {(ctx.reports ?? []).map((r) => (
            <li key={r.id}>
              <button type="button" disabled={send.isPending} onClick={() => send.mutate(r.id)}
                className="flex w-full items-center gap-3 rounded-lg border p-3 text-left hover:bg-muted disabled:opacity-60">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-red-50 text-xs font-bold text-red-600 dark:bg-red-500/15 dark:text-red-300">PDF</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{r.name}</span>
                  <span className="text-xs text-muted-foreground">{r.completed_at ? shortDate.format(r.completed_at) : ""} · {r.filename}</span>
                </span>
                {send.isPending && send.variables === r.id && <Loader2 className="h-4 w-4 animate-spin" />}
              </button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

function UnknownNumber({ h, ctx, run }: { h: InboxHeader; ctx: PatientContext; run: (a: InboxAction) => Promise<unknown> }) {
  const { canAction } = usePermission();
  const [createOpen, setCreateOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const digits = h.id.replace(/\D/g, "");
  const national = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : "";

  const create = useMutation({
    mutationFn: async (values: CreatePatientFormValues) => {
      const res = await patientService.create({
        full_name: values.full_name, phone: values.phone, age: Number(values.age), gender: values.gender, address: values.address,
      });
      await run({ type: "link_patient", patient_id: res.data.patient.id });
      return res;
    },
    onSuccess: () => {
      toast.success("Patient created and linked");
      setCreateOpen(false);
    },
    onError: (err: NormalizedApiError) => toast.error(err.error || "Not created", err.msg),
  });

  return (
    <section className="space-y-3 rounded-xl border border-dashed border-[#E3E9E5] p-4 text-sm dark:border-border" data-testid="unknown-number">
      <p className="text-muted-foreground">
        {ctx.profile_name ? <>WhatsApp name <strong className="text-foreground">{ctx.profile_name}</strong>. </> : null}
        This number isn&apos;t linked to a patient record.
      </p>
      {canAction("patients", "create") && (
        <Button className={cn("w-full", APPT_UI.primaryButton)} onClick={() => setCreateOpen(true)}>
          <UserPlus className="mr-1.5 h-4 w-4" />Create patient
        </Button>
      )}
      <Button variant="outline" className="w-full" onClick={() => setLinkOpen(true)}>
        <Link2 className="mr-1.5 h-4 w-4" />Link to existing patient
      </Button>
      <PatientFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaults={{ phone: national, full_name: ctx.profile_name ?? "" }}
        isSubmitting={create.isPending}
        onCreate={(values) => create.mutate(values)}
        onUpdate={() => undefined}
      />
      <LinkPatientDialog open={linkOpen} onOpenChange={setLinkOpen} run={run} />
    </section>
  );
}

function LinkPatientDialog({ open, onOpenChange, run }: { open: boolean; onOpenChange: (o: boolean) => void; run: (a: InboxAction) => Promise<unknown> }) {
  const [q, setQ] = useState("");
  const debounced = useDebouncedValue(q.trim(), 300);
  const { data = [], isFetching } = useQuery({
    queryKey: ["patients", "link-search", debounced],
    queryFn: async () => (await patientService.listPage({ search: debounced, limit: 10, offset: 0 })).data.patients,
    enabled: open && debounced.length >= 2,
  });
  const link = useMutation({
    mutationFn: (patientId: string) => run({ type: "link_patient", patient_id: patientId }),
    onSuccess: () => {
      toast.success("Linked to patient");
      onOpenChange(false);
    },
    onError: (err: NormalizedApiError) => toast.error(err.error || "Not linked", err.msg),
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Link to an existing patient</DialogTitle>
          <DialogDescription>For a patient writing from a different number (e.g. a family member&apos;s phone).</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, UHID or phone" className="pl-9" aria-label="Search patients" />
        </div>
        <ul className="max-h-[45vh] space-y-1 overflow-y-auto">
          {isFetching && <li className="flex justify-center p-2"><Loader2 className="h-4 w-4 animate-spin" /></li>}
          {data.map((p) => (
            <li key={p.id}>
              <button type="button" disabled={link.isPending} onClick={() => link.mutate(p.id)} className="w-full rounded-md p-2 text-left hover:bg-muted">
                <span className="font-medium">{p.full_name}</span>
                <span className="block text-xs text-muted-foreground">{p.uhid} · {p.phone}</span>
              </button>
            </li>
          ))}
          {debounced.length >= 2 && !isFetching && !data.length && <li className="p-2 text-sm text-muted-foreground">No patients match.</li>}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

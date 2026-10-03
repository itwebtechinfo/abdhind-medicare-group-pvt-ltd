"use client";

import { useState } from "react";
import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import { FileText, MessageCircle, Phone, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { usePermission } from "@/src/hooks/usePermission";
import { languageLabel } from "@/src/lib/format";
import { openPrivateUpload } from "@/src/lib/upload";
import { cn } from "@/src/lib/utils";
import {
  appointmentService,
  CLINIC_TIME_ZONE,
  dayMonth,
  formatClock,
  formatCreatedAt,
  friendlyDate,
  getDisplayStatus,
  sourceLabel,
  splitAppointmentDateTime,
  type AppointmentStatus,
} from "@/src/features/appointments/appointment";
import { avatarColor, initials, SourceIcon } from "@/src/features/appointments/AppointmentRow";
import { APPT_UI, STATUS_META, StatusBadge } from "@/src/features/appointments/StatusBadge";
import {
  formatPatientPhone,
  patientPhoneE164,
  patientService,
  type PatientActivityEntry,
  type PatientListRow,
} from "./patient";
import { LastVisitSummary, whatsappInboxHref } from "./PatientRow";

type DrawerTab = "overview" | "appointments" | "dispenses" | "lab";

/** Mirrors GET /patients/{id}/lab-orders' role allowlist. */
const LAB_ORDER_ROLES = ["system_admin", "admin", "doctor", "reception", "lab"];

interface PatientDrawerProps {
  patient: PatientListRow | null;
  todayYmd: string;
  onClose: () => void;
  onBook: (p: PatientListRow) => void;
  onEdit: (p: PatientListRow) => void;
  onHistory: (p: PatientListRow) => void;
  /** Opens that appointment in the Appointments page drawer. */
  appointmentHref: (appointmentId: string, patientId: string) => string;
}

/** Right-side panel (full-screen on mobile). Closes on ×, Esc or backdrop click. */
export function PatientDrawer({ patient, onClose, ...rest }: PatientDrawerProps) {
  return (
    <DialogPrimitive.Root open={Boolean(patient)} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-card text-card-foreground shadow-2xl focus:outline-none sm:max-w-[520px] sm:border-l sm:border-[#E3E9E5] sm:dark:border-border"
        >
          {/* Keyed so the selected tab resets when switching patients. */}
          {patient && <DrawerBody key={patient.id} patient={patient} {...rest} />}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function DrawerBody({
  patient: p,
  todayYmd,
  onBook,
  onEdit,
  onHistory,
  appointmentHref,
}: Omit<PatientDrawerProps, "patient" | "onClose"> & { patient: PatientListRow }) {
  const { can, role } = usePermission();
  const [tab, setTab] = useState<DrawerTab>("overview");

  const tabs: { id: DrawerTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "appointments", label: "Appointments" },
    ...(can("pharmacy:manage") ? [{ id: "dispenses" as const, label: "Medicines dispensed" }] : []),
    ...(role && LAB_ORDER_ROLES.includes(role) ? [{ id: "lab" as const, label: "Test reports" }] : []),
  ];

  return (
    <>
      {/* Header */}
      <div className="px-5 pt-5 sm:px-6">
        <div className="flex items-start gap-4">
          <span
            aria-hidden
            className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold", avatarColor(p.id))}
          >
            {initials(p.full_name)}
          </span>
          <div className="min-w-0 flex-1">
            <DialogPrimitive.Title className={cn("truncate text-2xl font-semibold tracking-tight", APPT_UI.ink)}>
              {p.full_name}
            </DialogPrimitive.Title>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {[p.age != null ? `${p.age} years` : null, p.gender || null, p.uhid].filter(Boolean).join(" · ")}
            </p>
          </div>
          <DialogPrimitive.Close className="-mr-1 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </div>

        <div role="tablist" aria-label="Patient sections" className="mt-5 flex gap-5 overflow-x-auto border-b border-[#E3E9E5] dark:border-border">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "-mb-px shrink-0 whitespace-nowrap border-b-2 pb-2.5 text-sm font-medium transition-colors",
                tab === t.id
                  ? "border-[#1F7A4A] text-[#1F7A4A] dark:border-primary dark:text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body — each tab fetches only once it's opened. */}
      <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        {tab === "overview" && (
          <OverviewTab patient={p} todayYmd={todayYmd} onBook={onBook} appointmentHref={appointmentHref} />
        )}
        {tab === "appointments" && <AppointmentsTab patient={p} todayYmd={todayYmd} appointmentHref={appointmentHref} />}
        {tab === "dispenses" && <DispensesTab patientId={p.id} />}
        {tab === "lab" && <LabTab patientId={p.id} todayYmd={todayYmd} />}
      </div>

      {/* Footer */}
      <div className="flex gap-2 border-t border-[#E3E9E5] bg-card px-5 py-4 dark:border-border sm:px-6">
        {can("patients:edit") && (
          <Button variant="outline" className="flex-1 shadow-none" onClick={() => onEdit(p)}>
            Edit details
          </Button>
        )}
        <Button variant="outline" className="flex-1 shadow-none" onClick={() => onHistory(p)}>
          Full history
        </Button>
      </div>
    </>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className={cn("mb-3 text-sm font-semibold", APPT_UI.ink)}>{children}</h3>;
}

function ListSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

function epochDay(ms: number, todayYmd: string): string {
  const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: CLINIC_TIME_ZONE }).format(new Date(ms));
  return dayMonth(ymd, todayYmd);
}

const STATUS_TEXT: Partial<Record<AppointmentStatus, string>> = {
  APPROVED: "Appointment confirmed",
  PATIENT_CONFIRMED: "Patient confirmed on WhatsApp",
  COMPLETED: "Visit completed",
  CANCELLED: "Appointment cancelled",
  PENDING: "Appointment back to needs approval",
};

/** Plain-language line for one real audit-log / registration record. */
function activityText(entry: PatientActivityEntry, todayYmd: string): string {
  if (entry.type === "registered") return "Registered as new patient";
  if (entry.event === "ARRIVED") return "Checked in at the clinic";
  if (entry.old_datetime && entry.new_datetime) {
    const { date, minutes } = splitAppointmentDateTime(entry.new_datetime);
    const clock = formatClock(minutes);
    return `Appointment moved to ${dayMonth(date, todayYmd)}, ${clock.time} ${clock.period}`;
  }
  if (!entry.from_status) return `Booked appointment${entry.source ? ` via ${sourceLabel(entry.source)}` : ""}`;
  return (entry.to_status && STATUS_TEXT[entry.to_status]) || "Appointment updated";
}

function OverviewTab({
  patient: p,
  todayYmd,
  onBook,
  appointmentHref,
}: {
  patient: PatientListRow;
  todayYmd: string;
  onBook: (p: PatientListRow) => void;
  appointmentHref: (appointmentId: string, patientId: string) => string;
}) {
  const { can } = usePermission();
  const { data, isLoading } = useQuery({
    queryKey: ["patients", p.id, "overview"],
    queryFn: async () => (await patientService.overview(p.id)).data,
  });
  // The list row already carries the summary, so the card renders instantly.
  const summary = data?.visit_summary ?? p.visit_summary;
  const next = summary.next_appointment;
  const tel = patientPhoneE164(p.phone);
  const conversationId = data ? data.whatsapp_conversation_id : p.whatsapp_conversation_id;
  const canWhatsApp = can("whatsapp_inbox:view");

  return (
    <div className="space-y-6">
      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-2">
        {can("appointments:create") ? (
          <Button className={APPT_UI.primaryButton} onClick={() => onBook(p)}>
            Book visit
          </Button>
        ) : (
          <span />
        )}
        {canWhatsApp && conversationId ? (
          <Button asChild variant="outline" className="gap-2 shadow-none">
            <Link href={whatsappInboxHref(conversationId)}>
              <MessageCircle className="h-4 w-4 text-[#25D366]" />
              WhatsApp
            </Link>
          </Button>
        ) : (
          // Disabled buttons swallow hover, so the tooltip sits on a wrapper.
          <span
            title={
              canWhatsApp ? "No WhatsApp conversation with this patient yet" : "You don't have access to the WhatsApp inbox"
            }
          >
            <Button variant="outline" className="w-full gap-2 shadow-none" disabled>
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
          </span>
        )}
        {tel ? (
          <Button asChild variant="outline" className="gap-2 shadow-none">
            <a href={`tel:${tel}`}>
              <Phone className="h-4 w-4" />
              Call
            </a>
          </Button>
        ) : (
          <Button variant="outline" className="shadow-none" disabled>
            Call
          </Button>
        )}
      </div>

      <section>
        <SectionTitle>Next appointment</SectionTitle>
        {next ? (
          <Link
            href={appointmentHref(next.id, p.id)}
            className={cn(
              "block rounded-xl border-l-4 p-4 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              STATUS_META[getDisplayStatus(next)].block
            )}
          >
            {(() => {
              const { date, minutes } = splitAppointmentDateTime(next.appointment_datetime);
              const clock = formatClock(minutes);
              return (
                <>
                  <p className="font-semibold">
                    {friendlyDate(date, todayYmd) === "Today" || friendlyDate(date, todayYmd) === "Tomorrow"
                      ? `${friendlyDate(date, todayYmd)}, ${dayMonth(date, todayYmd)}`
                      : friendlyDate(date, todayYmd)}{" "}
                    · {clock.time} {clock.period}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-sm opacity-90">
                    {next.doctor_name ?? "Doctor"} ·
                    <SourceIcon source={next.source} className="h-3.5 w-3.5" />
                    booked via {sourceLabel(next.source)}
                  </p>
                  <StatusBadge status={getDisplayStatus(next)} className="mt-2 bg-white/70 dark:bg-black/20" />
                </>
              );
            })()}
          </Link>
        ) : (
          <p className="text-sm text-muted-foreground">None booked.</p>
        )}
      </section>

      <section>
        <SectionTitle>Last visit</SectionTitle>
        <LastVisitSummary summary={summary} todayYmd={todayYmd} />
      </section>

      <section>
        <SectionTitle>Contact details</SectionTitle>
        <dl className="grid grid-cols-[minmax(120px,auto)_1fr] gap-x-6 gap-y-3 text-sm">
          {[
            { label: "Phone", value: formatPatientPhone(p.phone) },
            { label: "Address", value: p.address || "—" },
            { label: "WhatsApp language", value: languageLabel(p.preferred_language) },
            { label: "Registered", value: formatCreatedAt(p.created_at).replace(/, \d.*$/, "") },
          ].map((row) => (
            <div key={row.label} className="contents">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className={cn("min-w-0 break-words font-medium", APPT_UI.ink)}>{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <SectionTitle>Recent activity</SectionTitle>
        {isLoading ? (
          <ListSkeleton />
        ) : !data || data.recent_activity.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
        ) : (
          <ol className="relative space-y-3 before:absolute before:bottom-2 before:left-[6px] before:top-2 before:w-px before:bg-[#E3E9E5] dark:before:bg-border">
            {data.recent_activity.map((entry, i) => (
              <li key={i} className="relative flex items-baseline gap-3 pl-6 text-sm">
                <span className="absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/50 bg-card" />
                <span className={cn("shrink-0 font-semibold", APPT_UI.ink)}>{epochDay(entry.at, todayYmd)}</span>
                <span className="min-w-0 text-muted-foreground">
                  · {activityText(entry, todayYmd)}
                  {entry.changed_by_name && entry.type === "appointment" && entry.from_status ? ` by ${entry.changed_by_name}` : ""}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function AppointmentsTab({
  patient: p,
  todayYmd,
  appointmentHref,
}: {
  patient: PatientListRow;
  todayYmd: string;
  appointmentHref: (appointmentId: string, patientId: string) => string;
}) {
  const { data = [], isLoading } = useQuery({
    queryKey: ["appointments", "patient-history", p.id],
    queryFn: async () => (await appointmentService.list({ patient_id: p.id })).data.appointments,
  });
  if (isLoading) return <ListSkeleton />;
  if (data.length === 0) return <p className="text-sm text-muted-foreground">No appointments yet.</p>;
  const newestFirst = [...data].sort((a, b) => b.appointment_datetime.localeCompare(a.appointment_datetime));
  return (
    <ul className="divide-y divide-[#E3E9E5] rounded-xl border border-[#E3E9E5] dark:divide-border dark:border-border">
      {newestFirst.map((a) => {
        const { date, minutes } = splitAppointmentDateTime(a.appointment_datetime);
        const clock = formatClock(minutes);
        return (
          <li key={a.id}>
            <Link
              href={appointmentHref(a.id, p.id)}
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/40"
            >
              <div className="min-w-0">
                <p className={cn("truncate font-medium", APPT_UI.ink)}>
                  {friendlyDate(date, todayYmd)} · {clock.time} {clock.period}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {a.doctor?.full_name ?? "Doctor"} · {sourceLabel(a.source)}
                  {a.reference_code ? ` · ${a.reference_code}` : ""}
                </p>
              </div>
              <StatusBadge status={getDisplayStatus(a)} />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function linkedVisit(entry: { appointment?: { appointment_datetime: string } | null }, todayYmd: string): string | null {
  if (!entry.appointment?.appointment_datetime) return null;
  return `Visit on ${dayMonth(splitAppointmentDateTime(entry.appointment.appointment_datetime).date, todayYmd)}`;
}

function DispensesTab({ patientId }: { patientId: string }) {
  const { data = [], isLoading } = useQuery({
    queryKey: ["patients", patientId, "dispenses"],
    queryFn: async () => (await patientService.dispenses(patientId)).data.dispenses,
  });
  if (isLoading) return <ListSkeleton />;
  if (data.length === 0) return <p className="text-sm text-muted-foreground">No medicines dispensed yet.</p>;
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d._id} className="rounded-xl border border-[#E3E9E5] p-4 text-sm dark:border-border">
          <p className="text-xs text-muted-foreground">
            {formatCreatedAt(d.created_at)}
            {d.dispensed_by?.name ? ` · by ${d.dispensed_by.name}` : ""}
          </p>
          <ul className="mt-2 space-y-1">
            {d.items.map((item, i) => (
              <li key={i} className={cn("flex justify-between gap-3", APPT_UI.ink)}>
                <span className="min-w-0 truncate">{item.medicine_name}</span>
                <span className="shrink-0 text-muted-foreground">
                  × {item.quantity} {item.unit}
                </span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

function LabTab({ patientId, todayYmd }: { patientId: string; todayYmd: string }) {
  const { data = [], isLoading } = useQuery({
    queryKey: ["patients", patientId, "lab-orders"],
    queryFn: async () => (await patientService.labOrders(patientId)).data.lab_orders,
  });
  if (isLoading) return <ListSkeleton />;
  if (data.length === 0) return <p className="text-sm text-muted-foreground">No tests ordered yet.</p>;
  return (
    <ul className="space-y-3">
      {data.map((o) => (
        <li key={o._id} className="rounded-xl border border-[#E3E9E5] p-4 text-sm dark:border-border">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={cn("truncate font-semibold", APPT_UI.ink)}>{o.test_name}</p>
              <p className="text-xs text-muted-foreground">
                {[linkedVisit(o, todayYmd), o.ordered_by?.name ? `ordered by ${o.ordered_by.name}` : null]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                o.status === "COMPLETED" ? STATUS_META.completed.pill : STATUS_META.needs_approval.pill
              )}
            >
              {o.status === "COMPLETED" ? "Result ready" : "Awaiting result"}
            </span>
          </div>
          {o.result_text && <p className={cn("mt-2 whitespace-pre-wrap", APPT_UI.ink)}>{o.result_text}</p>}
          {o.result_file && (
            <button
              type="button"
              onClick={() => openPrivateUpload(o.result_file as string)}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#1F7A4A] hover:underline dark:text-primary"
            >
              <FileText className="h-3.5 w-3.5" />
              Open report file
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

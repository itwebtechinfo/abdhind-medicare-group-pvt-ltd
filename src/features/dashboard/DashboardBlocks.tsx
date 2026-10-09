"use client";

import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";
import { sourceLabel } from "@/src/features/appointments/appointment";
import { APPT_UI, STATUS_META } from "@/src/features/appointments/StatusBadge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { BlockCard, BlockError, type BlockState } from "./BlockCard";
import {
  compareLabel,
  formatCount,
  formatDuration,
  isBlockError,
  percentChange,
  type AppointmentsBlock,
  type DashboardSummary,
  type EnquiriesBlock,
  type OutcomeKey,
  type SourceKey,
  type WhatsAppBlock,
} from "./dashboard";

// ---------------------------------------------------------------- KPI cards

function Delta({ change, unit = "%", upIsGood = true, label, previous }: {
  change: number | null;
  unit?: string;
  upIsGood?: boolean;
  label: string | null;
  previous?: string;
}) {
  if (change === null || !label) return null;
  const up = change > 0;
  const good = change === 0 ? null : up === upIsGood;
  return (
    <p className="mt-1 text-xs text-muted-foreground">
      <span
        className={cn(
          "font-semibold",
          good === true && "text-green-700 dark:text-green-400",
          good === false && "text-red-700 dark:text-red-400"
        )}
      >
        {change === 0 ? "▬" : up ? "▲" : "▼"} {Math.abs(change)}
        {unit}
      </span>{" "}
      {label}
      {previous !== undefined && ` (${previous})`}
    </p>
  );
}

function Kpi({ title, value, children, loading, error, onRetry }: {
  title: string;
  value: ReactNode;
  children?: ReactNode;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}) {
  return (
    <section className={cn(APPT_UI.card, "min-w-0 p-4")} aria-label={title}>
      <h3 className="text-sm text-muted-foreground">{title}</h3>
      {loading ? (
        <>
          <Skeleton className="mt-2 h-8 w-24" />
          <Skeleton className="mt-2 h-3 w-32" />
        </>
      ) : error ? (
        <BlockError onRetry={onRetry} />
      ) : (
        <>
          <p className={cn("mt-1 text-3xl font-bold tabular-nums tracking-tight", APPT_UI.ink)}>{value}</p>
          {children}
        </>
      )}
    </section>
  );
}

export function KpiCards({ summary, loading, error, onRetry }: {
  summary?: DashboardSummary;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}) {
  const a = summary && !isBlockError(summary.appointments) ? summary.appointments : null;
  const np = summary && !isBlockError(summary.new_patients) ? summary.new_patients : null;
  const enq = summary?.enquiries && !isBlockError(summary.enquiries) ? summary.enquiries : null;
  const label = summary ? compareLabel(summary.range) : null;
  const cmp = a?.compare;
  const apptErr = error || Boolean(summary && isBlockError(summary.appointments));
  const pct = (v: number | null) => (v === null ? "—" : `${Math.round(v)}%`);
  const showEnquiries = !summary || "enquiries" in summary;

  return (
    <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2", showEnquiries ? "lg:grid-cols-5" : "lg:grid-cols-4")}>
      <Kpi title="Patients visited" value={a ? formatCount(a.patients_visited) : null} loading={loading} error={apptErr} onRetry={onRetry}>
        {a && <p className="text-xs text-muted-foreground">{formatCount(a.visits)} visits</p>}
        {a && cmp && (
          <Delta change={percentChange(a.patients_visited, cmp.patients_visited)} label={label} previous={formatCount(cmp.patients_visited)} />
        )}
      </Kpi>
      <Kpi title="New patients" value={np ? formatCount(np.value) : null} loading={loading}
           error={error || Boolean(summary && isBlockError(summary.new_patients))} onRetry={onRetry}>
        {np && np.compare !== null && (
          <Delta change={percentChange(np.value, np.compare)} label={label} previous={formatCount(np.compare)} />
        )}
      </Kpi>
      <Kpi title="Appointments booked" value={a ? formatCount(a.booked) : null} loading={loading} error={apptErr} onRetry={onRetry}>
        {a && cmp && <Delta change={percentChange(a.booked, cmp.booked)} label={label} previous={formatCount(cmp.booked)} />}
      </Kpi>
      <Kpi title="No-show rate" value={a ? pct(a.no_show_rate) : null} loading={loading} error={apptErr} onRetry={onRetry}>
        {a && cmp && a.no_show_rate !== null && cmp.no_show_rate !== null && (
          // Percentage points; down is good.
          <Delta change={Math.round(a.no_show_rate - cmp.no_show_rate)} upIsGood={false} label={label} previous={pct(cmp.no_show_rate)} />
        )}
        {a && a.no_show_rate === null && <p className="mt-1 text-xs text-muted-foreground">No completed visits yet</p>}
      </Kpi>
      {showEnquiries && (
        <Kpi title="Enquiries converted" value={enq ? pct(enq.converted_pct) : null} loading={loading}
             error={error || Boolean(summary?.enquiries && isBlockError(summary.enquiries))} onRetry={onRetry}>
          {enq && (
            <p className="mt-1 text-xs text-muted-foreground">
              {enq.booked} of {enq.total}
              {enq.compare_converted_pct !== null && label &&
                ` · ${label.replace("vs ", "")}: ${Math.round(enq.compare_converted_pct)}%`}
            </p>
          )}
        </Kpi>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- shared bits

function blockState<T>(loading: boolean, error: boolean, block: T | { error: string } | undefined, empty: (b: T) => boolean): BlockState {
  if (loading) return "loading";
  if (error || !block || isBlockError(block)) return "error";
  return empty(block as T) ? "empty" : "ready";
}

function HBar({ label, value, max, color, suffix = "" }: { label: string; value: number; max: number; color: string; suffix?: string }) {
  return (
    <li>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span>{label}</span>
        <span className="font-semibold tabular-nums">
          {formatCount(value)}
          {suffix}
        </span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-muted" aria-hidden>
        <div className={cn("h-2 rounded-full", color)} style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
      </div>
    </li>
  );
}

// ---------------------------------------------------------------- outcomes + sources

const OUTCOMES: { key: OutcomeKey; meta: keyof typeof STATUS_META }[] = [
  { key: "completed", meta: "completed" },
  { key: "confirmed", meta: "confirmed" },
  { key: "in_clinic", meta: "in_clinic" },
  { key: "pending", meta: "needs_approval" },
  { key: "no_show", meta: "no_show" },
  { key: "cancelled", meta: "cancelled" },
];

const SOURCES: { key: SourceKey; color: string; label: string }[] = [
  { key: "whatsapp", color: "bg-[#1F7A4A] dark:bg-emerald-500", label: sourceLabel("whatsapp") },
  { key: "phone", color: "bg-blue-600 dark:bg-blue-400", label: sourceLabel("phone") },
  { key: "web", color: "bg-violet-600 dark:bg-violet-400", label: sourceLabel("web") },
  { key: "follow_up", color: "bg-teal-600 dark:bg-teal-400", label: sourceLabel("follow_up") },
  { key: "other", color: "bg-zinc-400", label: "Other" },
];

export function OutcomesCard({ block, loading, error, onRetry }: {
  block?: AppointmentsBlock | { error: string };
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}) {
  const state = blockState(loading, error, block, (b: AppointmentsBlock) => b.booked === 0);
  const a = state === "ready" ? (block as AppointmentsBlock) : null;
  const total = a?.booked ?? 0;
  const sourceMax = a ? Math.max(...SOURCES.map((s) => a.sources[s.key])) : 0;
  const shownOutcomes = OUTCOMES.filter((o) => o.key !== "in_clinic" || (a?.outcomes.in_clinic ?? 0) > 0);

  return (
    <BlockCard title="Appointment outcomes" aside={a && `${formatCount(total)} appointments`} state={state} onRetry={onRetry} skeletonClassName="h-72">
      {a && (
        <>
          <div className="flex h-3 overflow-hidden rounded-full bg-muted" role="img"
               aria-label={shownOutcomes.map((o) => `${STATUS_META[o.meta].label} ${a.outcomes[o.key]}`).join(", ")}>
            {shownOutcomes.map((o) =>
              a.outcomes[o.key] > 0 ? (
                <div key={o.key} className={STATUS_META[o.meta].dot} style={{ width: `${(a.outcomes[o.key] / total) * 100}%` }}
                     title={`${STATUS_META[o.meta].label}: ${a.outcomes[o.key]}`} />
              ) : null
            )}
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
            {shownOutcomes.map((o) => (
              <li key={o.key} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 rounded-sm", STATUS_META[o.meta].dot)} aria-hidden />
                  {o.key === "pending" ? "Pending" : STATUS_META[o.meta].label}
                </span>
                <span className="font-semibold tabular-nums">{formatCount(a.outcomes[o.key])}</span>
              </li>
            ))}
          </ul>

          <h3 className={cn("mb-2 mt-5 text-base font-semibold", APPT_UI.ink)}>Where bookings came from</h3>
          <ul className="space-y-3">
            {SOURCES.filter((s) => s.key !== "other" || a.sources.other > 0).map((s) => (
              <HBar key={s.key} label={s.label} value={a.sources[s.key]} max={sourceMax} color={s.color} />
            ))}
          </ul>
        </>
      )}
    </BlockCard>
  );
}

// ---------------------------------------------------------------- busiest days

export function BusiestDaysCard({ block, loading, error, onRetry }: {
  block?: AppointmentsBlock | { error: string };
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}) {
  const state = blockState(loading, error, block, (b: AppointmentsBlock) => b.busiest_days.length === 0);
  const days = state === "ready" ? (block as AppointmentsBlock).busiest_days : [];
  const max = Math.max(0, ...days.map((d) => d.visits));
  return (
    <BlockCard title="Busiest days" state={state} onRetry={onRetry}>
      <ul className="space-y-3">
        {days.map((d) => (
          <HBar key={d.weekday} label={d.weekday} value={d.visits} max={max} suffix=" visits" color="bg-[#1F7A4A] dark:bg-emerald-500" />
        ))}
      </ul>
    </BlockCard>
  );
}

// ---------------------------------------------------------------- enquiries

export function EnquiriesCard({ block, compare, loading, error, onRetry }: {
  block?: EnquiriesBlock | { error: string };
  compare: string | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}) {
  const state = blockState(loading, error, block, (b: EnquiriesBlock) => b.total === 0);
  const e = state === "ready" ? (block as EnquiriesBlock) : null;
  const steps = e
    ? [
        { label: "New", value: e.total, color: "bg-blue-800 dark:bg-blue-600" },
        { label: "Contacted", value: e.contacted, color: "bg-blue-600 dark:bg-blue-500" },
        { label: "Booked appointment", value: e.booked, color: "bg-[#1F7A4A] dark:bg-emerald-600" },
      ]
    : [];
  const notes = e
    ? [
        e.converted_pct !== null && `${Math.round(e.converted_pct)}% converted`,
        e.compare_converted_pct !== null && compare && `${compare.replace("vs ", "")}: ${Math.round(e.compare_converted_pct)}%`,
        e.avg_callback_ms !== null && `avg call-back ${formatDuration(e.avg_callback_ms)}`,
      ].filter(Boolean)
    : [];
  return (
    <BlockCard title="Enquiries" aside="website form" state={state} onRetry={onRetry}>
      {e && (
        <>
          <ol className="space-y-2">
            {steps.map((s) => (
              <li key={s.label}>
                <div
                  className={cn("flex min-w-fit items-center justify-between gap-4 rounded-lg px-3 py-2 text-sm font-semibold text-white", s.color)}
                  style={{ width: `${Math.max(e.total ? (s.value / e.total) * 100 : 0, 42)}%` }}
                >
                  <span>{s.label}</span>
                  <span className="tabular-nums">{formatCount(s.value)}</span>
                </div>
              </li>
            ))}
          </ol>
          {notes.length > 0 && <p className="mt-3 text-sm text-muted-foreground">{notes.join(" · ")}</p>}
        </>
      )}
    </BlockCard>
  );
}

// ---------------------------------------------------------------- WhatsApp

export function WhatsAppCard({ block, loading, error, onRetry }: {
  block?: WhatsAppBlock | { error: string };
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}) {
  const state = blockState(loading, error, block, (b: WhatsAppBlock) => b.chats === 0 && b.reminders_sent === 0 && !b.bookings);
  const w = state === "ready" ? (block as WhatsAppBlock) : null;
  const rows: [string, string][] = w
    ? ([
        ["Chats", formatCount(w.chats)],
        ["Handled by bot", `${formatCount(w.handled_by_bot)}${w.chats ? ` (${Math.round((w.handled_by_bot / w.chats) * 100)}%)` : ""}`],
        w.avg_first_reply_ms !== null ? ["Avg first staff reply", formatDuration(w.avg_first_reply_ms)] : null,
        w.bookings !== null ? ["Bookings from WhatsApp", formatCount(w.bookings)] : null,
        ["Reminders sent", formatCount(w.reminders_sent)],
      ].filter(Boolean) as [string, string][])
    : [];
  return (
    <BlockCard title="WhatsApp" state={state} onRetry={onRetry}>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-muted-foreground">
            <th className="pb-2 font-medium">Metric</th>
            <th className="pb-2 text-right font-medium">Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map(([k, v]) => (
            <tr key={k}>
              <td className="py-2">{k}</td>
              <td className="py-2 text-right font-semibold tabular-nums">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </BlockCard>
  );
}

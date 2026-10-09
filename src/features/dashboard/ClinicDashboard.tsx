"use client";

import { useMemo, useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { useMinuteClock } from "@/src/hooks/useMinuteClock";
import { usePermission } from "@/src/hooks/usePermission";
import { toast } from "@/src/lib/toast";
import { cn } from "@/src/lib/utils";
import type { NormalizedApiError } from "@/src/types/api";
import { appointmentService, istNow, type CreateAppointmentPayload } from "@/src/features/appointments/appointment";
import { BookAppointmentDialog } from "@/src/features/appointments/BookAppointmentDialog";
import { APPT_UI } from "@/src/features/appointments/StatusBadge";
import { doctorService } from "@/src/features/doctors/doctor";
import { BlockCard } from "./BlockCard";
import { DailyDrilldownDialog } from "./DailyDrilldownDialog";
import { BusiestDaysCard, EnquiriesCard, KpiCards, OutcomesCard, WhatsAppCard } from "./DashboardBlocks";
import {
  ALL_PRESETS,
  compareLabel,
  dashboardService,
  formatCount,
  formatRange,
  isBlockError,
  LIMITED_PRESETS,
  monthName,
  presetRange,
  RANGE_LABELS,
  type AppointmentsBlock,
  type CompareMode,
  type DashboardSummary,
  type RangePreset,
  type SummaryParams,
} from "./dashboard";
import { DASHBOARD_NOW_QUERY_KEY, RightNowStrip } from "./RightNowStrip";
import { VisitsChart } from "./VisitsChart";

const REFRESH_MIN_MS = 30_000;
const SELECT_CLASS =
  "h-9 rounded-lg border border-input bg-card px-3 text-sm shadow-none outline-none focus-visible:ring-2 focus-visible:ring-ring";

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** CSV of what's on screen — built from the loaded summary, no extra request. */
function exportCsv(s: DashboardSummary) {
  const rows: unknown[][] = [["Section", "Metric", "Value", "Compare"]];
  const a = isBlockError(s.appointments) ? null : s.appointments;
  if (a) {
    rows.push(["KPI", "Patients visited", a.patients_visited, a.compare?.patients_visited]);
    rows.push(["KPI", "Visits", a.visits, a.compare?.visits]);
    rows.push(["KPI", "Appointments booked", a.booked, a.compare?.booked]);
    rows.push(["KPI", "No-show rate %", a.no_show_rate, a.compare?.no_show_rate]);
    Object.entries(a.outcomes).forEach(([k, v]) => rows.push(["Outcomes", k, v, ""]));
    Object.entries(a.sources).forEach(([k, v]) => rows.push(["Sources", k, v, ""]));
    a.busiest_days.forEach((d) => rows.push(["Busiest days", d.weekday, d.visits, ""]));
    a.chart.buckets.forEach((b) => rows.push([`Visits by ${a.chart.granularity}`, b.key + (b.partial ? " (so far)" : ""), b.visits, b.last_year]));
  }
  if (!isBlockError(s.new_patients)) rows.push(["KPI", "New patients", s.new_patients.value, s.new_patients.compare]);
  if (s.enquiries && !isBlockError(s.enquiries)) {
    const e = s.enquiries;
    rows.push(["Enquiries", "New", e.total, ""], ["Enquiries", "Contacted", e.contacted, ""],
      ["Enquiries", "Booked", e.booked, ""], ["Enquiries", "Converted %", e.converted_pct, e.compare_converted_pct]);
  }
  if (s.whatsapp && !isBlockError(s.whatsapp)) {
    const w = s.whatsapp;
    rows.push(["WhatsApp", "Chats", w.chats, ""], ["WhatsApp", "Handled by bot", w.handled_by_bot, ""],
      ["WhatsApp", "Bookings from WhatsApp", w.bookings, ""], ["WhatsApp", "Reminders sent", w.reminders_sent, ""]);
  }
  const blob = new Blob([rows.map((r) => r.map(csvCell).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `dashboard-${s.range.from}-to-${s.range.to}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/** ERP dashboard for staff who run the clinic (dashboard:analytics or
 * appointments:manage). The backend enforces what each role may see. */
export function ClinicDashboard() {
  const queryClient = useQueryClient();
  const { can, role } = usePermission();
  const analytics = can("dashboard:analytics");
  // Reception (no analytics, not a doctor) gets short ranges and no compare.
  const limited = !analytics && role !== "doctor";
  const presets = limited ? LIMITED_PRESETS : ALL_PRESETS;

  const nowMs = useMinuteClock();
  const today = nowMs === null ? null : istNow(nowMs).date;

  const [preset, setPreset] = useState<RangePreset>(limited ? "today" : "this_year");
  const [custom, setCustom] = useState<{ from: string; to: string } | null>(null);
  const [doctorId, setDoctorId] = useState("");
  const [compare, setCompare] = useState<CompareMode>("last_year");
  const [drillMonth, setDrillMonth] = useState<string | null>(null);
  const [bookOpen, setBookOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const range = useMemo(() => {
    if (!today) return null;
    if (preset === "custom") return custom ?? presetRange("this_month", today);
    return presetRange(preset, today);
  }, [preset, custom, today]);

  const params: SummaryParams | null = range
    ? { ...range, doctor_id: analytics ? doctorId || undefined : undefined, compare: limited ? undefined : compare }
    : null;

  const summaryKey = ["dashboard", "summary", params] as const;
  const { data: summary, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: summaryKey,
    queryFn: async () => (await dashboardService.summary(params as SummaryParams)).data,
    enabled: Boolean(params),
    placeholderData: keepPreviousData,
    // Matches the server cache; no polling on this page besides "Right now".
    staleTime: 60_000,
  });

  const { data: doctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => (await doctorService.list()).data.doctors,
    enabled: analytics,
  });

  const loading = isLoading || !params;
  const appts = summary?.appointments;
  const apptBlock = appts && !isBlockError(appts) ? appts : undefined;
  const cmpLabel = summary ? compareLabel(summary.range) : null;
  const updatedAgo = summary && nowMs !== null ? Math.max(0, Math.floor((nowMs - summary.updated_at) / 60_000)) : null;
  const canRefresh = !summary || Date.now() - summary.updated_at >= REFRESH_MIN_MS;

  const refresh = async () => {
    if (!params || refreshing) return;
    setRefreshing(true);
    try {
      const res = await dashboardService.summary(params, true);
      queryClient.setQueryData(summaryKey, res.data);
      await queryClient.invalidateQueries({ queryKey: DASHBOARD_NOW_QUERY_KEY });
    } catch (err) {
      const e = err as NormalizedApiError;
      toast.error(e.error ?? "Couldn't refresh", e.msg);
    } finally {
      setRefreshing(false);
    }
  };

  const createAppointment = async (payload: CreateAppointmentPayload) => {
    if (creating) return;
    setCreating(true);
    try {
      const res = await appointmentService.create(payload);
      toast.success(res.msg);
      setBookOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (err) {
      const e = err as NormalizedApiError;
      toast.error(e.error ?? "Something went wrong", e.msg);
    } finally {
      setCreating(false);
    }
  };

  const chart = apptBlock?.chart;
  const rangeYear = summary?.range.to.slice(0, 4) ?? today?.slice(0, 4) ?? "";
  const sameYear = summary ? summary.range.from.slice(0, 4) === summary.range.to.slice(0, 4) : true;
  const currentLabel = sameYear ? rangeYear : "This period";
  const previousLabel = sameYear ? String(Number(rangeYear) - 1) : "Year before";
  const partial = chart?.buckets.find((b) => b.partial);
  const chartState = loading ? "loading" : isError || (appts && isBlockError(appts)) ? "error"
    : chart && chart.buckets.every((b) => b.visits === 0 && b.last_year === 0) ? "empty" : "ready";

  const showEnquiries = summary ? "enquiries" in summary : can("enquiry:view");
  const showWhatsApp = summary ? "whatsapp" in summary : can("whatsapp_inbox:view");

  return (
    // Same tinted full-bleed canvas as the Appointments page.
    <div className="-m-4 min-h-full bg-[#F5F7F6] p-4 dark:bg-background sm:-m-5 sm:p-5 lg:-m-6 lg:p-6 xl:-m-8 xl:p-8">
      <div className="mx-auto w-full max-w-[1600px] space-y-4">
        {/* Header */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className={cn("text-3xl font-semibold tracking-tight", APPT_UI.ink)}>Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Abd Hind MediCare · {summary?.scope.doctor_locked ? "your appointments" : "clinic performance"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {updatedAgo !== null && (updatedAgo === 0 ? "Updated just now · " : `Updated ${updatedAgo} min ago · `)}
              <button
                type="button"
                className="font-semibold text-[#1F7A4A] hover:underline disabled:cursor-not-allowed disabled:opacity-50 dark:text-emerald-400"
                onClick={refresh}
                disabled={!canRefresh || refreshing || isFetching}
                title={canRefresh ? undefined : "Just updated — try again in a few seconds"}
              >
                {refreshing ? "Refreshing…" : "Refresh"}
              </button>
            </span>
            <Button variant="outline" className="gap-2 bg-card shadow-none" disabled={!summary} onClick={() => summary && exportCsv(summary)}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            {can("appointments:create") && (
              <Button className={cn("gap-2", APPT_UI.primaryButton)} onClick={() => setBookOpen(true)}>
                <Plus className="h-4 w-4" />
                New appointment
              </Button>
            )}
          </div>
        </header>

        <RightNowStrip />

        {/* Filters */}
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div role="tablist" aria-label="Date range" className={cn(APPT_UI.card, "flex flex-wrap gap-1 p-1")}>
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  role="tab"
                  aria-selected={preset === p}
                  onClick={() => {
                    setPreset(p);
                    if (p === "custom" && !custom && today) setCustom(presetRange("this_month", today));
                  }}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm transition-colors",
                    preset === p ? "bg-[#17261F] font-semibold text-white dark:bg-foreground dark:text-background" : "hover:bg-muted"
                  )}
                >
                  {RANGE_LABELS[p]}
                </button>
              ))}
            </div>
            {preset === "custom" && custom && (
              <div className="flex items-center gap-2 text-sm">
                <Input type="date" aria-label="From" className="h-9 w-auto bg-card" value={custom.from} max={custom.to}
                       onChange={(e) => e.target.value && setCustom({ ...custom, from: e.target.value })} />
                <span className="text-muted-foreground">–</span>
                <Input type="date" aria-label="To" className="h-9 w-auto bg-card" value={custom.to} min={custom.from}
                       onChange={(e) => e.target.value && setCustom({ ...custom, to: e.target.value })} />
              </div>
            )}
            {analytics && (
              <select aria-label="Doctor" className={SELECT_CLASS} value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
                <option value="">Doctor: All</option>
                {(doctors ?? []).map((d) => (
                  <option key={d.id} value={d.id}>{d.full_name}</option>
                ))}
              </select>
            )}
            {!limited && (
              <select aria-label="Compare" className={SELECT_CLASS} value={compare} onChange={(e) => setCompare(e.target.value as CompareMode)}>
                <option value="last_year">Compare: Last year</option>
                <option value="previous_period">Compare: Previous period</option>
              </select>
            )}
          </div>
          {summary && (
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{formatRange(summary.range.from, summary.range.to)}</span>
            </p>
          )}
        </div>

        <KpiCards summary={summary} loading={loading} error={isError} onRetry={() => refetch()} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <BlockCard
            className="lg:col-span-2"
            title={`Visits by ${chart?.granularity ?? "month"}`}
            aside={
              <span className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-[#1F7A4A] dark:bg-emerald-600" />{currentLabel}</span>
                <span className="flex items-center gap-1"><span className="w-4 border-t-2 border-dashed border-zinc-400" />{previousLabel}</span>
                {chart?.trend && <span className="flex items-center gap-1"><span className="w-4 border-t-2 border-[#E07B39]" />trend</span>}
              </span>
            }
            state={chartState}
            onRetry={() => refetch()}
            skeletonClassName="h-72"
          >
            {chart && (
              <>
                <VisitsChart
                  data={chart}
                  currentLabel={currentLabel}
                  previousLabel={previousLabel}
                  onSelect={chart.granularity === "month" ? (b) => setDrillMonth(b.key) : undefined}
                />
                <ChartFootnote block={apptBlock as AppointmentsBlock} partialKey={partial?.key} today={today} />
              </>
            )}
          </BlockCard>
          <OutcomesCard block={appts} loading={loading} error={isError} onRetry={() => refetch()} />
        </div>

        <div className={cn("grid grid-cols-1 gap-4", showEnquiries || showWhatsApp ? "lg:grid-cols-3" : "lg:grid-cols-2")}>
          <BusiestDaysCard block={appts} loading={loading} error={isError} onRetry={() => refetch()} />
          {showEnquiries && (
            <EnquiriesCard block={summary?.enquiries} compare={cmpLabel} loading={loading} error={isError} onRetry={() => refetch()} />
          )}
          {showWhatsApp && <WhatsAppCard block={summary?.whatsapp} loading={loading} error={isError} onRetry={() => refetch()} />}
        </div>
      </div>

      <DailyDrilldownDialog month={drillMonth} doctorId={analytics ? doctorId || undefined : undefined} onClose={() => setDrillMonth(null)} />
      <BookAppointmentDialog
        key={bookOpen ? "open" : "closed"}
        open={bookOpen}
        onOpenChange={setBookOpen}
        isSubmitting={creating}
        onSubmit={createAppointment}
      />
    </div>
  );
}

function ChartFootnote({ block, partialKey, today }: { block: AppointmentsBlock; partialKey?: string; today: string | null }) {
  const { trend, projection, granularity } = block.chart;
  const parts: React.ReactNode[] = [];
  if (trend) {
    const n = Math.round(Math.abs(trend.per_month));
    parts.push(
      <span key="trend" className="font-semibold text-[#C2621F] dark:text-orange-300">
        — Trend: {n === 0 ? "steady" : `${trend.per_month > 0 ? "▲" : "▼"} about ${n} ${trend.per_month > 0 ? "more" : "fewer"} visits every month`}
      </span>
    );
  }
  if (projection) parts.push(`at this pace ${monthName(projection.key)} ≈ ${formatCount(projection.value)}`);
  if (partialKey && today) parts.push(`* ${monthName(partialKey)} so far (${Number(today.slice(8, 10))} days)`);
  if (granularity === "month") parts.push("Tap a bar to see that month day by day.");
  if (!parts.length) return null;
  return (
    <p className="mt-2 text-xs text-muted-foreground">
      {parts.map((p, i) => (
        <span key={i}>
          {i > 0 && " · "}
          {p}
        </span>
      ))}
    </p>
  );
}

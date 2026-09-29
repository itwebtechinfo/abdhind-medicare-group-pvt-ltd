"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Star } from "lucide-react";
import { ErpPageShell } from "@/src/components/dashboard/ErpPageShell";
import { ErpDataTable } from "@/src/components/erp/ErpDataTable";
import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { usePermission } from "@/src/hooks/usePermission";
import { doctorService } from "@/src/features/doctors/doctor";
import { reportsService } from "@/src/features/reports/reports";

/** YYYY-MM-DD in the browser's local time — toISOString() is UTC, which in
 * IST reads as "yesterday" between midnight and 05:30. */
function toLocalDateString(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function last30Days() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  return { start: toLocalDateString(start), end: toLocalDateString(end) };
}

/** "2026-09-01" -> "1 Sep 2026" for the period label. */
function formatDay(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return value;
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function ReportsPage() {
  const defaults = last30Days();
  const [startDate, setStartDate] = useState(defaults.start);
  const [endDate, setEndDate] = useState(defaults.end);
  const [doctorId, setDoctorId] = useState("");
  const { canAction } = usePermission();

  // Patients land on /reports too (reports:view) but don't have doctors:view —
  // the staff-only /doctors list would 403 for them.
  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => (await doctorService.list()).data.doctors,
    enabled: canAction("doctors", "view"),
  });

  // The backend rejects start > end with a 400; don't fire the queries at
  // all for that (or a half-cleared date input) and say why instead.
  const rangeError =
    !startDate || !endDate
      ? "Select both a start and an end date."
      : startDate > endDate
        ? "Start date cannot be after end date."
        : null;
  const rangeValid = rangeError === null;
  const range = { start_date: startDate, end_date: endDate };

  const { data: noShow } = useQuery({
    queryKey: ["reports", "no-show-rate", range, doctorId],
    queryFn: async () =>
      (await reportsService.noShowRate({ ...range, doctor_id: doctorId || undefined })).data,
    enabled: rangeValid,
  });

  const { data: doctorLoad } = useQuery({
    queryKey: ["reports", "doctor-load", range, doctorId],
    queryFn: async () =>
      (await reportsService.doctorLoad({ ...range, doctor_id: doctorId || undefined })).data,
    enabled: rangeValid,
  });

  const { data: followUp } = useQuery({
    queryKey: ["reports", "follow-up-conversion", range, doctorId],
    queryFn: async () =>
      (await reportsService.followUpConversion({ ...range, doctor_id: doctorId || undefined })).data,
    enabled: rangeValid,
  });

  const { data: feedback = [] } = useQuery({
    queryKey: ["feedback", range, doctorId],
    queryFn: async () => (await reportsService.feedback(doctorId || undefined, range)).data.feedback,
    enabled: rangeValid,
  });

  // The period the backend actually applied (it can default a blank bound),
  // taken from whichever report has answered.
  const period = noShow ?? followUp ?? doctorLoad;

  return (
    <ErpPageShell
      title="Reports"
      description="Operational and clinical reporting — no-show rate, doctor load, follow-up conversion, and patient feedback."
      icon={FileText}
    >
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Start Date</label>
          <Input type="date" className="h-9 w-40" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">End Date</label>
          <Input type="date" className="h-9 w-40" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Doctor</label>
          <select
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
          >
            <option value="">All doctors</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.full_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {rangeError ? (
        <p className="mb-4 text-sm text-destructive">{rangeError}</p>
      ) : (
        period && (
          <p className="mb-4 text-xs text-muted-foreground">
            Showing {formatDay(period.start_date)} – {formatDay(period.end_date)}
          </p>
        )
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground">No-show Rate</p>
            <p className="mt-3 text-3xl font-bold">{noShow?.no_show_rate_percent ?? "—"}%</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {noShow ? `${noShow.no_show_count} of ${noShow.total_confirmed_appointments} confirmed` : ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground">Follow-up Conversion</p>
            <p className="mt-3 text-3xl font-bold">{followUp?.follow_up_conversion_rate_percent ?? "—"}%</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {followUp
                ? `${followUp.follow_up_scheduled_count} of ${followUp.total_completed_appointments} completed visits`
                : ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground">Feedback Received</p>
            <p className="mt-3 text-3xl font-bold">{feedback.length}</p>
            <p className="mt-2 text-xs text-muted-foreground">In selected range</p>
          </CardContent>
        </Card>
      </div>

      {doctorLoad && doctorLoad.doctors.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-base font-semibold">Doctor Load</h2>
          <ErpDataTable
            data={doctorLoad.doctors.map((d) => ({ id: d.doctor_id, ...d }))}
            searchPlaceholder="Search doctors…"
            emptyMessage="No data for this range."
            columns={[
              { key: "doctor_name", header: "Doctor", render: (r) => r.doctor_name },
              { key: "total", header: "Total", render: (r) => r.total },
              {
                key: "completed",
                header: "Completed",
                render: (r) => r.status_wise.COMPLETED ?? 0,
              },
              {
                key: "cancelled",
                header: "Cancelled",
                render: (r) => r.status_wise.CANCELLED ?? 0,
              },
              {
                key: "pending",
                header: "Pending",
                render: (r) => r.status_wise.PENDING ?? 0,
              },
            ]}
          />
        </div>
      )}

      <div className="mt-6">
        <h2 className="mb-3 text-base font-semibold">Patient Feedback</h2>
        <ErpDataTable
          data={feedback}
          searchPlaceholder="Search feedback…"
          emptyMessage="No feedback in this range."
          columns={[
            {
              key: "reference_code",
              header: "Booking ID",
              render: (r) => <span className="font-mono text-xs">{r.reference_code ?? "—"}</span>,
            },
            { key: "patient", header: "Patient", render: (r) => r.patient?.full_name ?? "—" },
            { key: "doctor", header: "Doctor", render: (r) => r.doctor?.full_name ?? "—" },
            {
              key: "appointment_datetime",
              header: "Visit",
              render: (r) => r.appointment_datetime?.replace("T", " ") ?? "—",
            },
            {
              key: "rating",
              header: "Rating",
              render: (r) => (
                <span className="flex items-center gap-1">
                  {r.rating}
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                </span>
              ),
            },
            { key: "comment", header: "Comment", render: (r) => r.comment ?? "—" },
            { key: "created_at", header: "Submitted", render: (r) => r.created_at },
          ]}
        />
      </div>
    </ErpPageShell>
  );
}

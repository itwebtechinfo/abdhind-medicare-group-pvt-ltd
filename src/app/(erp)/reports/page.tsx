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

function last30Days() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
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

  const range = { start_date: startDate, end_date: endDate };

  const { data: noShow } = useQuery({
    queryKey: ["reports", "no-show-rate", range, doctorId],
    queryFn: async () =>
      (await reportsService.noShowRate({ ...range, doctor_id: doctorId || undefined })).data,
  });

  const { data: doctorLoad } = useQuery({
    queryKey: ["reports", "doctor-load", range, doctorId],
    queryFn: async () =>
      (await reportsService.doctorLoad({ ...range, doctor_id: doctorId || undefined })).data,
  });

  const { data: followUp } = useQuery({
    queryKey: ["reports", "follow-up-conversion", range, doctorId],
    queryFn: async () =>
      (await reportsService.followUpConversion({ ...range, doctor_id: doctorId || undefined })).data,
  });

  const { data: feedback = [] } = useQuery({
    queryKey: ["feedback", doctorId],
    queryFn: async () => (await reportsService.feedback(doctorId || undefined)).data.feedback,
  });

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
            { key: "patient", header: "Patient", render: (r) => r.patient.full_name },
            { key: "doctor", header: "Doctor", render: (r) => r.doctor.full_name },
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
            { key: "created_at", header: "Date", render: (r) => r.created_at },
          ]}
        />
      </div>
    </ErpPageShell>
  );
}

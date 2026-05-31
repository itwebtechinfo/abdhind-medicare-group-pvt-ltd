"use client";

import { Calendar, Plus } from "lucide-react";
import { ErpPageShell } from "@/src/components/dashboard/ErpPageShell";
import { ErpDataTable } from "@/src/components/erp/ErpDataTable";
import { Can } from "@/src/components/rbac/PermissionGate";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";

const MOCK_APPOINTMENTS = [
  { id: "1", patient: "Rahul Sharma", time: "10:00 AM", doctor: "Dr. Consultant", status: "Confirmed" },
  { id: "2", patient: "Priya Verma", time: "11:30 AM", doctor: "Dr. Consultant", status: "Pending" },
  { id: "3", patient: "Amit Kumar", time: "02:00 PM", doctor: "Dr. Consultant", status: "Completed" },
];

export default function AppointmentsPage() {
  return (
    <ErpPageShell
      title="Appointments"
      description="Schedule, track, and manage patient appointments."
      icon={Calendar}
      actions={
        <Can module="appointments" action="create">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Appointment
          </Button>
        </Can>
      }
    >
      <ErpDataTable
        data={MOCK_APPOINTMENTS}
        searchPlaceholder="Search appointments…"
        columns={[
          { key: "patient", header: "Patient", render: (r) => r.patient },
          { key: "time", header: "Time", render: (r) => r.time },
          { key: "doctor", header: "Doctor", render: (r) => r.doctor },
          {
            key: "status",
            header: "Status",
            render: (r) => (
              <Badge
                variant={
                  r.status === "Confirmed"
                    ? "success"
                    : r.status === "Pending"
                      ? "warning"
                      : "secondary"
                }
              >
                {r.status}
              </Badge>
            ),
          },
        ]}
      />
    </ErpPageShell>
  );
}

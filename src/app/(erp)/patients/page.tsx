"use client";

import { Users, UserPlus } from "lucide-react";
import { ErpPageShell } from "@/src/components/dashboard/ErpPageShell";
import { ErpDataTable } from "@/src/components/erp/ErpDataTable";
import { Can } from "@/src/components/rbac/PermissionGate";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";

const MOCK_PATIENTS = [
  { id: "1", name: "Rahul Sharma", phone: "+91 98765 43210", status: "Active" },
  { id: "2", name: "Priya Verma", phone: "+91 91234 56789", status: "Active" },
  { id: "3", name: "Amit Kumar", phone: "+91 99887 76655", status: "Follow-up" },
];

export default function PatientsPage() {
  return (
    <ErpPageShell
      title="Patients"
      description="Patient registry, records, and care history management."
      icon={Users}
      actions={
        <Can module="patients" action="create">
          <Button size="sm" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Patient
          </Button>
        </Can>
      }
    >
      <ErpDataTable
        data={MOCK_PATIENTS}
        searchPlaceholder="Search patients by name or phone…"
        columns={[
          { key: "name", header: "Patient", render: (r) => r.name },
          { key: "phone", header: "Phone", render: (r) => r.phone },
          {
            key: "status",
            header: "Status",
            render: (r) => (
              <Badge variant={r.status === "Active" ? "success" : "warning"}>
                {r.status}
              </Badge>
            ),
          },
        ]}
      />
    </ErpPageShell>
  );
}

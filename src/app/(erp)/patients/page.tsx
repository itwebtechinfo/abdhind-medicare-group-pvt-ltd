"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { History, Pencil, Users, UserPlus } from "lucide-react";
import { ErpPageShell } from "@/src/components/dashboard/ErpPageShell";
import { ErpDataTable } from "@/src/components/erp/ErpDataTable";
import { Can } from "@/src/components/rbac/PermissionGate";
import { Button } from "@/src/components/ui/button";
import type { DataTableRowAction } from "@/src/components/common/data-table/types";
import { toast } from "@/src/lib/toast";
import type { NormalizedApiError } from "@/src/types/api";
import { patientService } from "@/src/features/patients/patient";
import { PatientFormDialog } from "@/src/features/patients/PatientFormDialog";
import { PatientHistoryDialog } from "@/src/features/patients/PatientHistoryDialog";
import type { CreatePatientFormValues } from "@/src/features/patients/patient";
import type { ApiPatient, UpdatePatientPayload } from "@/src/features/patients/patient";

const PATIENTS_QUERY_KEY = ["patients"] as const;

export default function PatientsPage() {
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<ApiPatient | null>(null);
  const [historyPatientId, setHistoryPatientId] = useState<string | null>(null);

  const { data: patients = [], isLoading } = useQuery({
    queryKey: PATIENTS_QUERY_KEY,
    queryFn: async () => (await patientService.list()).data.patients,
  });

  const invalidatePatients = () => queryClient.invalidateQueries({ queryKey: PATIENTS_QUERY_KEY });

  const createMutation = useMutation({
    mutationFn: (values: CreatePatientFormValues) =>
      patientService.create({
        full_name: values.full_name,
        phone: values.phone,
        age: Number(values.age),
        gender: values.gender,
        address: values.address,
      }),
    onSuccess: (res) => {
      toast.success(res.msg);
      setFormOpen(false);
      invalidatePatients();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: UpdatePatientPayload }) =>
      patientService.update(id, changes),
    onSuccess: (res) => {
      toast.success(res.msg);
      setFormOpen(false);
      setEditingPatient(null);
      invalidatePatients();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const rowActions = useMemo<DataTableRowAction<ApiPatient>[]>(
    () => [
      {
        label: "View History",
        icon: <History className="h-4 w-4" />,
        onClick: (row) => setHistoryPatientId(row.id),
      },
      {
        label: "Edit",
        icon: <Pencil className="h-4 w-4" />,
        onClick: (row) => {
          setEditingPatient(row);
          setFormOpen(true);
        },
      },
    ],
    []
  );

  return (
    <ErpPageShell
      title="Patients"
      description="Patient registry, records, and care history management."
      icon={Users}
      actions={
        <Can module="patients" action="create">
          <Button
            size="sm"
            className="gap-2"
            onClick={() => {
              setEditingPatient(null);
              setFormOpen(true);
            }}
          >
            <UserPlus className="h-4 w-4" />
            Add Patient
          </Button>
        </Can>
      }
    >
      <ErpDataTable
        data={patients}
        isLoading={isLoading}
        searchPlaceholder="Search patients by name, phone, or UHID…"
        emptyMessage="No patients found."
        rowActions={rowActions}
        columns={[
          { key: "uhid", header: "UHID", render: (r) => <span className="font-mono text-xs">{r.uhid}</span> },
          { key: "full_name", header: "Patient", render: (r) => r.full_name },
          { key: "phone", header: "Phone", render: (r) => r.phone },
          { key: "age", header: "Age", render: (r) => r.age ?? "—" },
          { key: "gender", header: "Gender", render: (r) => r.gender ?? "—" },
          { key: "address", header: "Address", render: (r) => r.address ?? "—" },
          { key: "created_at", header: "Registered", render: (r) => r.created_at },
        ]}
      />

      <PatientFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingPatient(null);
        }}
        patient={editingPatient}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onCreate={(values) => createMutation.mutate(values)}
        onUpdate={(id, changes) => updateMutation.mutate({ id, changes })}
      />

      <PatientHistoryDialog
        open={Boolean(historyPatientId)}
        onOpenChange={(open) => !open && setHistoryPatientId(null)}
        patientId={historyPatientId}
      />
    </ErpPageShell>
  );
}

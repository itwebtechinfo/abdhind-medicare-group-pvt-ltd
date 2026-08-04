"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Pill, Plus } from "lucide-react";
import { ErpPageShell } from "@/src/components/dashboard/ErpPageShell";
import { ErpDataTable } from "@/src/components/erp/ErpDataTable";
import { Can } from "@/src/components/rbac/PermissionGate";
import { Button } from "@/src/components/ui/button";
import { Switch } from "@/src/components/ui/switch";
import { Badge } from "@/src/components/ui/badge";
import type { DataTableRowAction } from "@/src/components/common/data-table/types";
import { toast } from "@/src/lib/toast";
import type { NormalizedApiError } from "@/src/types/api";
import { medicineService } from "@/src/features/pharmacy/medicine";
import { MedicineFormDialog } from "@/src/features/pharmacy/MedicineFormDialog";
import type { CreateMedicineFormValues } from "@/src/features/pharmacy/medicine";
import type { ApiMedicine, UpdateMedicinePayload } from "@/src/features/pharmacy/medicine";

const MEDICINES_QUERY_KEY = ["medicines"] as const;

export default function PharmacyPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<ApiMedicine | null>(null);

  const { data: medicines = [], isLoading } = useQuery({
    queryKey: MEDICINES_QUERY_KEY,
    queryFn: async () => (await medicineService.list()).data.medicines,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: MEDICINES_QUERY_KEY });

  const createMutation = useMutation({
    mutationFn: (values: CreateMedicineFormValues) => medicineService.create(values),
    onSuccess: (res) => {
      toast.success(res.msg);
      setFormOpen(false);
      invalidate();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: UpdateMedicinePayload }) =>
      medicineService.update(id, changes),
    onSuccess: (res) => {
      toast.success(res.msg);
      setFormOpen(false);
      setEditingMedicine(null);
      invalidate();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ medicine, active }: { medicine: ApiMedicine; active: boolean }) =>
      medicineService.update(medicine.id, { active }),
    onSuccess: (res) => {
      toast.success(res.msg);
      invalidate();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const rowActions = useMemo<DataTableRowAction<ApiMedicine>[]>(
    () => [
      {
        label: "Edit",
        icon: <Pencil className="h-4 w-4" />,
        onClick: (row) => {
          setEditingMedicine(row);
          setFormOpen(true);
        },
      },
    ],
    []
  );

  return (
    <ErpPageShell
      title="Pharmacy"
      description="Medicine catalog and dispense records."
      icon={Pill}
      actions={
        <Can module="pharmacy" action="create">
          <Button
            size="sm"
            className="gap-2"
            onClick={() => {
              setEditingMedicine(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Medicine
          </Button>
        </Can>
      }
    >
      <ErpDataTable
        data={medicines}
        isLoading={isLoading}
        searchPlaceholder="Search medicines…"
        emptyMessage="No medicines found."
        rowActions={rowActions}
        columns={[
          {
            key: "active",
            header: "Status",
            hideable: false,
            render: (r) => (
              <div className="flex items-center gap-2">
                <Switch
                  checked={r.active}
                  disabled={
                    toggleActiveMutation.isPending && toggleActiveMutation.variables?.medicine.id === r.id
                  }
                  onCheckedChange={(checked) => toggleActiveMutation.mutate({ medicine: r, active: checked })}
                  aria-label={r.active ? "Deactivate medicine" : "Activate medicine"}
                />
                <Badge variant={r.active ? "success" : "secondary"}>
                  {r.active ? "Active" : "Inactive"}
                </Badge>
              </div>
            ),
          },
          { key: "name", header: "Medicine", render: (r) => r.name },
          { key: "unit", header: "Unit", render: (r) => r.unit },
          { key: "price", header: "Price", render: (r) => `₹${r.price}` },
        ]}
      />

      <MedicineFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingMedicine(null);
        }}
        medicine={editingMedicine}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onCreate={(values) => createMutation.mutate(values)}
        onUpdate={(id, changes) => updateMutation.mutate({ id, changes })}
      />
    </ErpPageShell>
  );
}

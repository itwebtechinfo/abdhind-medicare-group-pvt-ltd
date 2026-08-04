"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FlaskConical, Pencil, Plus } from "lucide-react";
import { ErpPageShell } from "@/src/components/dashboard/ErpPageShell";
import { ErpDataTable } from "@/src/components/erp/ErpDataTable";
import { Can } from "@/src/components/rbac/PermissionGate";
import { Button } from "@/src/components/ui/button";
import { Switch } from "@/src/components/ui/switch";
import { Badge } from "@/src/components/ui/badge";
import type { DataTableRowAction } from "@/src/components/common/data-table/types";
import { toast } from "@/src/lib/toast";
import type { NormalizedApiError } from "@/src/types/api";
import { labTestService } from "@/src/features/lab/lab-test";
import { LabTestFormDialog } from "@/src/features/lab/LabTestFormDialog";
import type { CreateLabTestFormValues } from "@/src/features/lab/lab-test";
import type { ApiLabTest, UpdateLabTestPayload } from "@/src/features/lab/lab-test";

const LAB_TESTS_QUERY_KEY = ["lab-tests"] as const;

export default function LabPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<ApiLabTest | null>(null);

  const { data: labTests = [], isLoading } = useQuery({
    queryKey: LAB_TESTS_QUERY_KEY,
    queryFn: async () => (await labTestService.list()).data.lab_tests,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: LAB_TESTS_QUERY_KEY });

  const createMutation = useMutation({
    mutationFn: (values: CreateLabTestFormValues) => labTestService.create(values),
    onSuccess: (res) => {
      toast.success(res.msg);
      setFormOpen(false);
      invalidate();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: UpdateLabTestPayload }) =>
      labTestService.update(id, changes),
    onSuccess: (res) => {
      toast.success(res.msg);
      setFormOpen(false);
      setEditingTest(null);
      invalidate();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ labTest, active }: { labTest: ApiLabTest; active: boolean }) =>
      labTestService.update(labTest.id, { active }),
    onSuccess: (res) => {
      toast.success(res.msg);
      invalidate();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const rowActions = useMemo<DataTableRowAction<ApiLabTest>[]>(
    () => [
      {
        label: "Edit",
        icon: <Pencil className="h-4 w-4" />,
        onClick: (row) => {
          setEditingTest(row);
          setFormOpen(true);
        },
      },
    ],
    []
  );

  return (
    <ErpPageShell
      title="Laboratory"
      description="Lab test catalog. Individual orders and results are managed from each appointment."
      icon={FlaskConical}
      actions={
        <Can module="lab" action="create">
          <Button
            size="sm"
            className="gap-2"
            onClick={() => {
              setEditingTest(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Test
          </Button>
        </Can>
      }
    >
      <ErpDataTable
        data={labTests}
        isLoading={isLoading}
        searchPlaceholder="Search lab tests…"
        emptyMessage="No lab tests found."
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
                    toggleActiveMutation.isPending && toggleActiveMutation.variables?.labTest.id === r.id
                  }
                  onCheckedChange={(checked) => toggleActiveMutation.mutate({ labTest: r, active: checked })}
                  aria-label={r.active ? "Deactivate test" : "Activate test"}
                />
                <Badge variant={r.active ? "success" : "secondary"}>
                  {r.active ? "Active" : "Inactive"}
                </Badge>
              </div>
            ),
          },
          { key: "name", header: "Test", render: (r) => r.name },
          { key: "price", header: "Price", render: (r) => `₹${r.price}` },
        ]}
      />

      <LabTestFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingTest(null);
        }}
        labTest={editingTest}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onCreate={(values) => createMutation.mutate(values)}
        onUpdate={(id, changes) => updateMutation.mutate({ id, changes })}
      />
    </ErpPageShell>
  );
}

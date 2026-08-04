"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarOff, Pencil, Stethoscope, UserPlus } from "lucide-react";
import { ErpPageShell } from "@/src/components/dashboard/ErpPageShell";
import { ErpDataTable } from "@/src/components/erp/ErpDataTable";
import { Can } from "@/src/components/rbac/PermissionGate";
import { Button } from "@/src/components/ui/button";
import { Switch } from "@/src/components/ui/switch";
import { Badge } from "@/src/components/ui/badge";
import type { DataTableRowAction } from "@/src/components/common/data-table/types";
import { toast } from "@/src/lib/toast";
import type { NormalizedApiError } from "@/src/types/api";
import { departmentService } from "@/src/features/departments/department";
import { doctorService } from "@/src/features/doctors/doctor";
import { DoctorFormDialog } from "@/src/features/doctors/DoctorFormDialog";
import { LeaveCalendarDialog } from "@/src/features/doctors/LeaveCalendarDialog";
import type { CreateDoctorFormValues } from "@/src/features/doctors/doctor";
import type { ApiDoctor, UpdateDoctorPayload } from "@/src/features/doctors/doctor";

const DOCTORS_QUERY_KEY = ["doctors"] as const;

export default function AdminDoctorsPage() {
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<ApiDoctor | null>(null);
  const [leaveDoctor, setLeaveDoctor] = useState<ApiDoctor | null>(null);

  const { data: doctors = [], isLoading } = useQuery({
    queryKey: DOCTORS_QUERY_KEY,
    queryFn: async () => (await doctorService.list()).data.doctors,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => (await departmentService.list()).data.departments,
  });

  const departmentName = (id: string) => departments.find((d) => d.id === id)?.name ?? "—";

  const invalidateDoctors = () => queryClient.invalidateQueries({ queryKey: DOCTORS_QUERY_KEY });

  const createMutation = useMutation({
    mutationFn: (values: CreateDoctorFormValues) => doctorService.create(values),
    onSuccess: (res) => {
      toast.success(res.msg);
      setFormOpen(false);
      invalidateDoctors();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: UpdateDoctorPayload }) =>
      doctorService.update(id, changes),
    onSuccess: (res) => {
      toast.success(res.msg);
      setFormOpen(false);
      setEditingDoctor(null);
      invalidateDoctors();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ doctor, active }: { doctor: ApiDoctor; active: boolean }) =>
      doctorService.update(doctor.id, { active }),
    onSuccess: (res) => {
      toast.success(res.msg);
      invalidateDoctors();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const rowActions = useMemo<DataTableRowAction<ApiDoctor>[]>(
    () => [
      {
        label: "Edit",
        icon: <Pencil className="h-4 w-4" />,
        onClick: (row) => {
          setEditingDoctor(row);
          setFormOpen(true);
        },
      },
      {
        label: "Leave Calendar",
        icon: <CalendarOff className="h-4 w-4" />,
        onClick: (row) => setLeaveDoctor(row),
      },
    ],
    []
  );

  return (
    <ErpPageShell
      title="Doctors"
      description="Internal doctor roster, working hours, and leave calendar."
      icon={Stethoscope}
      actions={
        <Can module="doctors" action="create">
          <Button
            size="sm"
            className="gap-2"
            onClick={() => {
              setEditingDoctor(null);
              setFormOpen(true);
            }}
          >
            <UserPlus className="h-4 w-4" />
            Add Doctor
          </Button>
        </Can>
      }
    >
      <ErpDataTable
        data={doctors}
        isLoading={isLoading}
        searchPlaceholder="Search doctors by name or specialization…"
        emptyMessage="No doctors found."
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
                  disabled={toggleActiveMutation.isPending && toggleActiveMutation.variables?.doctor.id === r.id}
                  onCheckedChange={(checked) => toggleActiveMutation.mutate({ doctor: r, active: checked })}
                  aria-label={r.active ? "Deactivate doctor" : "Activate doctor"}
                />
                <Badge variant={r.active ? "success" : "secondary"}>
                  {r.active ? "Active" : "Inactive"}
                </Badge>
              </div>
            ),
          },
          { key: "full_name", header: "Doctor", render: (r) => r.full_name },
          { key: "specialization", header: "Specialization", render: (r) => r.specialization },
          { key: "department_id", header: "Department", render: (r) => departmentName(r.department_id) },
          { key: "phone", header: "Phone", render: (r) => r.phone },
          {
            key: "slot_duration_minutes",
            header: "Slot Duration",
            render: (r) => `${r.slot_duration_minutes} min`,
          },
          {
            key: "user_id",
            header: "Linked Login",
            render: (r) =>
              r.linked_user ? (
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="success">Linked</Badge>
                    <span className="font-medium">{r.linked_user.full_name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{r.linked_user.phone_number}</span>
                </div>
              ) : (
                <Badge variant="warning">Not linked</Badge>
              ),
          },
        ]}
      />

      <DoctorFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingDoctor(null);
        }}
        doctor={editingDoctor}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onCreate={(values) => createMutation.mutate(values)}
        onUpdate={(id, changes) => updateMutation.mutate({ id, changes })}
      />

      <LeaveCalendarDialog
        open={Boolean(leaveDoctor)}
        onOpenChange={(open) => !open && setLeaveDoctor(null)}
        doctor={leaveDoctor}
      />
    </ErpPageShell>
  );
}

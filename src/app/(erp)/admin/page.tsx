"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Stethoscope, BarChart3, Plus } from "lucide-react";
import { ErpPageShell } from "@/src/components/dashboard/ErpPageShell";
import { ErpDataTable } from "@/src/components/erp/ErpDataTable";
import { Can } from "@/src/components/rbac/PermissionGate";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { toast } from "@/src/lib/toast";
import type { NormalizedApiError } from "@/src/types/api";
import { departmentService } from "@/src/features/departments/department";
import { DepartmentFormDialog } from "@/src/features/departments/DepartmentFormDialog";
import type { CreateDepartmentPayload } from "@/src/features/departments/department";

const adminLinks = [
  {
    title: "Doctors",
    description: "Manage consultants and clinical staff.",
    href: "/admin/doctors",
    icon: Stethoscope,
  },
  {
    title: "Departments",
    description: "Hospital units and service lines.",
    href: "/admin",
    icon: Building2,
  },
  {
    title: "Analytics",
    description: "Operational and financial reports.",
    href: "/reports",
    icon: BarChart3,
  },
];

const DEPARTMENTS_QUERY_KEY = ["departments"] as const;

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);

  const { data: departments = [], isLoading } = useQuery({
    queryKey: DEPARTMENTS_QUERY_KEY,
    queryFn: async () => (await departmentService.list()).data.departments,
  });

  const createMutation = useMutation({
    mutationFn: (values: CreateDepartmentPayload) => departmentService.create(values),
    onSuccess: (res) => {
      toast.success(res.msg);
      setFormOpen(false);
      queryClient.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY });
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  return (
    <ErpPageShell
      title="Administration"
      description="Hospital configuration, departments, and system modules."
      icon={Building2}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adminLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.title} href={item.href}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Departments</h2>
          <Can module="admin" action="create">
            <Button size="sm" className="gap-2" onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Department
            </Button>
          </Can>
        </div>
        <ErpDataTable
          data={departments}
          isLoading={isLoading}
          searchPlaceholder="Search departments…"
          emptyMessage="No departments found."
          columns={[
            { key: "name", header: "Name", render: (r) => r.name },
            { key: "description", header: "Description", render: (r) => r.description ?? "—" },
            { key: "created_at", header: "Created", render: (r) => r.created_at },
          ]}
        />
      </div>

      <DepartmentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        isSubmitting={createMutation.isPending}
        onCreate={(values) => createMutation.mutate(values)}
      />
    </ErpPageShell>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Pencil, UserCog, UserPlus } from "lucide-react";
import { ErpPageShell } from "@/src/components/dashboard/ErpPageShell";
import { ErpDataTable } from "@/src/components/erp/ErpDataTable";
import { Button } from "@/src/components/ui/button";
import { Switch } from "@/src/components/ui/switch";
import { Badge } from "@/src/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { ConfirmDialog } from "@/src/components/ui/confirm-dialog";
import type { DataTableRowAction } from "@/src/components/common/data-table/types";
import { useAuth } from "@/src/hooks/useAuth";
import { usePermission } from "@/src/hooks/usePermission";
import { ROLE_LABELS } from "@/src/lib/rbac/roles";
import type { UserRole } from "@/src/lib/auth/types";
import { toast } from "@/src/lib/toast";
import { cn } from "@/src/lib/utils";
import type { NormalizedApiError } from "@/src/types/api";
import { userService } from "@/src/features/users/user";
import { UserFormDialog } from "@/src/features/users/UserFormDialog";
import { UserPermissionsDialog } from "@/src/features/users/UserPermissionsDialog";
import { ImagePreviewDialog } from "@/src/features/users/ImagePreviewDialog";
import type { ApiUser, CreateUserPayload, UpdateUserPayload } from "@/src/features/users/user";

const USERS_QUERY_KEY = ["users"] as const;

type StatusAction = { user: ApiUser; type: "deactivate" | "activate" };

function roleLabel(role: string) {
  return ROLE_LABELS[role as UserRole] ?? role;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const { can } = usePermission();
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null);
  const [statusAction, setStatusAction] = useState<StatusAction | null>(null);
  const [permissionsUser, setPermissionsUser] = useState<ApiUser | null>(null);
  const [previewUser, setPreviewUser] = useState<ApiUser | null>(null);

  const canCreate = can("users:manage");

  const { data: users = [], isLoading } = useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: async () => (await userService.list()).data.users,
  });

  const invalidateUsers = () => queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });

  const createMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => userService.create(payload),
    onSuccess: (res) => {
      toast.success(res.msg);
      setFormOpen(false);
      invalidateUsers();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: UpdateUserPayload }) =>
      userService.update(id, changes),
    onSuccess: (res) => {
      toast.success(res.msg);
      setFormOpen(false);
      setEditingUser(null);
      invalidateUsers();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const statusMutation = useMutation({
    mutationFn: (action: StatusAction) =>
      action.type === "deactivate"
        ? userService.deactivate(action.user.id)
        : userService.activate(action.user.id),
    onSuccess: (res) => {
      toast.success(res.msg);
      setStatusAction(null);
      invalidateUsers();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  // Turning a user OFF is consequential (forces logout) so it goes through the
  // confirm dialog; turning ON is safe/reversible and applies immediately.
  const handleStatusToggle = (targetUser: ApiUser, nextChecked: boolean) => {
    if (nextChecked) {
      statusMutation.mutate({ user: targetUser, type: "activate" });
    } else {
      setStatusAction({ user: targetUser, type: "deactivate" });
    }
  };

  const rowActions = useMemo<DataTableRowAction<ApiUser>[]>(
    () => [
      {
        label: "Edit",
        icon: <Pencil className="h-4 w-4" />,
        onClick: (row) => {
          setEditingUser(row);
          setFormOpen(true);
        },
      },
      {
        label: "Permissions",
        icon: <KeyRound className="h-4 w-4" />,
        onClick: (row) => setPermissionsUser(row),
      },
    ],
    []
  );

  return (
    <ErpPageShell
      title="User Management"
      description="Manage staff accounts, assign roles, and control who can access each module."
      icon={UserCog}
      actions={
        canCreate && (
          <Button
            size="sm"
            className="gap-2"
            onClick={() => {
              setEditingUser(null);
              setFormOpen(true);
            }}
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        )
      }
    >
      <ErpDataTable
        data={users}
        isLoading={isLoading}
        searchPlaceholder="Search users by name, phone, or email…"
        emptyMessage="No users found."
        rowActions={rowActions}
        columns={[
          {
            key: "is_verified",
            header: "Status",
            hideable: false,
            render: (r) => {
              const isSelf = r.id === currentUser?.id;
              const isBusy = statusMutation.isPending && statusMutation.variables?.user.id === r.id;
              return (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={r.is_verified}
                    disabled={isSelf || isBusy}
                    onCheckedChange={(checked) => handleStatusToggle(r, checked)}
                    aria-label={r.is_verified ? "Deactivate user" : "Activate user"}
                    title={isSelf ? "You can't deactivate your own account" : undefined}
                  />
                  <span className="text-xs font-medium text-muted-foreground">
                    {r.is_verified ? "Active" : "Inactive"}
                  </span>
                </div>
              );
            },
          },
          {
            key: "full_name",
            header: "Full Name",
            hideable: false,
            render: (r) => (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => r.profile_image && setPreviewUser(r)}
                  disabled={!r.profile_image}
                  aria-label={r.profile_image ? `View ${r.full_name}'s photo` : undefined}
                  className={cn(
                    "shrink-0 rounded-full",
                    r.profile_image ? "cursor-pointer hover:opacity-80" : "cursor-default"
                  )}
                >
                  <Avatar className="h-8 w-8">
                    {r.profile_image && <AvatarImage src={r.profile_image} alt={r.full_name} />}
                    <AvatarFallback className="text-[11px]">{initials(r.full_name)}</AvatarFallback>
                  </Avatar>
                </button>
                <span className="font-medium">{r.full_name}</span>
              </div>
            ),
          },
          { key: "phone_number", header: "Phone", render: (r) => r.phone_number },
          { key: "email", header: "Email", render: (r) => r.email },
          { key: "role", header: "Role", render: (r) => roleLabel(r.role) },
          {
            key: "linked_doctor",
            header: "Linked Doctor",
            render: (r) => {
              if (r.role !== "doctor") return <span className="text-muted-foreground">—</span>;
              return r.linked_doctor ? (
                <div className="flex items-center gap-2">
                  <Badge variant="success">Linked</Badge>
                  <span className="font-medium">{r.linked_doctor.full_name}</span>
                </div>
              ) : (
                <Badge variant="warning">Not linked</Badge>
              );
            },
          },
          { key: "age", header: "Age", render: (r) => r.age ?? "—" },
          {
            key: "gender",
            header: "Gender",
            render: (r) => r.gender ?? "—",
          },
          { key: "state", header: "State", render: (r) => r.state ?? "—" },
          { key: "district", header: "District", render: (r) => r.district ?? "—" },
          { key: "address", header: "Address", render: (r) => r.address ?? "—" },
          { key: "created_at", header: "Created At", render: (r) => r.created_at },
          {
            key: "id",
            header: "ID",
            render: (r) => (
              <span className="font-mono text-xs text-muted-foreground" title={r.id}>
                {r.id.slice(0, 8)}…
              </span>
            ),
          },
        ]}
      />

      <UserFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingUser(null);
        }}
        user={editingUser}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onCreate={(values) => createMutation.mutate(values)}
        onUpdate={(id, changes) => updateMutation.mutate({ id, changes })}
      />

      {/* Only the deactivate path is confirmed — activating is safe/reversible
          and applies immediately from the switch (see handleStatusToggle). */}
      <ConfirmDialog
        open={Boolean(statusAction)}
        onOpenChange={(open) => !open && setStatusAction(null)}
        title="Deactivate user?"
        description={
          statusAction
            ? `${statusAction.user.full_name} will be signed out immediately and won't be able to log in until reactivated.`
            : undefined
        }
        confirmLabel="Deactivate"
        variant="destructive"
        isLoading={statusMutation.isPending}
        onConfirm={() => statusAction && statusMutation.mutate(statusAction)}
      />

      <UserPermissionsDialog
        open={Boolean(permissionsUser)}
        onOpenChange={(open) => !open && setPermissionsUser(null)}
        user={permissionsUser}
      />

      <ImagePreviewDialog
        open={Boolean(previewUser)}
        onOpenChange={(open) => !open && setPreviewUser(null)}
        src={previewUser?.profile_image ?? null}
        alt={previewUser?.full_name ?? ""}
      />
    </ErpPageShell>
  );
}

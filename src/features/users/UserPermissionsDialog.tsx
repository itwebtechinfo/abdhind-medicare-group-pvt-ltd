"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Badge } from "@/src/components/ui/badge";
import { ROLE_LABELS } from "@/src/lib/rbac/roles";
import type { UserRole } from "@/src/lib/auth/types";
import type { ApiUser } from "./user";

interface UserPermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ApiUser | null;
}

export function UserPermissionsDialog({ open, onOpenChange, user }: UserPermissionsDialogProps) {
  const roleLabel = user ? (ROLE_LABELS[user.role as UserRole] ?? user.role) : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{user?.full_name}&rsquo;s Permissions</DialogTitle>
          <DialogDescription>
            Granted via the &ldquo;{roleLabel}&rdquo; role. To change what this user can do,
            edit their role instead of individual permissions.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-1.5">
          {user?.permissions.length ? (
            user.permissions.map((permission) => (
              <Badge key={permission} variant="secondary" className="font-mono text-xs">
                {permission}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No permissions granted.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

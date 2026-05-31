"use client";

import { useCallback, useMemo } from "react";
import { useAuth } from "@/src/hooks/useAuth";
import { userCan, userHasPermission } from "@/src/lib/rbac/permissions";
import type { Permission, PermissionAction } from "@/src/lib/auth/types";

const EMPTY_PERMISSIONS: Permission[] = [];

export function usePermission() {
  const { user, session } = useAuth();
  const permissions = useMemo(
    () => user?.permissions ?? EMPTY_PERMISSIONS,
    [user?.permissions]
  );

  const can = useCallback(
    (permission: Permission) => userHasPermission(permissions, permission),
    [permissions]
  );

  const canAction = useCallback(
    (module: string, action: PermissionAction) =>
      userCan(permissions, module, action),
    [permissions]
  );

  return useMemo(
    () => ({
      permissions,
      role: user?.role,
      can,
      canAction,
      session,
    }),
    [permissions, user?.role, can, canAction, session]
  );
}

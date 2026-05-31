"use client";

import { useCallback } from "react";
import { usePermission } from "@/src/hooks/usePermission";
import type { Permission, PermissionAction } from "@/src/lib/auth/types";
import { perm } from "@/src/lib/rbac/permissions";

/**
 * Hook ready for API-layer permission checks before mutations.
 * Pair with authFetch / backend 403 handling when APIs are connected.
 */
export function useApiPermission() {
  const { can, canAction, permissions, role } = usePermission();

  const assertPermission = useCallback(
    (permission: Permission): boolean => {
      if (!can(permission)) {
        if (process.env.NODE_ENV === "development") {
          console.warn(`[RBAC] Missing permission: ${permission}`);
        }
        return false;
      }
      return true;
    },
    [can]
  );

  const assertAction = useCallback(
    (module: string, action: PermissionAction): boolean => {
      const p = perm(module, action);
      return assertPermission(p);
    },
    [assertPermission]
  );

  return {
    permissions,
    role,
    can,
    canAction,
    assertPermission,
    assertAction,
    /** Headers helper for future API calls */
    permissionHeaders: () => ({
      "X-User-Role": role ?? "",
      "X-User-Permissions": permissions.join(","),
    }),
  };
}

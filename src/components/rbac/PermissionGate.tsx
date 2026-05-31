"use client";

import type { ReactNode } from "react";
import { usePermission } from "@/src/hooks/usePermission";
import type { Permission, PermissionAction } from "@/src/lib/auth/types";
import { perm } from "@/src/lib/rbac/permissions";

interface PermissionGateProps {
  children: ReactNode;
  /** Single permission or any-of list */
  permission?: Permission | Permission[];
  /** Shorthand: module + action */
  module?: string;
  action?: PermissionAction;
  fallback?: ReactNode;
}

export function PermissionGate({
  children,
  permission,
  module,
  action = "view",
  fallback = null,
}: PermissionGateProps) {
  const { can, canAction } = usePermission();

  let allowed = false;

  if (module) {
    allowed = canAction(module, action);
  } else if (permission) {
    const list = Array.isArray(permission) ? permission : [permission];
    allowed = list.some((p) => can(p));
  } else {
    allowed = true;
  }

  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}

export function Can({
  module,
  action = "view",
  children,
  fallback = null,
}: {
  module: string;
  action?: PermissionAction;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGate
      module={module}
      action={action}
      permission={perm(module, action)}
      fallback={fallback}
    >
      {children}
    </PermissionGate>
  );
}

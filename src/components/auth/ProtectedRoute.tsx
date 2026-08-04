"use client";

import { ShieldAlert } from "lucide-react";
import { useRequireAuth } from "@/src/hooks/useRequireAuth";
import { EnterpriseLoader } from "@/src/components/common/EnterpriseLoader";
import type { RouteGuardOptions } from "@/src/lib/auth/route-guard";

interface ProtectedRouteProps {
  children: React.ReactNode;
  guard?: RouteGuardOptions;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  guard,
  fallback,
}: ProtectedRouteProps) {
  const { isLoading, isAuthorized, guard: guardResult } = useRequireAuth(guard);

  if (isLoading) {
    return (
      fallback ?? (
        <EnterpriseLoader
          label="Verifying session"
          sublabel="Checking role access and dashboard permissions"
        />
      )
    );
  }

  if (!isAuthorized) {
    const isSignedOut =
      guardResult.reason === "unauthenticated" || guardResult.reason === "expired";

    return (
      fallback ?? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 px-4 text-center">
          <ShieldAlert className="h-10 w-10 text-amber-500" />
          <p className="text-sm text-gray-600">
            {isSignedOut
              ? "Please sign in to continue — redirecting…"
              : "Redirecting — you don't have access to this page."}
          </p>
        </div>
      )
    );
  }

  return <>{children}</>;
}

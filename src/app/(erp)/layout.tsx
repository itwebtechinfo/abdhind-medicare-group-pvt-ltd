import { Suspense } from "react";
import { ProtectedRoute } from "@/src/components/auth/ProtectedRoute";
import { ErpShell } from "@/src/components/layout/erp/ErpShell";
import { DashboardSkeleton } from "@/src/components/dashboard/DashboardSkeleton";

/** Every page in (erp) is a protected ERP page: being in this group is what
 * makes it protected (sign-in + the route's permission rule) and gives it the
 * ERP shell — there's no separate list of ERP paths to keep in sync. */
export default function ErpLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <ErpShell>
        <Suspense fallback={<DashboardSkeleton />}>{children}</Suspense>
      </ErpShell>
    </ProtectedRoute>
  );
}

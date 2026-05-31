import { Suspense } from "react";
import { ProtectedRoute } from "@/src/components/auth/ProtectedRoute";
import { ErpShell } from "@/src/components/layout/erp/ErpShell";
import { DashboardSkeleton } from "@/src/components/dashboard/DashboardSkeleton";

export default function ErpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <ErpShell>
        <Suspense fallback={<DashboardSkeleton />}>{children}</Suspense>
      </ErpShell>
    </ProtectedRoute>
  );
}

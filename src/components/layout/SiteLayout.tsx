"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import { PublicLayout } from "@/src/components/layout/PublicLayout";
import { AUTH_ROUTES, isErpPath } from "@/src/lib/auth/constants";
import { EnterpriseLoader } from "@/src/components/common/EnterpriseLoader";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  const pathname = usePathname();
  const erpRoute = isErpPath(pathname);
  const authRoute = pathname === AUTH_ROUTES.login;

  if (authRoute) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <PublicLayout>
        <EnterpriseLoader compact label="Loading Abd Hind MediCare" />
      </PublicLayout>
    );
  }

  if (erpRoute) {
    return <>{children}</>;
  }

  return <PublicLayout>{children}</PublicLayout>;
}

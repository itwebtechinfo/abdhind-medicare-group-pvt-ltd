import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { AUTH_ROUTES } from "@/src/lib/auth/constants";

/** 404 inside the ERP shell — reached via notFound() from (erp)/<section>/[...missing]. */
export default function ErpNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Compass className="h-6 w-6 text-muted-foreground" />
      </span>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This page doesn&apos;t exist in the clinic portal. The link may be old or mistyped.
      </p>
      <Button asChild className="mt-6 bg-[#1F7A4A] text-white hover:bg-[#1F7A4A]/90 dark:bg-primary dark:text-primary-foreground">
        <Link href={AUTH_ROUTES.dashboard}>Go to dashboard</Link>
      </Button>
    </div>
  );
}

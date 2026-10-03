import Link from "next/link";
import { notFound } from "next/navigation";
import { Hourglass } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { AUTH_ROUTES } from "@/src/lib/auth/constants";

/** Sidebar modules that exist in the menu but aren't built yet. */
const MODULES: Record<string, { title: string; blurb: string }> = {
  "clinical-records": { title: "Clinical records", blurb: "Visit notes and each patient's clinical history in one place." },
  "test-reports": { title: "Test reports", blurb: "Lab results across all patients. Until then, see a patient's reports in the Patients drawer." },
  prescriptions: { title: "Prescriptions", blurb: "Prescriptions written at each visit." },
  invoices: { title: "Invoices", blurb: "Bills for visits, tests and medicines." },
  payments: { title: "Payments", blurb: "Payments received and pending dues." },
};

export default async function ComingSoonPage({ params }: { params: Promise<{ module?: string[] }> }) {
  const { module } = await params;
  const key = module?.length === 1 ? module[0] : "";
  const info = MODULES[key];
  if (!info) notFound();

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/15">
        <Hourglass className="h-6 w-6 text-amber-700 dark:text-amber-300" />
      </span>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Coming soon</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">{info.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{info.blurb}</p>
      <p className="mt-1 text-sm text-muted-foreground">This module isn&apos;t available yet.</p>
      <Button asChild variant="outline" className="mt-6">
        <Link href={AUTH_ROUTES.dashboard}>Back to dashboard</Link>
      </Button>
    </div>
  );
}

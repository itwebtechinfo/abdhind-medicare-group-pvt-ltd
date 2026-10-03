"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogIn, ShieldAlert } from "lucide-react";
import { AuthCardShell } from "@/src/components/auth/AuthCardShell";
import { Button } from "@/src/components/ui/button";
import { useAuth } from "@/src/hooks/useAuth";
import { AUTH_ROUTES } from "@/src/lib/auth/constants";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  return (
    <AuthCardShell>
      <div className="space-y-4">
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-sm font-semibold text-amber-700">
          <ShieldAlert className="h-4 w-4" />
          Access restricted
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-[#17261F]">
          {isAuthenticated ? "You don't have access to this page" : "Staff sign-in required"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isAuthenticated
            ? "Your role doesn't include this module. Ask the clinic admin if you need access."
            : "This area is for clinic staff. Sign in to continue."}
        </p>
        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          {isAuthenticated ? (
            <Button asChild className="bg-[#1F7A4A] text-white hover:bg-[#1F7A4A]/90">
              <Link href={AUTH_ROUTES.dashboard}>Go to dashboard</Link>
            </Button>
          ) : (
            <Button asChild className="bg-[#1F7A4A] text-white hover:bg-[#1F7A4A]/90">
              <Link href={AUTH_ROUTES.login}>
                <LogIn className="h-4 w-4" />
                Sign in
              </Link>
            </Button>
          )}
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Go back
          </Button>
        </div>
      </div>
    </AuthCardShell>
  );
}

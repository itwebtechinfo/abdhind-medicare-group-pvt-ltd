"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  HeartPulse,
  Home,
  LogIn,
  ShieldAlert,
} from "lucide-react";
import { AUTH_ROUTES } from "@/src/lib/auth/constants";
import { useAuth } from "@/src/hooks/useAuth";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative min-h-[70vh] px-4 py-10">
      <Card className="mx-auto max-w-3xl overflow-hidden shadow-xl">
        <CardHeader className="space-y-4 bg-muted/40 p-6 md:p-10">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-500/15 px-4 py-1.5 text-sm font-semibold text-amber-700">
            <ShieldAlert className="h-4 w-4" />
            Access Restricted
          </div>
          <div className="text-6xl font-bold text-muted-foreground/30 md:text-7xl">
            403
          </div>
          <h1 className="text-2xl font-bold md:text-3xl">
            {isAuthenticated
              ? "You don't have permission for this page"
              : "Staff sign-in required"}
          </h1>
          <p className="max-w-xl text-muted-foreground">
            {isAuthenticated
              ? "Your role does not include access to this module. Contact your administrator if you need access."
              : "This area is for authorized hospital staff. Sign in to continue."}
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 p-6 sm:flex-row md:p-10">
          {!isAuthenticated ? (
            <Button asChild>
              <Link href={AUTH_ROUTES.login}>
                <LogIn className="mr-2 h-4 w-4" />
                Sign in
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href={AUTH_ROUTES.dashboard}>Go to Dashboard</Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Homepage
            </Link>
          </Button>
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>
        </CardContent>
        <div className="border-t border-border bg-primary/5 px-6 py-4 md:px-10">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <HeartPulse className="h-4 w-4 text-primary" />
            Abd Hind Medicare — Staff Portal
          </p>
        </div>
      </Card>
    </div>
  );
}

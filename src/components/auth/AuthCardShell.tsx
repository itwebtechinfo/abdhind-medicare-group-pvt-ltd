"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/src/hooks/useAuth";
import { AUTH_ROUTES } from "@/src/lib/auth/constants";

/** Centered card with the clinic logo for the (auth) pages, plus a way out
 * (dashboard / sign out, or home / sign in) so nobody is ever stuck. */
export function AuthCardShell({
  children,
  hideDashboardLink = false,
}: {
  children: React.ReactNode;
  /** e.g. during a forced password change, where the dashboard isn't reachable yet. */
  hideDashboardLink?: boolean;
}) {
  const { isAuthenticated, logout } = useAuth();
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F7F6] px-4 py-10">
      <div className="w-full max-w-lg">
        <Link href="/" className="mx-auto mb-6 flex w-fit items-center gap-3">
          <Image src="/logo.png" alt="Abd Hind MediCare" width={44} height={41} priority />
          <span className="text-lg font-semibold text-[#17261F]">Abd Hind MediCare</span>
        </Link>
        <div className="rounded-xl border border-[#E3E9E5] bg-white p-6 shadow-sm sm:p-8">{children}</div>
        <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
          {isAuthenticated ? (
            <>
              {!hideDashboardLink && (
                <Link href={AUTH_ROUTES.dashboard} className="hover:text-foreground hover:underline">
                  Back to dashboard
                </Link>
              )}
              <button type="button" onClick={() => logout()} className="hover:text-foreground hover:underline">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/" className="hover:text-foreground hover:underline">
                Website home
              </Link>
              <Link href={AUTH_ROUTES.login} className="hover:text-foreground hover:underline">
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

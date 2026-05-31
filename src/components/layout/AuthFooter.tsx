"use client";

import Link from "next/link";
import { AUTH_ROUTES } from "@/src/lib/auth/constants";

export function AuthFooter() {
  return (
    <footer className="mt-auto w-full min-w-0 border-t border-gray-800 bg-gray-900 text-gray-300">
      <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">
              Abd Hind MediCare · Staff Portal
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Authorized internal use only. Session activity may be monitored.
            </p>
          </div>
          <nav className="flex w-full flex-wrap gap-x-5 gap-y-2 text-sm lg:justify-end">
            <Link
              href={AUTH_ROUTES.dashboard}
              className="hover:text-green-400 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/appointments"
              className="hover:text-green-400 transition-colors"
            >
              Appointments
            </Link>
            <Link
              href="/patients"
              className="hover:text-green-400 transition-colors"
            >
              Patients
            </Link>
            <Link
              href="/reports"
              className="hover:text-green-400 transition-colors"
            >
              Reports
            </Link>
            <Link
              href="/"
              className="hover:text-green-400 transition-colors"
            >
              Public Website
            </Link>
          </nav>
        </div>
        <div className="mt-6 w-full border-t border-gray-800 pt-6">
          <div className="flex w-full flex-col items-center justify-between gap-3 text-xs text-gray-500 sm:flex-row">
            <span>© 2024 ABDHind MediCare Pvt. Ltd. · All rights reserved.</span>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/privacy" className="hover:text-green-400 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-green-400 transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

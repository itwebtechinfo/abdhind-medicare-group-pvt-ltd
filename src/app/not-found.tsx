"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  HeartPulse,
  Home,
  Phone,
  Search,
  Stethoscope,
} from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-[70vh] px-4 py-10">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-teal-100 bg-gradient-to-br from-white via-teal-50 to-sky-50 shadow-xl">
        <div className="grid gap-8 p-6 md:grid-cols-[1fr_360px] md:p-10">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-teal-100 px-4 py-1.5 text-sm font-semibold text-teal-700">
              <HeartPulse className="h-4 w-4" />
              Abd Hind Medicare Group
            </div>

            <div className="text-7xl font-bold leading-none text-teal-100 md:text-8xl">
              404
            </div>
            <h1 className="mt-4 text-3xl font-bold text-gray-900 md:text-5xl">
              This care route is unavailable
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-gray-600">
              The page may have moved, or the link may be outdated. You can
              return to our main healthcare pathways below.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-teal-700 hover:shadow-lg"
              >
                <Home className="h-4 w-4" />
                Homepage
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:border-teal-600 hover:text-teal-700"
              >
                <Stethoscope className="h-4 w-4" />
                Services
              </Link>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:border-teal-600 hover:text-teal-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <Search className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Quick Navigation
            </h2>
            <div className="mt-5 grid gap-3">
              <Link
                href="/book-appointment"
                className="flex items-center justify-between rounded-xl bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800 transition hover:bg-teal-100"
              >
                Book Appointment
                <Calendar className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Contact Care Team
                <Phone className="h-4 w-4" />
              </Link>
              <Link
                href="/services/emergency"
                className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Emergency Support
                <HeartPulse className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              Need help now? Call +91 95409 29832.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

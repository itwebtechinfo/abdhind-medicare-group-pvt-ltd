import type { Metadata } from "next";
import Link from "next/link";
import { CalendarX, Clock, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Cancellation Policy | Abd Hind Medicare Group",
  description:
    "Appointment cancellation, rescheduling, refund, and support policy for Abd Hind Medicare Group services.",
};

export default function CancellationPage() {
  const policies = [
    "Appointments can be rescheduled by contacting the care desk as early as possible.",
    "Some procedures, diagnostics, or specialist slots may require advance confirmation or preparation.",
    "Refund eligibility depends on service type, payment mode, appointment status, and whether clinical work has started.",
    "Emergency care and completed consultations are generally not cancellable once delivered.",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <section className="rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-teal-900 px-6 py-14 text-white md:px-10">
        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-teal-100">
          <CalendarX className="h-6 w-6" />
        </div>
        <h1 className="text-4xl font-bold">Cancellation Policy</h1>
        <p className="mt-3 max-w-2xl text-teal-50">
          Practical guidance for rescheduling appointments and requesting help
          with bookings or payments.
        </p>
      </section>
      <section className="mx-auto max-w-4xl py-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <div className="grid gap-4">
            {policies.map((policy, index) => (
              <div
                key={policy}
                className="flex gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <p className="leading-7 text-gray-700">{policy}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 grid gap-4 rounded-2xl bg-teal-50 p-5 md:grid-cols-2">
            <div className="flex gap-3">
              <Clock className="mt-0.5 h-5 w-5 text-teal-700" />
              <div>
                <h2 className="font-semibold text-gray-900">
                  Faster Support
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Share patient name, appointment date, phone number, and
                  payment reference if applicable.
                </p>
              </div>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              <Phone className="h-4 w-4" />
              Contact Care Desk
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

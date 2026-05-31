import type { Metadata } from "next";
import Link from "next/link";
import { CalendarX, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Cancellation Policy | Abd Hind Medicare Group",
  description:
    "Appointment cancellation and rescheduling policy for Abd Hind Medicare dental clinic appointments.",
};

export default function CancellationPage() {
  const policies = [
    "Dental appointments can be rescheduled by contacting the clinic team as early as possible.",
    "Procedure appointments may require advance preparation, so please call before cancelling or changing the visit.",
    "Any payment or refund support depends on the service type, payment mode, appointment status, and whether clinical work has started.",
    "Coming-soon specialties do not accept bookings yet; waitlist requests can be changed anytime through the care desk.",
  ];

  return (
    <div className="min-h-screen bg-[#f7f9f8]">
      <section className="rounded-[28px] border border-emerald-100 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-12">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-700">
          <CalendarX className="h-4 w-4" />
          Appointment Support
        </div>
        <h1 className="text-4xl font-extrabold text-slate-950 md:text-5xl">Cancellation Policy</h1>
        <p className="mt-4 max-w-3xl leading-8 text-slate-600">
          Simple guidance for rescheduling active dental appointments and managing waitlist requests.
        </p>
      </section>
      <section className="mx-auto mt-6 max-w-4xl rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)] md:p-8">
        <div className="space-y-4">
          {policies.map((policy, index) => (
            <div key={policy} className="flex gap-4 rounded-2xl bg-slate-50 p-5">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                {index + 1}
              </span>
              <p className="leading-7 text-slate-700">{policy}</p>
            </div>
          ))}
        </div>
        <Link href="/contact" className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-3 text-sm font-bold text-white">
          <Phone className="h-4 w-4" />
          Contact Care Desk
        </Link>
      </section>
    </div>
  );
}

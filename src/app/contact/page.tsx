import Link from "next/link";
import { Clock, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f7f9f8] text-slate-950">
      <section className="rounded-[28px] border border-emerald-100 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-12">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          Dental Clinic Active Now
        </div>
        <h1 className="max-w-4xl text-4xl font-extrabold leading-tight md:text-5xl">
          Contact Abd Hind Medicare
        </h1>
        <p className="mt-5 max-w-3xl leading-8 text-slate-600">
          Book active dental appointments, ask about treatment plans, or join the waitlist for upcoming hospital specialties.
        </p>
      </section>
      <section className="mt-6 grid gap-5 md:grid-cols-3">
        {[
          { icon: Phone, title: "Appointments", text: "+91 95409 29832", href: "tel:+919540929832" },
          { icon: Mail, title: "Email", text: "info@abdhindmedicare.com", href: "mailto:info@abdhindmedicare.com" },
          { icon: MapPin, title: "Clinic", text: "Jama Masjid, New Delhi 110006", href: "/clinics/delhi" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.title} href={item.href} className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-emerald-200">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-extrabold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
            </Link>
          );
        })}
      </section>
      <section className="mt-6 rounded-[24px] border border-emerald-100 bg-emerald-50 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-3">
            <Clock className="mt-1 h-5 w-5 text-emerald-700" />
            <div>
              <h2 className="font-extrabold text-slate-950">Dental clinic hours</h2>
              <p className="mt-1 text-sm text-slate-600">Monday to Saturday, 11:30 AM to 8:30 PM. Other specialties are coming soon.</p>
            </div>
          </div>
          <Link href="/book-appointment" className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-3 text-center text-sm font-bold text-white">
            Book Dental Appointment
          </Link>
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight, Bell, CheckCircle2, Clock, Phone, ShieldCheck } from "lucide-react";
import { hospitalServices, type HospitalService } from "@/src/lib/hospital-services";

export function ServiceShowcase({ service }: { service: HospitalService }) {
  const Icon = service.icon;
  const isActive = service.status === "active";

  return (
    <div className="min-h-screen bg-[#f7f9f8] text-slate-950">
      <section className="relative overflow-hidden rounded-[28px] border border-emerald-100 bg-white px-6 py-10 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:px-10 md:py-14">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-600 via-teal-400 to-sky-400" />
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <div className={`mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-bold ${
              isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"
            }`}>
              {isActive ? <ShieldCheck className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
              {service.badge}
            </div>
            <h1 className="max-w-4xl text-4xl font-extrabold leading-tight text-slate-950 md:text-5xl">
              {service.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
              {service.description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {isActive ? (
                <Link
                  href="/book-appointment"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-3 text-sm font-bold text-white shadow-[0_12px_28px_rgba(16,185,129,0.28)] transition hover:-translate-y-0.5"
                >
                  Book Dental Appointment
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-slate-900 to-teal-900 px-6 py-3 text-sm font-bold text-white shadow-[0_12px_28px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5"
                >
                  Join Waitlist
                  <Bell className="h-4 w-4" />
                </Link>
              )}
              <a
                href="tel:+919540929832"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-6 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
              >
                <Phone className="h-4 w-4" />
                Call Care Desk
              </a>
            </div>
          </div>
          <div className="rounded-[24px] border border-slate-100 bg-gradient-to-br from-slate-950 to-teal-900 p-6 text-white shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-emerald-200">
              <Icon className="h-9 w-9" />
            </div>
            <h2 className="mt-6 text-2xl font-extrabold">{isActive ? "Operational Clinic" : "Upcoming Specialty"}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-200">
              {isActive
                ? "Appointments, consultation, and dental procedures are available now at the active clinic."
                : "This service is being prepared with consultant onboarding, workflow planning, and patient-ready service design."}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
          <h2 className="text-2xl font-extrabold text-slate-950">Care Highlights</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {service.highlights.map((item) => (
              <div key={item} className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <aside className="rounded-[24px] border border-emerald-100 bg-emerald-50 p-6">
          <h2 className="text-xl font-extrabold text-slate-950">Doctor Availability</h2>
          <div className="mt-4 space-y-3">
            {service.doctors.map((doctor) => (
              <div key={doctor} className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="font-bold text-slate-900">{doctor}</p>
                <p className={`mt-1 text-xs font-bold ${isActive ? "text-emerald-700" : "text-amber-700"}`}>
                  {isActive ? "Available for dental consultation" : "Coming soon"}
                </p>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}

export function ServicesDirectory() {
  return (
    <div className="min-h-screen bg-[#f7f9f8] text-slate-950">
      <section className="rounded-[28px] border border-emerald-100 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-12">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          Premium Multi-Speciality Care
        </div>
        <h1 className="max-w-4xl text-4xl font-extrabold leading-tight md:text-5xl">
          Hospital Specialties Built Around Trust, Clarity and Modern Care
        </h1>
        <p className="mt-5 max-w-3xl leading-8 text-slate-600">
          Dental Clinic is currently active. All other departments are presented as upcoming premium services with waitlist and care-desk support.
        </p>
      </section>
      <section className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {hospitalServices.map((service) => {
          const Icon = service.icon;
          const isActive = service.status === "active";
          return (
            <Link
              key={service.slug}
              href={service.href}
              className="group rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                  <Icon className="h-6 w-6" />
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                  isActive ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {service.badge}
                </span>
              </div>
              <h2 className="mt-5 text-xl font-extrabold text-slate-950">{service.title}</h2>
              <p className="mt-2 line-clamp-4 text-sm leading-6 text-slate-500">{service.description}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-emerald-700">
                {isActive ? "Book now" : "View preview"}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          );
        })}
      </section>
    </div>
  );
}

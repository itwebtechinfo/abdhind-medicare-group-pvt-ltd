import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  Ambulance,
  ArrowRight,
  HeartPulse,
  Microscope,
  Pill,
  Shield,
  Smile,
  Stethoscope,
  Video,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Healthcare Services | Abd Hind Medicare Group",
  description:
    "Explore Abd Hind Medicare Group services including dental care, diagnostics, pharmacy, emergency care, telemedicine, wellness, insurance, and multi-speciality care.",
};

const services = [
  {
    title: "Dental Care",
    href: "/services/dental",
    icon: Smile,
    description:
      "Regenerative dentistry, painless RCT, zirconia crowns, implants, aligners, and smile design.",
  },
  {
    title: "Multi-Speciality Care",
    href: "/services/multi-speciality",
    icon: Stethoscope,
    description:
      "Coordinated consultations across medicine, cardiology, orthopedics, pediatrics, and more.",
  },
  {
    title: "Diagnostics",
    href: "/services/diagnostics",
    icon: Microscope,
    description:
      "Accurate lab testing, health packages, digital reports, and home sample collection.",
  },
  {
    title: "Pharmacy",
    href: "/services/pharmacy",
    icon: Pill,
    description:
      "Authentic medicines, refill reminders, emergency supply, and doorstep delivery support.",
  },
  {
    title: "Emergency 24/7",
    href: "/services/emergency",
    icon: Ambulance,
    description:
      "Rapid emergency guidance, ambulance coordination, and critical care support.",
  },
  {
    title: "Telemedicine",
    href: "/services/telemedicine",
    icon: Video,
    description:
      "Secure online doctor consultations with prescriptions and follow-up care.",
  },
  {
    title: "Insurance Desk",
    href: "/services/insurance",
    icon: Shield,
    description:
      "Cashless treatment assistance, documentation support, and claim coordination.",
  },
  {
    title: "Wellness Programs",
    href: "/services/wellness",
    icon: Activity,
    description:
      "Preventive health checks, chronic care plans, and lifestyle-led wellness programs.",
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-teal-900 px-6 py-16 text-white md:px-10 md:py-20">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="relative max-w-4xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-teal-100">
            <HeartPulse className="h-4 w-4" />
            Complete Healthcare Ecosystem
          </div>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Abd Hind Medicare Group Services
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-teal-50 md:text-lg">
            From advanced dental care to diagnostics, pharmacy, emergency
            support, and specialist consultations, our services are designed to
            keep patient care connected and clear.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/book-appointment"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-teal-800 shadow-lg transition hover:bg-gray-100"
            >
              Book Appointment
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 font-semibold text-white transition hover:bg-teal-700"
            >
              Talk to Care Team
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl py-14">
        <div className="mb-8 max-w-3xl">
          <h2 className="text-3xl font-bold text-gray-900">
            Choose the Care You Need
          </h2>
          <p className="mt-3 text-gray-600">
            Every service page includes appointment routes, contact options, and
            care details so patients can move forward without hitting a dead end.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <Link
              key={service.href}
              href={service.href}
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 transition group-hover:bg-teal-600 group-hover:text-white">
                <service.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 transition group-hover:text-teal-700">
                {service.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {service.description}
              </p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-teal-600">
                Learn more
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardCheck, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Abd Hind Medicare Group",
  description:
    "Terms for using Abd Hind Medicare Group website, appointment forms, healthcare information, and patient communication services.",
};

export default function TermsPage() {
  const sections = [
    {
      title: "Website Information",
      body: "Content on this website is provided for general awareness and service discovery. It does not replace consultation, diagnosis, treatment, or emergency medical advice from a qualified professional.",
    },
    {
      title: "Appointments and Enquiries",
      body: "Appointment requests submitted online are subject to confirmation by our team. In emergencies, patients should call the emergency number or visit the nearest emergency facility immediately.",
    },
    {
      title: "Patient Responsibilities",
      body: "Patients should provide accurate information, carry relevant reports, follow medical advice, and inform clinicians about allergies, medications, existing conditions, or prior procedures.",
    },
    {
      title: "Service Availability",
      body: "Doctor availability, timings, services, prices, and offers may change based on clinical operations, location, and regulatory requirements.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <section className="rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-teal-900 px-6 py-14 text-white md:px-10">
        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-teal-100">
          <FileText className="h-6 w-6" />
        </div>
        <h1 className="text-4xl font-bold">Terms of Service</h1>
        <p className="mt-3 max-w-2xl text-teal-50">
          Clear terms for website use, appointment requests, and healthcare
          communication with Abd Hind Medicare Group.
        </p>
      </section>
      <section className="mx-auto max-w-4xl py-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-xl font-bold text-gray-900">
                  {section.title}
                </h2>
                <p className="mt-2 leading-7 text-gray-600">{section.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col gap-3 rounded-2xl bg-teal-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3 text-teal-800">
              <ClipboardCheck className="mt-0.5 h-5 w-5" />
              <p className="text-sm leading-6">
                For confirmed medical advice, please book a consultation with a
                qualified clinician.
              </p>
            </div>
            <Link
              href="/book-appointment"
              className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

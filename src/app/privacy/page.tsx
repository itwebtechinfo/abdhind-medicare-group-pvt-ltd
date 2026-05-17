import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Lock, Mail, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Abd Hind Medicare Group",
  description:
    "Privacy policy for Abd Hind Medicare Group patient enquiries, appointment requests, healthcare communication, and website use.",
};

export default function PrivacyPage() {
  return (
    <PolicyLayout
      icon={<Lock className="h-6 w-6" />}
      title="Privacy Policy"
      subtitle="How Abd Hind Medicare Group handles patient and visitor information."
      sections={[
        {
          title: "Information We Collect",
          body: "We may collect your name, phone number, email address, appointment preferences, location details, and health-related information that you choose to share through forms, calls, WhatsApp, or in-person visits.",
        },
        {
          title: "How We Use Information",
          body: "Information is used to respond to enquiries, schedule appointments, coordinate care, send service updates, improve patient experience, and meet applicable healthcare and legal obligations.",
        },
        {
          title: "Data Protection",
          body: "We limit access to patient information to authorized team members and use reasonable administrative, technical, and operational safeguards to protect records from unauthorized access.",
        },
        {
          title: "Your Choices",
          body: "You may request corrections, ask about stored information, or opt out of non-essential communication by contacting our care team.",
        },
      ]}
    />
  );
}

function PolicyLayout({
  icon,
  title,
  subtitle,
  sections,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  sections: { title: string; body: string }[];
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <section className="rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-teal-900 px-6 py-14 text-white md:px-10">
        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-teal-100">
          {icon}
        </div>
        <h1 className="text-4xl font-bold">{title}</h1>
        <p className="mt-3 max-w-2xl text-teal-50">{subtitle}</p>
      </section>
      <section className="mx-auto max-w-4xl py-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-8 flex items-start gap-3 rounded-2xl bg-teal-50 p-4 text-teal-800">
            <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <p className="text-sm leading-6">
              This page provides website information and is not a substitute for
              formal medical consent or hospital registration documents.
            </p>
          </div>
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
          <div className="mt-10 rounded-2xl bg-gray-50 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Need help?</h3>
                <p className="text-sm text-gray-600">
                  Contact our care desk for privacy or record-related questions.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
              >
                <Mail className="h-4 w-4" />
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

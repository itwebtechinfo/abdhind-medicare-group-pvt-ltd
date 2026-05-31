import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Abd Hind Medicare Group",
  description:
    "Privacy policy for patient enquiries, appointment requests, and healthcare communication.",
};

export default function PrivacyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      description="How we handle appointment enquiries, dental clinic records, waitlist requests, and patient communication."
      sections={[
        "We collect only the details required to respond to enquiries, book dental appointments, and coordinate patient communication.",
        "Dental clinic appointment information is used for scheduling, reminders, consultation preparation, and care follow-up.",
        "Upcoming specialty waitlist details are used only to notify patients when services become available.",
        "Patient information is handled by authorized team members with reasonable administrative and operational safeguards.",
      ]}
    />
  );
}

function PolicyPage({
  title,
  description,
  sections,
}: {
  title: string;
  description: string;
  sections: string[];
}) {
  return (
    <div className="min-h-screen bg-[#f7f9f8]">
      <section className="rounded-[28px] border border-emerald-100 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-12">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          Patient Trust
        </div>
        <h1 className="text-4xl font-extrabold text-slate-950 md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-3xl leading-8 text-slate-600">{description}</p>
      </section>
      <section className="mx-auto mt-6 max-w-4xl rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)] md:p-8">
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div key={section} className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-bold text-emerald-700">0{index + 1}</p>
              <p className="mt-2 leading-7 text-slate-700">{section}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

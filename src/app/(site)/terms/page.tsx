import type { Metadata } from "next";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Abd Hind Medicare Group",
  description:
    "Terms for using Abd Hind Medicare Group website, appointment forms, and healthcare information.",
};

export default function TermsPage() {
  const sections = [
    "Website information is for service discovery and awareness. It does not replace consultation, diagnosis, or emergency medical advice.",
    "Dental appointments are active and subject to confirmation by the clinic team based on slot availability.",
    "All other specialty services shown as coming soon are previews of planned departments and are not currently available for booking.",
    "Patients should provide accurate details and carry relevant reports, prescriptions, and medical history during clinic visits.",
  ];

  return (
    <div className="min-h-screen bg-[#f7f9f8]">
      <section className="rounded-[28px] border border-emerald-100 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-12">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-700">
          <FileText className="h-4 w-4" />
          Clear Patient Communication
        </div>
        <h1 className="text-4xl font-extrabold text-slate-950 md:text-5xl">Terms of Service</h1>
        <p className="mt-4 max-w-3xl leading-8 text-slate-600">
          Practical terms for appointments, healthcare information, and upcoming service previews.
        </p>
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

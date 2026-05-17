import type { Metadata } from "next";
import ServicePage from "@/src/components/ServicePage";

export const metadata: Metadata = {
  title: "Multi-Speciality Care | Abd Hind Medicare Group",
  description:
    "Coordinated multi-speciality healthcare services with specialist consultations, diagnostics, pharmacy, and follow-up care.",
};

export default function MultiSpecialityPage() {
  return (
    <ServicePage
      title="Multi-Speciality Healthcare"
      subtitle="Connected medical care across specialties, diagnostics, and patient support."
      description="Our multi-speciality care model helps patients move from consultation to diagnosis, treatment, pharmacy, and follow-up without confusion. Abd Hind Medicare Group coordinates care plans across experienced clinicians and support teams."
      features={[
        "General medicine and chronic disease management",
        "Cardiology, orthopedics, neurology, ophthalmology, and pediatrics",
        "Integrated diagnostics and pharmacy support",
        "Preventive health checks and lifestyle counseling",
        "Referral coordination for advanced procedures",
        "Patient records, follow-up reminders, and care navigation",
      ]}
    />
  );
}

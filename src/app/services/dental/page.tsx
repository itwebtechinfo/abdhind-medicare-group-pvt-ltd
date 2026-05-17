import type { Metadata } from "next";
import ServicePage from "@/src/components/ServicePage";

export const metadata: Metadata = {
  title: "Dental Care | Abd Hind Medicare Group",
  description:
    "Advanced dental care including painless root canal, regenerative dentistry, dental implants, zirconia crowns, aligners, and preventive oral care.",
};

export default function DentalCarePage() {
  return (
    <ServicePage
      title="Advanced Dental Care"
      subtitle="Painless, precise, and prevention-led dentistry for every age group."
      description="Abd Hind Medicare Group brings together restorative, cosmetic, pediatric, and preventive dental care with a strong focus on saving natural teeth. Patients receive clear diagnosis, transparent treatment planning, and follow-up support for long-term oral health."
      features={[
        "Regenerative dentistry and natural tooth preservation",
        "Painless root canal treatment and tooth-colored restorations",
        "Dental implants, bridges, and zirconia crowns",
        "Smile design, whitening, veneers, and aligner guidance",
        "Pediatric dental care and preventive fluoride programs",
        "Gum treatment, scaling, polishing, and maintenance plans",
      ]}
    />
  );
}

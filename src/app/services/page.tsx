import type { Metadata } from "next";
import { ServicesDirectory } from "@/src/components/hospital/ServiceShowcase";

export const metadata: Metadata = {
  title: "Hospital Services | Abd Hind Medicare Group",
  description:
    "Premium multi-speciality hospital services. Dental clinic is active now; cardiology, orthopedics, neurology, pediatrics, diagnostics, pharmacy, and more are coming soon.",
};

export default function ServicesPage() {
  return <ServicesDirectory />;
}

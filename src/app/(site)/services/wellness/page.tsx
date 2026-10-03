import { ServiceShowcase } from "@/src/components/hospital/ServiceShowcase";
import { getHospitalService } from "@/src/lib/hospital-services";

export default function WellnessServicePage() {
  return <ServiceShowcase service={getHospitalService("ent")} />;
}

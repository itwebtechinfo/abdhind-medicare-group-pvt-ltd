import { ServiceShowcase } from "@/src/components/hospital/ServiceShowcase";
import { getHospitalService } from "@/src/lib/hospital-services";

export default function PediatricsPage() {
  return <ServiceShowcase service={getHospitalService("pediatrics")} />;
}

import { ServiceShowcase } from "@/src/components/hospital/ServiceShowcase";
import { getHospitalService } from "@/src/lib/hospital-services";

export default function DentalServicePage() {
  return <ServiceShowcase service={getHospitalService("dental")} />;
}

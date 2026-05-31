import { ServiceShowcase } from "@/src/components/hospital/ServiceShowcase";
import { getHospitalService } from "@/src/lib/hospital-services";

export default function DelhiClinicPage() {
  return <ServiceShowcase service={getHospitalService("dental")} />;
}

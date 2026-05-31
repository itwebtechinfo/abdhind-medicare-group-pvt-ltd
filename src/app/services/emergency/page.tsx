import { ServiceShowcase } from "@/src/components/hospital/ServiceShowcase";
import { getHospitalService } from "@/src/lib/hospital-services";

export default function EmergencyServicePage() {
  return <ServiceShowcase service={getHospitalService("general-medicine")} />;
}

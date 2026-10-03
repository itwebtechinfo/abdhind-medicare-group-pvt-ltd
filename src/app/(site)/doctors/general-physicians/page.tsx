import { ServiceShowcase } from "@/src/components/hospital/ServiceShowcase";
import { getHospitalService } from "@/src/lib/hospital-services";

export default function GeneralPhysiciansPage() {
  return <ServiceShowcase service={getHospitalService("general-physicians")} />;
}

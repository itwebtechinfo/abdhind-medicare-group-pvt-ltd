import { Stethoscope } from "lucide-react";
import { ErpPageShell } from "@/src/components/dashboard/ErpPageShell";

export const metadata = { title: "Doctors Admin | MediCare ERP" };

export default function AdminDoctorsPage() {
  return (
    <ErpPageShell
      title="Doctors (Admin)"
      description="Internal doctor roster and scheduling — separate from the public doctors directory."
      icon={Stethoscope}
    />
  );
}

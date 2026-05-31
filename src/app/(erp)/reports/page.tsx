import { FileText } from "lucide-react";
import { ErpPageShell } from "@/src/components/dashboard/ErpPageShell";

export const metadata = { title: "Reports | MediCare ERP" };

export default function ReportsPage() {
  return (
    <ErpPageShell
      title="Reports"
      description="Operational, clinical, and financial reporting dashboards."
      icon={FileText}
    />
  );
}

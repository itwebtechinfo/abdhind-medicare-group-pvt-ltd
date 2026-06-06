import { MessageSquare } from "lucide-react";
import { ErpPageShell } from "@/src/components/dashboard/ErpPageShell";

export const metadata = { title: "Enquiries | MediCare ERP" };

export default function EnquiriesPage() {
  return (
    <ErpPageShell
      title="Enquiries"
      description="Manage patient enquiries and messages."
      icon={MessageSquare}
    >
      <div className="grid gap-4">
        <p className="text-sm text-muted-foreground">Enquiries dashboard content will go here.</p>
      </div>
    </ErpPageShell>
  );
}
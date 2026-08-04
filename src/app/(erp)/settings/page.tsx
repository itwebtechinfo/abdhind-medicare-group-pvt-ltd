import { Settings } from "lucide-react";
import { ErpPageShell } from "@/src/components/dashboard/ErpPageShell";
import { WhatsAppConfigStatusCard } from "@/src/features/whatsapp/WhatsAppConfigStatusCard";

export const metadata = { title: "Settings | MediCare ERP" };

export default function SettingsPage() {
  return (
    <ErpPageShell
      title="Settings"
      description="Hospital preferences, notifications, and integration configuration."
      icon={Settings}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WhatsAppConfigStatusCard />
      </div>
    </ErpPageShell>
  );
}

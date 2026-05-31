import { Settings } from "lucide-react";
import { ErpPageShell } from "@/src/components/dashboard/ErpPageShell";

export const metadata = { title: "Settings | MediCare ERP" };

export default function SettingsPage() {
  return (
    <ErpPageShell
      title="Settings"
      description="Hospital preferences, notifications, and integration configuration."
      icon={Settings}
    />
  );
}

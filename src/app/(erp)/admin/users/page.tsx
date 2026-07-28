import { UserCog } from "lucide-react";
import { ErpPageShell } from "@/src/components/dashboard/ErpPageShell";

export const metadata = { title: "User Management | MediCare ERP" };

export default function UserManagementPage() {
  return (
    <ErpPageShell
      title="User Management"
      description="Manage staff accounts, assign roles, and control who can access each module."
      icon={UserCog}
    />
  );
}

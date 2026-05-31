import Link from "next/link";
import { Building2, Stethoscope, BarChart3 } from "lucide-react";
import { ErpPageShell } from "@/src/components/dashboard/ErpPageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";

const adminLinks = [
  {
    title: "Doctors",
    description: "Manage consultants and clinical staff.",
    href: "/admin/doctors",
    icon: Stethoscope,
  },
  {
    title: "Departments",
    description: "Hospital units and service lines.",
    href: "/admin",
    icon: Building2,
  },
  {
    title: "Analytics",
    description: "Operational and financial reports.",
    href: "/reports",
    icon: BarChart3,
  },
];

export const metadata = { title: "Admin | MediCare ERP" };

export default function AdminPage() {
  return (
    <ErpPageShell
      title="Administration"
      description="Hospital configuration, departments, and system modules."
      icon={Building2}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adminLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.title} href={item.href}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </ErpPageShell>
  );
}

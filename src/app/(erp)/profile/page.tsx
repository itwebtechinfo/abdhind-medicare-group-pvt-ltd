"use client";

import { User } from "lucide-react";
import { ErpPageShell } from "@/src/components/dashboard/ErpPageShell";
import { useAuth } from "@/src/hooks/useAuth";
import { ROLE_LABELS } from "@/src/lib/rbac/roles";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";

export default function ProfilePage() {
  const { user, session } = useAuth();

  return (
    <ErpPageShell
      title="Profile"
      description="Your staff account, role, and session details."
      icon={User}
    >
      <Card className="max-w-lg">
        <CardContent className="space-y-4 p-6">
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Display name
            </p>
            <p className="text-lg font-semibold">{user?.displayName}</p>
          </div>
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Username
              </p>
              <p className="font-medium">{user?.username}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Role
              </p>
              <Badge variant="secondary" className="mt-1">
                {user ? ROLE_LABELS[user.role] : "—"}
              </Badge>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Email
              </p>
              <p className="font-medium">{user?.email ?? "—"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Permissions
              </p>
              <p className="text-sm text-muted-foreground">
                {user?.permissions.length ?? 0} module permissions active
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Session started
              </p>
              <p className="font-medium">
                {session?.loggedInAt
                  ? new Date(session.loggedInAt).toLocaleString()
                  : "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </ErpPageShell>
  );
}

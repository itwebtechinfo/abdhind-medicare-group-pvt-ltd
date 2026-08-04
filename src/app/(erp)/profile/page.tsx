"use client";

import {
  BadgeCheck,
  CalendarClock,
  Fingerprint,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";
import { ROLE_LABELS } from "@/src/lib/rbac/roles";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Phone;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, session } = useAuth();

  const address = [user?.address, user?.district, user?.state].filter(Boolean).join(", ");

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      {/* Cover / identity header */}
      <Card className="overflow-hidden border-border/80 shadow-sm">
        <div className="h-24 bg-gradient-to-r from-primary/25 via-primary/10 to-transparent sm:h-28" />
        <CardContent className="relative flex flex-col gap-4 px-5 pb-6 pt-0 sm:flex-row sm:items-end sm:gap-6 sm:px-8">
          <Avatar className="-mt-10 h-24 w-24 shrink-0 border-4 border-card shadow-md sm:-mt-12 sm:h-28 sm:w-28">
            {user?.profileImage && <AvatarImage src={user.profileImage} alt={user.displayName} />}
            <AvatarFallback className="text-2xl">
              {user ? initials(user.displayName) : "—"}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 pt-3 sm:pt-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
                {user?.displayName ?? "—"}
              </h1>
              {user?.role && (
                <Badge variant="secondary" className="gap-1">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {ROLE_LABELS[user.role]}
                </Badge>
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {user?.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {user.phone}
                </span>
              )}
              {user?.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
            <InfoRow icon={Phone} label="Phone Number" value={user?.phone || "—"} />
            <InfoRow icon={Mail} label="Email" value={user?.email || "—"} />
            <InfoRow icon={UserRound} label="Gender" value={user?.gender || "—"} />
            <InfoRow icon={Fingerprint} label="Age" value={user?.age ?? "—"} />
            <div className="sm:col-span-2">
              <InfoRow icon={MapPin} label="Address" value={address || "—"} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5 p-6">
            <InfoRow
              icon={ShieldCheck}
              label="Role"
              value={user ? ROLE_LABELS[user.role] : "—"}
            />
            <Separator />
            <InfoRow
              icon={KeyRound}
              label="Permissions"
              value={`${user?.permissions.length ?? 0} modules granted`}
            />
            <Separator />
            <InfoRow
              icon={CalendarClock}
              label="Session started"
              value={
                session?.loggedInAt ? new Date(session.loggedInAt).toLocaleString() : "—"
              }
            />
          </CardContent>
        </Card>
      </div>

      {/* Permissions */}
      {user && user.permissions.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Access &amp; Permissions
            </p>
            <div className="flex flex-wrap gap-1.5">
              {user.permissions.map((permission) => (
                <Badge key={permission} variant="outline" className="font-mono text-xs font-normal">
                  {permission}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { doctorService } from "@/src/features/doctors/doctor";
import { firstName, type AccessLevel, type ApiUser, type RoleInfo, type StaffRole } from "./user";
import { RoleBadge } from "./StaffBadges";

const LEVEL_LABEL: Record<AccessLevel, string> = { full: "Full access", view_only: "View only", none: "No access" };

interface ChangeRoleDialogProps {
  user: ApiUser | null;
  roles: RoleInfo[];
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (role: StaffRole, doctorId?: string) => void;
}

/** Mount with a fresh key per user so the selection resets. */
export function ChangeRoleDialog({ user, roles, isSubmitting, onOpenChange, onSubmit }: ChangeRoleDialogProps) {
  const current = roles.find((r) => r.role === user?.role);
  const [role, setRole] = useState<StaffRole | "">("");
  const [doctorId, setDoctorId] = useState(user?.linked_doctor?.id ?? "");
  const target = roles.find((r) => r.role === role);

  // Unlinked doctor records, plus the one this user already holds.
  const { data: doctorOptions = [], isLoading: doctorsLoading } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => (await doctorService.list()).data.doctors,
    enabled: Boolean(user) && role === "doctor",
    select: (doctors) => doctors.filter((d) => !d.user_id || d.user_id === user?.id),
  });

  const diff = useMemo(() => {
    if (!current || !target) return [];
    return target.modules
      .map((m) => ({ label: m.label, from: current.modules.find((c) => c.key === m.key)?.level ?? "none", to: m.level }))
      .filter((d) => d.from !== d.to);
  }, [current, target]);

  const sameDoctorAgain = role === "doctor" && user?.role === "doctor" && doctorId === (user?.linked_doctor?.id ?? "");
  const canSubmit = Boolean(role) && (role !== "doctor" || Boolean(doctorId)) && (role !== user?.role || role === "doctor") && !sameDoctorAgain;

  return (
    <Dialog open={Boolean(user)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Change role</DialogTitle>
          <DialogDescription>
            {user ? `${firstName(user.full_name)} will be signed out so the new access applies right away.` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Current:</span>
          {current && <RoleBadge role={current.role} label={current.label} />}
          {user?.linked_doctor && <span className="text-xs text-muted-foreground">Linked: {user.linked_doctor.full_name}</span>}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {roles
            .filter((r) => r.assignable)
            .map((r) => {
              const disabled = r.role === user?.role && r.role !== "doctor";
              return (
                <button
                  key={r.role}
                  type="button"
                  disabled={disabled}
                  onClick={() => setRole(r.role)}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                    role === r.role
                      ? "border-[#1F7A4A] bg-[#1F7A4A]/5 ring-1 ring-[#1F7A4A] dark:border-primary dark:bg-primary/10 dark:ring-primary"
                      : "border-[#E3E9E5] hover:bg-muted/40 dark:border-border"
                  )}
                >
                  <RoleBadge role={r.role} label={r.label} />
                  <span className="text-xs text-muted-foreground">{disabled ? "Current role" : r.description}</span>
                </button>
              );
            })}
        </div>

        {role === "doctor" && (
          <div>
            <label htmlFor="role-doctor" className="mb-1.5 block text-sm font-medium">
              Link to doctor
            </label>
            <select
              id="role-doctor"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">{doctorsLoading ? "Loading doctors…" : "Choose a doctor record"}</option>
              {doctorOptions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.full_name}
                  {d.specialization ? ` — ${d.specialization}` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {target && (
          <div className="rounded-xl border border-[#E3E9E5] p-3 dark:border-border">
            <p className="mb-2 text-sm font-medium">What changes</p>
            {diff.length === 0 ? (
              <p className="text-sm text-muted-foreground">Page access stays the same.</p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {diff.map((d) => (
                  <li key={d.label} className="flex flex-wrap items-center gap-x-2">
                    <span className="min-w-[9rem] font-medium">{d.label}</span>
                    <span className={cn(d.from === "none" ? "text-muted-foreground" : "")}>{LEVEL_LABEL[d.from]}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className={cn("font-medium", d.to === "none" ? "text-red-700 dark:text-red-400" : "text-[#1F7A4A] dark:text-primary")}>
                      {LEVEL_LABEL[d.to]}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {user?.role === "doctor" && role !== "doctor" && user.linked_doctor && (
              <p className="mt-2 text-xs text-muted-foreground">The link to {user.linked_doctor.full_name} will be removed.</p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canSubmit || isSubmitting}
            onClick={() => role && onSubmit(role, role === "doctor" ? doctorId : undefined)}
            className="bg-[#1F7A4A] text-white hover:bg-[#1F7A4A]/90 dark:bg-primary dark:text-primary-foreground"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Change role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

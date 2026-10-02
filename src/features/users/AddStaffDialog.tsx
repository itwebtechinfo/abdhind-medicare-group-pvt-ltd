"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { cn } from "@/src/lib/utils";
import { doctorService } from "@/src/features/doctors/doctor";
import { staffContactSchema, type CreateStaffPayload, type RoleInfo, type StaffRole } from "./user";
import { RoleBadge } from "./StaffBadges";

interface AddStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: RoleInfo[];
  isSubmitting: boolean;
  onSubmit: (payload: CreateStaffPayload) => void;
}

/** Short "Patients, Appointments, +3" summary of a role's full/view access. */
export function accessSummary(role: RoleInfo): string {
  const open = role.modules.filter((m) => m.level !== "none").map((m) => (m.level === "view_only" ? `${m.label} (view)` : m.label));
  return open.length <= 4 ? open.join(", ") : `${open.slice(0, 4).join(", ")} +${open.length - 4} more`;
}

/** Mount with a fresh key per open so the form resets. */
export function AddStaffDialog({ open, onOpenChange, roles, isSubmitting, onSubmit }: AddStaffDialogProps) {
  const assignable = roles.filter((r) => r.assignable);
  const [values, setValues] = useState({ full_name: "", phone_number: "", email: "" });
  const [role, setRole] = useState<StaffRole | "">("");
  const [doctorId, setDoctorId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Only doctor records no login is linked to yet.
  const { data: unlinkedDoctors = [], isLoading: doctorsLoading } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => (await doctorService.list()).data.doctors,
    enabled: open && role === "doctor",
    select: (doctors) => doctors.filter((d) => !d.user_id),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = staffContactSchema.safeParse(values);
    const next: Record<string, string> = {};
    if (!parsed.success) for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
    if (!role) next.role = "Choose a role";
    if (role === "doctor" && !doctorId) next.doctor_id = "Choose the doctor record this login belongs to";
    setErrors(next);
    if (Object.keys(next).length || !parsed.success || !role) return;
    onSubmit({
      full_name: parsed.data.full_name,
      phone_number: parsed.data.phone_number,
      email: parsed.data.email || undefined,
      role,
      ...(role === "doctor" ? { doctor_id: doctorId } : {}),
    });
  };

  const input = (key: keyof typeof values, label: string, props: React.ComponentProps<typeof Input>) => (
    <div>
      <label htmlFor={`staff-${key}`} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <Input
        id={`staff-${key}`}
        value={values[key]}
        onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
        aria-invalid={Boolean(errors[key])}
        {...props}
      />
      {errors[key] && <p className="mt-1 text-xs text-destructive">{errors[key]}</p>}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add staff member</DialogTitle>
          <DialogDescription>
            They&apos;ll get a temporary password (shown to you once) and set their own on first sign-in.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">{input("full_name", "Full name", { autoComplete: "off" })}</div>
            {input("phone_number", "Mobile number", { inputMode: "numeric", placeholder: "10-digit number", maxLength: 10 })}
            {input("email", "Email (optional)", { type: "email", autoComplete: "off" })}
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium">Role</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {assignable.map((r) => (
                <label
                  key={r.role}
                  className={cn(
                    "flex cursor-pointer flex-col gap-1.5 rounded-xl border p-3 transition-colors",
                    role === r.role
                      ? "border-[#1F7A4A] bg-[#1F7A4A]/5 ring-1 ring-[#1F7A4A] dark:border-primary dark:bg-primary/10 dark:ring-primary"
                      : "border-[#E3E9E5] hover:bg-muted/40 dark:border-border"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="staff-role"
                      value={r.role}
                      checked={role === r.role}
                      onChange={() => setRole(r.role)}
                      className="accent-[#1F7A4A]"
                    />
                    <RoleBadge role={r.role} label={r.label} />
                  </span>
                  <span className="text-xs text-muted-foreground">{r.description}</span>
                  <span className="text-[11px] text-muted-foreground/80">Opens: {accessSummary(r) || "—"}</span>
                </label>
              ))}
            </div>
            {errors.role && <p className="mt-1 text-xs text-destructive">{errors.role}</p>}
          </fieldset>

          {role === "doctor" && (
            <div>
              <label htmlFor="staff-doctor" className="mb-1.5 block text-sm font-medium">
                Link to doctor
              </label>
              <select
                id="staff-doctor"
                required
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">{doctorsLoading ? "Loading doctors…" : "Choose a doctor record"}</option>
                {unlinkedDoctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.full_name}
                    {d.specialization ? ` — ${d.specialization}` : ""}
                  </option>
                ))}
              </select>
              {!doctorsLoading && unlinkedDoctors.length === 0 && (
                <p className="mt-1 text-xs text-muted-foreground">Every doctor record already has a login. Add the doctor first under Doctors.</p>
              )}
              {errors.doctor_id && <p className="mt-1 text-xs text-destructive">{errors.doctor_id}</p>}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#1F7A4A] text-white hover:bg-[#1F7A4A]/90 dark:bg-primary dark:text-primary-foreground">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Add staff member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

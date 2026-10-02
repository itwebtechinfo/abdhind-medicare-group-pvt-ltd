"use client";

import { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
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
import { INDIA_STATES, getDistricts } from "@/src/data/india-states-districts";
import { staffContactSchema, type ApiUser, type UpdateStaffPayload } from "./user";

const SELECT_CLASS =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

interface EditStaffDialogProps {
  user: ApiUser | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  /** Only the fields that changed. */
  onSubmit: (changes: UpdateStaffPayload) => void;
}

/** Contact details up front; the older profile fields (age, gender, address,
 * state, district) stay editable under "Other details". Mount with a key per user. */
export function EditStaffDialog({ user, isSubmitting, onOpenChange, onSubmit }: EditStaffDialogProps) {
  const initial = {
    full_name: user?.full_name ?? "",
    phone_number: user?.phone_number ?? "",
    email: user?.email ?? "",
    age: user?.age != null ? String(user.age) : "",
    gender: user?.gender ?? "",
    address: user?.address ?? "",
    state: user?.state ?? "",
    district: user?.district ?? "",
  };
  const [values, setValues] = useState(initial);
  const [moreOpen, setMoreOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value, ...(key === "state" ? { district: "" } : {}) }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = staffContactSchema.safeParse(values);
    const next: Record<string, string> = {};
    if (!parsed.success) for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
    if (values.age && (!/^\d+$/.test(values.age) || Number(values.age) > 120)) next.age = "Enter a valid age";
    setErrors(next);
    if (Object.keys(next).length) return;
    const changes: UpdateStaffPayload = {};
    (Object.keys(values) as (keyof typeof values)[]).forEach((key) => {
      if (values[key].trim() === initial[key].trim()) return;
      if (key === "age") {
        if (values.age) changes.age = Number(values.age);
      } else {
        (changes as Record<string, string>)[key] = values[key].trim();
      }
    });
    if (Object.keys(changes).length === 0) return onOpenChange(false);
    onSubmit(changes);
  };

  const field = (key: keyof typeof values, label: string, props: React.ComponentProps<typeof Input> = {}) => (
    <div>
      <label htmlFor={`edit-${key}`} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <Input id={`edit-${key}`} value={values[key]} onChange={set(key)} aria-invalid={Boolean(errors[key])} {...props} />
      {errors[key] && <p className="mt-1 text-xs text-destructive">{errors[key]}</p>}
    </div>
  );

  return (
    <Dialog open={Boolean(user)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit details</DialogTitle>
          <DialogDescription>Role and account status are changed from their own actions.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          {field("full_name", "Full name")}
          <div className="grid gap-4 sm:grid-cols-2">
            {field("phone_number", "Mobile number", { inputMode: "numeric", maxLength: 10 })}
            {field("email", "Email (optional)", { type: "email" })}
          </div>

          <div className="rounded-xl border border-[#E3E9E5] dark:border-border">
            <button
              type="button"
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen((o) => !o)}
              className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium"
            >
              Other details (optional)
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", moreOpen && "rotate-180")} />
            </button>
            {moreOpen && (
              <div className="grid gap-4 border-t border-[#E3E9E5] p-3 dark:border-border sm:grid-cols-2">
                {field("age", "Age", { inputMode: "numeric" })}
                <div>
                  <label htmlFor="edit-gender" className="mb-1.5 block text-sm font-medium">
                    Gender
                  </label>
                  <select id="edit-gender" value={values.gender} onChange={set("gender")} className={SELECT_CLASS}>
                    <option value="">—</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="edit-state" className="mb-1.5 block text-sm font-medium">
                    State
                  </label>
                  <select id="edit-state" value={values.state} onChange={set("state")} className={SELECT_CLASS}>
                    <option value="">—</option>
                    {/* Stored as the state code (e.g. "up" = Uttar Pradesh). An unknown legacy
                        value stays visible instead of being silently dropped. */}
                    {values.state && !INDIA_STATES.some((st) => st.code === values.state) && (
                      <option value={values.state}>{values.state}</option>
                    )}
                    {INDIA_STATES.map((st) => (
                      <option key={st.code} value={st.code}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="edit-district" className="mb-1.5 block text-sm font-medium">
                    District
                  </label>
                  <select id="edit-district" value={values.district} onChange={set("district")} className={SELECT_CLASS}>
                    <option value="">—</option>
                    {values.district && !getDistricts(values.state).includes(values.district) && (
                      <option value={values.district}>{values.district}</option>
                    )}
                    {getDistricts(values.state).map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">{field("address", "Address")}</div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#1F7A4A] text-white hover:bg-[#1F7A4A]/90 dark:bg-primary dark:text-primary-foreground">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

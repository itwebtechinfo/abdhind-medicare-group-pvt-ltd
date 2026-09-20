"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { usePermission } from "@/src/hooks/usePermission";
import { departmentService } from "@/src/features/departments/department";
import { userService } from "@/src/features/users/user";
import { INDIA_STATES, getDistricts } from "@/src/data/india-states-districts";
import {
  DEFAULT_WORKING_HOURS,
  createDoctorSchema,
  editDoctorSchema,
  type CreateDoctorFormValues,
} from "./doctor";
import { WEEKDAYS, type ApiDoctor, type UpdateDoctorPayload, type Weekday } from "./doctor";

const SELECT_CLASS =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring";

interface DoctorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present => edit mode, prefilled from this doctor. */
  doctor?: ApiDoctor | null;
  isSubmitting: boolean;
  onCreate: (values: CreateDoctorFormValues) => void;
  onUpdate: (id: string, changes: UpdateDoctorPayload) => void;
}

const EMPTY_VALUES: CreateDoctorFormValues = {
  full_name: "",
  department_id: "",
  specialization: "",
  phone: "",
  slot_duration_minutes: 15,
  working_hours: DEFAULT_WORKING_HOURS,
  user_id: "",
};

const DAY_LABELS: Record<Weekday, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export function DoctorFormDialog({
  open,
  onOpenChange,
  doctor,
  isSubmitting,
  onCreate,
  onUpdate,
}: DoctorFormDialogProps) {
  const isEdit = Boolean(doctor);
  const { can } = usePermission();
  const canLinkLogin = can("users:view") || can("users:manage");

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => (await departmentService.list()).data.departments,
    enabled: open,
  });

  const { data: doctorLogins = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => (await userService.list()).data.users,
    enabled: open && isEdit && canLinkLogin,
    select: (users) => users.filter((u) => u.role === "doctor"),
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    unregister,
    formState: { errors, dirtyFields },
  } = useForm<CreateDoctorFormValues>({
    resolver: zodResolver(
      isEdit ? editDoctorSchema : createDoctorSchema
    ) as unknown as Resolver<CreateDoctorFormValues>,
    defaultValues: EMPTY_VALUES,
  });

  const workingHours = useWatch({ control, name: "working_hours" });
  const loginState = useWatch({ control, name: "login.state" });
  const loginDistricts = getDistricts(loginState ?? "");

  // Create-mode only: whether to also create+link a new login for this doctor.
  // Reset during render (not in the effect below) when the dialog re-opens —
  // avoids a cascading setState-in-effect render.
  const [wantsNewLogin, setWantsNewLogin] = useState(false);
  const [openSnapshot, setOpenSnapshot] = useState(open);
  if (open !== openSnapshot) {
    setOpenSnapshot(open);
    if (open) setWantsNewLogin(false);
  }

  useEffect(() => {
    if (!open) return;
    reset(
      doctor
        ? {
            full_name: doctor.full_name,
            department_id: doctor.department_id,
            specialization: doctor.specialization,
            phone: doctor.phone,
            slot_duration_minutes: doctor.slot_duration_minutes,
            working_hours: doctor.working_hours,
            user_id: doctor.user_id ?? "",
          }
        : EMPTY_VALUES
    );
  }, [open, doctor, reset]);

  const toggleNewLogin = (checked: boolean) => {
    setWantsNewLogin(checked);
    if (!checked) unregister("login");
  };

  const onSubmit = handleSubmit((values) => {
    if (isEdit && doctor) {
      const changes: UpdateDoctorPayload = {};
      if (dirtyFields.full_name) changes.full_name = values.full_name;
      if (dirtyFields.department_id) changes.department_id = values.department_id;
      if (dirtyFields.specialization) changes.specialization = values.specialization;
      if (dirtyFields.phone) changes.phone = values.phone;
      if (dirtyFields.slot_duration_minutes)
        changes.slot_duration_minutes = values.slot_duration_minutes;
      if (dirtyFields.working_hours) changes.working_hours = values.working_hours;
      if (dirtyFields.user_id && values.user_id) changes.user_id = values.user_id;
      onUpdate(doctor.id, changes);
      return;
    }
    onCreate({ ...values, login: wantsNewLogin ? values.login : undefined });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Doctor" : "Add Doctor"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this doctor's profile or working hours."
              : "Add a consultant and set their working hours — slots generate automatically."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="full_name" className="mb-1.5 block text-sm font-medium">
                Full Name
              </label>
              <Input id="full_name" placeholder="Dr. Ekhlaq Ahmed" {...register("full_name")} />
              {errors.full_name && (
                <p className="mt-1 text-xs text-destructive">{errors.full_name.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="department_id" className="mb-1.5 block text-sm font-medium">
                Department
              </label>
              <select
                id="department_id"
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                {...register("department_id")}
              >
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.department_id && (
                <p className="mt-1 text-xs text-destructive">{errors.department_id.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="specialization" className="mb-1.5 block text-sm font-medium">
                Specialization
              </label>
              <Input
                id="specialization"
                placeholder="Dental Surgeon"
                {...register("specialization")}
              />
              {errors.specialization && (
                <p className="mt-1 text-xs text-destructive">{errors.specialization.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
                Phone
              </label>
              <Input id="phone" placeholder="+91-9540929800" {...register("phone")} />
              {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="w-40">
            <label htmlFor="slot_duration_minutes" className="mb-1.5 block text-sm font-medium">
              Slot Duration (minutes)
            </label>
            <Input
              id="slot_duration_minutes"
              type="number"
              min={5}
              max={180}
              {...register("slot_duration_minutes")}
            />
            {errors.slot_duration_minutes && (
              <p className="mt-1 text-xs text-destructive">{errors.slot_duration_minutes.message}</p>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Working Hours</p>
            <div className="space-y-1.5 rounded-lg border border-border p-3">
              {WEEKDAYS.map((day) => {
                const isWorking = workingHours?.[day]?.is_working ?? false;
                return (
                  <div key={day} className="flex items-center gap-3 text-sm">
                    <label className="flex w-32 items-center gap-2">
                      <input type="checkbox" {...register(`working_hours.${day}.is_working`)} />
                      {DAY_LABELS[day]}
                    </label>
                    <Input
                      type="time"
                      className="w-32"
                      disabled={!isWorking}
                      {...register(`working_hours.${day}.start_time`)}
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      className="w-32"
                      disabled={!isWorking}
                      {...register(`working_hours.${day}.end_time`)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {!isEdit && canLinkLogin && (
            <div className="rounded-lg border border-border p-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={wantsNewLogin}
                  onChange={(event) => toggleNewLogin(event.target.checked)}
                />
                Create a login for this doctor now
              </label>
              <p className="mt-1 text-xs text-muted-foreground">
                Optional — skip this to add a profile only and link (or create) a login later from
                Users.
              </p>

              {wantsNewLogin && (
                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="login.phone_number" className="mb-1.5 block text-sm font-medium">
                        Login Phone Number
                      </label>
                      <Input
                        id="login.phone_number"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        {...register("login.phone_number", {
                          onChange: (event) => {
                            event.target.value = event.target.value.replace(/\D/g, "").slice(0, 10);
                          },
                        })}
                      />
                      {errors.login?.phone_number && (
                        <p className="mt-1 text-xs text-destructive">
                          {errors.login.phone_number.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="login.password" className="mb-1.5 block text-sm font-medium">
                        Password
                      </label>
                      <Input
                        id="login.password"
                        type="password"
                        placeholder="Temporary password"
                        {...register("login.password")}
                      />
                      {errors.login?.password && (
                        <p className="mt-1 text-xs text-destructive">{errors.login.password.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="login.state" className="mb-1.5 block text-sm font-medium">
                        State
                      </label>
                      <select id="login.state" className={SELECT_CLASS} {...register("login.state")}>
                        <option value="">Select state</option>
                        {INDIA_STATES.map((state) => (
                          <option key={state.code} value={state.code}>
                            {state.name}
                          </option>
                        ))}
                      </select>
                      {errors.login?.state && (
                        <p className="mt-1 text-xs text-destructive">{errors.login.state.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="login.district" className="mb-1.5 block text-sm font-medium">
                        District
                      </label>
                      <select
                        id="login.district"
                        className={SELECT_CLASS}
                        disabled={!loginState}
                        {...register("login.district")}
                      >
                        <option value="">{loginState ? "Select district" : "Select a state first"}</option>
                        {loginDistricts.map((district) => (
                          <option key={district} value={district}>
                            {district}
                          </option>
                        ))}
                      </select>
                      {errors.login?.district && (
                        <p className="mt-1 text-xs text-destructive">{errors.login.district.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="login.email" className="mb-1.5 block text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="login.email"
                      type="email"
                      placeholder="Optional"
                      {...register("login.email")}
                    />
                    {errors.login?.email && (
                      <p className="mt-1 text-xs text-destructive">{errors.login.email.message}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {isEdit && canLinkLogin && (
            <div>
              <label htmlFor="user_id" className="mb-1.5 block text-sm font-medium">
                Linked Login
              </label>
              {doctor?.user_id ? (
                <p className="text-sm text-muted-foreground">
                  Already linked to a staff login. Linking is one-way — contact backend support to
                  change it.
                </p>
              ) : (
                <>
                  <select
                    id="user_id"
                    className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                    {...register("user_id")}
                  >
                    <option value="">Not linked — select a doctor login</option>
                    {doctorLogins.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name} ({u.phone_number})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Restricts this login to only its own appointments, dashboard, and reports.
                  </p>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Add Doctor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

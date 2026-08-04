"use client";

import { useEffect } from "react";
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
import { ALL_USER_ROLES, ROLE_LABELS } from "@/src/lib/rbac/roles";
import type { UserRole } from "@/src/lib/auth/types";
import { doctorService } from "@/src/features/doctors/doctor";
import { INDIA_STATES, getDistricts } from "@/src/data/india-states-districts";
import {
  createUserSchema,
  editUserSchema,
  type CreateUserFormValues,
} from "./user";
import type { ApiUser, CreateUserPayload, UpdateUserPayload } from "./user";

const SELECT_CLASS =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present => edit mode, prefilled from this user. */
  user?: ApiUser | null;
  isSubmitting: boolean;
  onCreate: (payload: CreateUserPayload) => void;
  onUpdate: (id: string, changes: UpdateUserPayload) => void;
}

const EMPTY_VALUES: CreateUserFormValues = {
  full_name: "",
  email: "",
  phone_number: "",
  password: "",
  role: "reception",
  state: "",
  district: "",
  age: "",
  gender: "",
  address: "",
  doctor_id: "",
};

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  isSubmitting,
  onCreate,
  onUpdate,
}: UserFormDialogProps) {
  const isEdit = Boolean(user);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<CreateUserFormValues>({
    // Edit mode validates against editUserSchema (no password field) — cast
    // is safe since both schemas share the same field names/types minus password.
    resolver: zodResolver(
      isEdit ? editUserSchema : createUserSchema
    ) as unknown as Resolver<CreateUserFormValues>,
    defaultValues: EMPTY_VALUES,
  });

  const selectedRole = useWatch({ control, name: "role" });
  const selectedState = useWatch({ control, name: "state" });
  const districts = getDistricts(selectedState);

  // Only unlinked doctor profiles are worth offering — picking an already-linked
  // one would just 409. Only fetched for the create flow (POST /users is the
  // only endpoint that accepts doctor_id).
  const { data: unlinkedDoctors = [] } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => (await doctorService.list()).data.doctors,
    enabled: open && !isEdit && selectedRole === "doctor",
    select: (doctors) => doctors.filter((d) => !d.user_id),
  });

  useEffect(() => {
    if (!open) return;
    reset(
      user
        ? {
            full_name: user.full_name,
            email: user.email,
            phone_number: user.phone_number.replace(/\D/g, "").slice(-10),
            password: "",
            role: (ALL_USER_ROLES as string[]).includes(user.role)
              ? (user.role as UserRole)
              : "reception",
            state: user.state ?? "",
            district: user.district ?? "",
            age: user.age != null ? String(user.age) : "",
            gender: (user.gender as CreateUserFormValues["gender"]) ?? "",
            address: user.address ?? "",
            doctor_id: "",
          }
        : EMPTY_VALUES
    );
  }, [open, user, reset]);

  const onSubmit = handleSubmit((values) => {
    if (isEdit && user) {
      const changes: UpdateUserPayload = {};
      if (dirtyFields.full_name) changes.full_name = values.full_name;
      if (dirtyFields.email) changes.email = values.email;
      if (dirtyFields.phone_number) changes.phone_number = values.phone_number;
      if (dirtyFields.role) changes.role = values.role;
      if (dirtyFields.state) changes.state = values.state;
      if (dirtyFields.district) changes.district = values.district;
      if (dirtyFields.age) changes.age = values.age ? Number(values.age) : undefined;
      if (dirtyFields.gender) changes.gender = values.gender || undefined;
      if (dirtyFields.address) changes.address = values.address;
      onUpdate(user.id, changes);
      return;
    }
    const payload: CreateUserPayload = {
      full_name: values.full_name,
      phone_number: values.phone_number,
      password: values.password,
      role: values.role,
      state: values.state,
      district: values.district,
      email: values.email || undefined,
      age: values.age ? Number(values.age) : undefined,
      gender: values.gender || undefined,
      address: values.address || undefined,
      doctor_id: values.role === "doctor" ? values.doctor_id || undefined : undefined,
    };
    onCreate(payload);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit User" : "Add User"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this user's profile or role. Changing role signs them out immediately."
              : "Create a new staff account and assign their role."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="full_name" className="mb-1.5 block text-sm font-medium">
              Full Name
            </label>
            <Input id="full_name" placeholder="Jane Doe" {...register("full_name")} />
            {errors.full_name && (
              <p className="mt-1 text-xs text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="jane@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone_number" className="mb-1.5 block text-sm font-medium">
              Phone Number
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                +91
              </span>
              <Input
                id="phone_number"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile number"
                className="pl-11"
                {...register("phone_number", {
                  onChange: (event) => {
                    event.target.value = event.target.value.replace(/\D/g, "").slice(0, 10);
                  },
                })}
              />
            </div>
            {errors.phone_number && (
              <p className="mt-1 text-xs text-destructive">{errors.phone_number.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="state" className="mb-1.5 block text-sm font-medium">
                State
              </label>
              <select
                id="state"
                className={SELECT_CLASS}
                {...register("state", {
                  onChange: () => setValue("district", "", { shouldDirty: true }),
                })}
              >
                <option value="">Select state</option>
                {INDIA_STATES.map((state) => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))}
              </select>
              {errors.state && (
                <p className="mt-1 text-xs text-destructive">{errors.state.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="district" className="mb-1.5 block text-sm font-medium">
                District
              </label>
              <select
                id="district"
                className={SELECT_CLASS}
                disabled={!selectedState}
                {...register("district")}
              >
                <option value="">
                  {selectedState ? "Select district" : "Select a state first"}
                </option>
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
              {errors.district && (
                <p className="mt-1 text-xs text-destructive">{errors.district.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="age" className="mb-1.5 block text-sm font-medium">
                Age
              </label>
              <Input id="age" type="number" min={0} max={150} placeholder="Optional" {...register("age")} />
              {errors.age && <p className="mt-1 text-xs text-destructive">{errors.age.message}</p>}
            </div>
            <div>
              <label htmlFor="gender" className="mb-1.5 block text-sm font-medium">
                Gender
              </label>
              <select id="gender" className={SELECT_CLASS} {...register("gender")}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="address" className="mb-1.5 block text-sm font-medium">
              Address
            </label>
            <Input id="address" placeholder="Optional" {...register("address")} />
          </div>

          {!isEdit && (
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Temporary password"
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="role" className="mb-1.5 block text-sm font-medium">
              Role
            </label>
            <select
              id="role"
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
              {...register("role")}
            >
              {ALL_USER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="mt-1 text-xs text-destructive">{errors.role.message}</p>
            )}
          </div>

          {!isEdit && selectedRole === "doctor" && (
            <div>
              <label htmlFor="doctor_id" className="mb-1.5 block text-sm font-medium">
                Link to Doctor Profile
              </label>
              <select
                id="doctor_id"
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                {...register("doctor_id")}
              >
                <option value="">Skip for now — link later from Doctors</option>
                {unlinkedDoctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.full_name} — {doc.specialization}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                Scopes this login to only that doctor&rsquo;s own appointments, dashboard, and
                reports.
              </p>
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
              {isEdit ? "Save Changes" : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

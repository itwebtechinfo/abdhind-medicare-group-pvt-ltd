"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  createPatientSchema,
  editPatientSchema,
  type CreatePatientFormValues,
} from "./patient";
import type { ApiPatient, UpdatePatientPayload } from "./patient";

interface PatientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present => edit mode, prefilled from this patient. */
  patient?: ApiPatient | null;
  isSubmitting: boolean;
  onCreate: (values: CreatePatientFormValues) => void;
  onUpdate: (id: string, changes: UpdatePatientPayload) => void;
}

const EMPTY_VALUES: CreatePatientFormValues = {
  full_name: "",
  phone: "",
  age: "",
  gender: "",
  address: "",
};

export function PatientFormDialog({
  open,
  onOpenChange,
  patient,
  isSubmitting,
  onCreate,
  onUpdate,
}: PatientFormDialogProps) {
  const isEdit = Boolean(patient);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, dirtyFields },
  } = useForm<CreatePatientFormValues>({
    resolver: zodResolver(
      isEdit ? editPatientSchema : createPatientSchema
    ) as unknown as Resolver<CreatePatientFormValues>,
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      patient
        ? {
            full_name: patient.full_name,
            phone: patient.phone.replace(/\D/g, "").slice(-10),
            age: patient.age != null ? String(patient.age) : "",
            gender: (patient.gender as CreatePatientFormValues["gender"]) ?? "",
            address: patient.address ?? "",
          }
        : EMPTY_VALUES
    );
  }, [open, patient, reset]);

  const onSubmit = handleSubmit((values) => {
    if (isEdit && patient) {
      const changes: UpdatePatientPayload = {};
      if (dirtyFields.full_name) changes.full_name = values.full_name;
      if (dirtyFields.phone) changes.phone = values.phone;
      if (dirtyFields.age) changes.age = values.age === "" ? null : Number(values.age);
      if (dirtyFields.gender) changes.gender = values.gender || null;
      if (dirtyFields.address) changes.address = values.address;
      onUpdate(patient.id, changes);
      return;
    }
    onCreate(values);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Patient" : "Add Patient"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this patient's details."
              : "Register a new patient. A UHID is assigned automatically."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="full_name" className="mb-1.5 block text-sm font-medium">
              Full Name
            </label>
            <Input id="full_name" placeholder="Rahul Sharma" {...register("full_name")} />
            {errors.full_name && (
              <p className="mt-1 text-xs text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
              Phone Number
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                +91
              </span>
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile number"
                className="pl-11"
                {...register("phone", {
                  onChange: (event) => {
                    event.target.value = event.target.value.replace(/\D/g, "").slice(0, 10);
                  },
                })}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="age" className="mb-1.5 block text-sm font-medium">
                Age
              </label>
              <Input id="age" type="number" min={0} max={150} placeholder="Age" {...register("age")} />
              {errors.age && <p className="mt-1 text-xs text-destructive">{errors.age.message}</p>}
            </div>
            <div>
              <label htmlFor="gender" className="mb-1.5 block text-sm font-medium">
                Gender
              </label>
              <select
                id="gender"
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                {...register("gender")}
              >
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
              {isEdit ? "Save Changes" : "Register Patient"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

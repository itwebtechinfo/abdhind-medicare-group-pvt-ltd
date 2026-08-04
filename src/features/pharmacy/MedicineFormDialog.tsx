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
  EMPTY_MEDICINE_VALUES,
  createMedicineSchema,
  editMedicineSchema,
  type CreateMedicineFormValues,
} from "./medicine";
import type { ApiMedicine, UpdateMedicinePayload } from "./medicine";

interface MedicineFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicine?: ApiMedicine | null;
  isSubmitting: boolean;
  onCreate: (values: CreateMedicineFormValues) => void;
  onUpdate: (id: string, changes: UpdateMedicinePayload) => void;
}

export function MedicineFormDialog({
  open,
  onOpenChange,
  medicine,
  isSubmitting,
  onCreate,
  onUpdate,
}: MedicineFormDialogProps) {
  const isEdit = Boolean(medicine);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, dirtyFields },
  } = useForm<CreateMedicineFormValues>({
    resolver: zodResolver(
      isEdit ? editMedicineSchema : createMedicineSchema
    ) as unknown as Resolver<CreateMedicineFormValues>,
    defaultValues: EMPTY_MEDICINE_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      medicine
        ? { name: medicine.name, unit: medicine.unit, price: medicine.price }
        : EMPTY_MEDICINE_VALUES
    );
  }, [open, medicine, reset]);

  const onSubmit = handleSubmit((values) => {
    if (isEdit && medicine) {
      const changes: UpdateMedicinePayload = {};
      if (dirtyFields.name) changes.name = values.name;
      if (dirtyFields.unit) changes.unit = values.unit;
      if (dirtyFields.price) changes.price = values.price;
      onUpdate(medicine.id, changes);
      return;
    }
    onCreate(values);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Medicine" : "Add Medicine"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this medicine's catalog details." : "Add a medicine to the pharmacy catalog."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
              Name
            </label>
            <Input id="name" placeholder="Amoxicillin 500mg" {...register("name")} />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="unit" className="mb-1.5 block text-sm font-medium">
                Unit
              </label>
              <Input id="unit" placeholder="strip" {...register("unit")} />
              {errors.unit && <p className="mt-1 text-xs text-destructive">{errors.unit.message}</p>}
            </div>
            <div>
              <label htmlFor="price" className="mb-1.5 block text-sm font-medium">
                Price
              </label>
              <Input id="price" type="number" min={0} step="0.01" {...register("price")} />
              {errors.price && <p className="mt-1 text-xs text-destructive">{errors.price.message}</p>}
            </div>
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
              {isEdit ? "Save Changes" : "Add Medicine"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

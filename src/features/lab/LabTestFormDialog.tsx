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
  EMPTY_LAB_TEST_VALUES,
  createLabTestSchema,
  editLabTestSchema,
  type CreateLabTestFormValues,
} from "./lab-test";
import type { ApiLabTest, UpdateLabTestPayload } from "./lab-test";

interface LabTestFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labTest?: ApiLabTest | null;
  isSubmitting: boolean;
  onCreate: (values: CreateLabTestFormValues) => void;
  onUpdate: (id: string, changes: UpdateLabTestPayload) => void;
}

export function LabTestFormDialog({
  open,
  onOpenChange,
  labTest,
  isSubmitting,
  onCreate,
  onUpdate,
}: LabTestFormDialogProps) {
  const isEdit = Boolean(labTest);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, dirtyFields },
  } = useForm<CreateLabTestFormValues>({
    resolver: zodResolver(
      isEdit ? editLabTestSchema : createLabTestSchema
    ) as unknown as Resolver<CreateLabTestFormValues>,
    defaultValues: EMPTY_LAB_TEST_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    reset(labTest ? { name: labTest.name, price: labTest.price } : EMPTY_LAB_TEST_VALUES);
  }, [open, labTest, reset]);

  const onSubmit = handleSubmit((values) => {
    if (isEdit && labTest) {
      const changes: UpdateLabTestPayload = {};
      if (dirtyFields.name) changes.name = values.name;
      if (dirtyFields.price) changes.price = values.price;
      onUpdate(labTest.id, changes);
      return;
    }
    onCreate(values);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Lab Test" : "Add Lab Test"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this test's catalog details." : "Add a test to the lab catalog."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
              Test Name
            </label>
            <Input id="name" placeholder="CBC" {...register("name")} />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="price" className="mb-1.5 block text-sm font-medium">
              Price
            </label>
            <Input id="price" type="number" min={0} step="0.01" {...register("price")} />
            {errors.price && <p className="mt-1 text-xs text-destructive">{errors.price.message}</p>}
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
              {isEdit ? "Save Changes" : "Add Test"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

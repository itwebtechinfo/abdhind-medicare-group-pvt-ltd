"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { useAuth } from "@/src/hooks/useAuth";
import { usePermission } from "@/src/hooks/usePermission";
import { doctorService } from "@/src/features/doctors/doctor";
import { publicBookingService } from "@/src/features/public-booking/public-booking";
import {
  EMPTY_BOOK_APPOINTMENT_VALUES,
  bookAppointmentSchema,
  type BookAppointmentFormValues,
} from "./appointment";
import type { CreateAppointmentPayload } from "./appointment";

interface BookAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  onSubmit: (payload: CreateAppointmentPayload) => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export function BookAppointmentDialog({
  open,
  onOpenChange,
  isSubmitting,
  onSubmit,
}: BookAppointmentDialogProps) {
  const [date, setDate] = useState(today());
  const { user } = useAuth();
  const { role } = usePermission();
  const isPatient = role === "patient";
  // A doctor only ever books onto their own calendar, so there's no doctor
  // to pick — the dropdown is hidden entirely (see below) and doctor_id is
  // set silently from the logged-in user's own id.
  const isDoctor = role === "doctor";
  const [bookingFor, setBookingFor] = useState<"self" | "other">("self");

  const selfDefaults: BookAppointmentFormValues = {
    ...EMPTY_BOOK_APPOINTMENT_VALUES,
    patient_phone: user?.phone ?? "",
    patient_name: user?.displayName ?? "",
    patient_age: user?.age != null ? String(user.age) : "",
    patient_gender: (user?.gender as BookAppointmentFormValues["patient_gender"]) || "",
    patient_address: user?.address ?? "",
  };

  const doctorDefaults: BookAppointmentFormValues = {
    ...EMPTY_BOOK_APPOINTMENT_VALUES,
    doctor_id: user?.id ?? "",
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BookAppointmentFormValues>({
    resolver: zodResolver(bookAppointmentSchema),
    defaultValues: isPatient ? selfDefaults : isDoctor ? doctorDefaults : EMPTY_BOOK_APPOINTMENT_VALUES,
  });

  const doctorId = useWatch({ control, name: "doctor_id" });
  const selectedSlotId = useWatch({ control, name: "slot_id" });

  useEffect(() => {
    setValue("slot_id", "");
  }, [doctorId, date, setValue]);

  const selectBookingFor = (next: "self" | "other") => {
    setBookingFor(next);
    reset(next === "self" ? selfDefaults : EMPTY_BOOK_APPOINTMENT_VALUES);
  };

  // Neither patients nor doctors have "doctors:view" (staff-only), so
  // /api/v1/doctors would 403 for them. Patients get the list from the
  // unauthenticated public endpoint instead; doctors don't need a list at
  // all since they're not picking a doctor (see isDoctor above).
  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors", "book-appointment-dialog", isPatient],
    queryFn: async () =>
      isPatient
        ? (await publicBookingService.listDoctors()).data.doctors
        : (await doctorService.list()).data.doctors,
    enabled: open && !isDoctor,
  });

  // Doctors also lack "doctors:view", so their own slots must come from the
  // public endpoint too — doctorId here is silently set to their own user id
  // above, not picked from a dropdown.
  const usesPublicSlotsApi = isPatient || isDoctor;
  const { data: slots = [], isFetching: slotsLoading } = useQuery({
    queryKey: ["doctors", doctorId, "slots", date, usesPublicSlotsApi],
    queryFn: async () =>
      usesPublicSlotsApi
        ? (await publicBookingService.listSlots(doctorId, date)).data.slots
        : (await doctorService.listSlots(doctorId, date)).data.slots,
    enabled: open && Boolean(doctorId) && Boolean(date),
  });

  const submit = handleSubmit((values) => {
    onSubmit({
      patient_phone: values.patient_phone,
      patient_name: values.patient_name,
      patient_age: Number(values.patient_age),
      patient_gender: values.patient_gender,
      patient_address: values.patient_address,
      doctor_id: values.doctor_id,
      slot_id: values.slot_id,
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
          <DialogDescription>
            {isPatient
              ? "Book for yourself, or for a friend or family member."
              : "Looks up the patient by phone, or creates a new one if they don’t exist yet."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4" noValidate>
          {isPatient && (
            <div className="flex rounded-lg bg-muted p-1">
              <button
                type="button"
                onClick={() => selectBookingFor("self")}
                className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                  bookingFor === "self" ? "bg-background shadow-sm" : "text-muted-foreground"
                }`}
              >
                Myself
              </button>
              <button
                type="button"
                onClick={() => selectBookingFor("other")}
                className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                  bookingFor === "other" ? "bg-background shadow-sm" : "text-muted-foreground"
                }`}
              >
                Someone else
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="patient_phone" className="mb-1.5 block text-sm font-medium">
                Patient Phone
              </label>
              <Input
                id="patient_phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile number"
                disabled={isPatient && bookingFor === "self"}
                {...register("patient_phone", {
                  onChange: (event) => {
                    event.target.value = event.target.value.replace(/\D/g, "").slice(0, 10);
                  },
                })}
              />
              {errors.patient_phone && (
                <p className="mt-1 text-xs text-destructive">{errors.patient_phone.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="patient_name" className="mb-1.5 block text-sm font-medium">
                Patient Name
              </label>
              <Input id="patient_name" placeholder="Rahul Sharma" {...register("patient_name")} />
              {errors.patient_name && (
                <p className="mt-1 text-xs text-destructive">{errors.patient_name.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="patient_age" className="mb-1.5 block text-sm font-medium">
                Age
              </label>
              <Input id="patient_age" type="number" min={0} max={150} {...register("patient_age")} />
            </div>
            <div>
              <label htmlFor="patient_gender" className="mb-1.5 block text-sm font-medium">
                Gender
              </label>
              <select
                id="patient_gender"
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                {...register("patient_gender")}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="patient_address" className="mb-1.5 block text-sm font-medium">
              Address
            </label>
            <Input id="patient_address" placeholder="Optional" {...register("patient_address")} />
          </div>

          <div className={isDoctor ? "" : "grid grid-cols-2 gap-3"}>
            {!isDoctor && (
              <div>
                <label htmlFor="doctor_id" className="mb-1.5 block text-sm font-medium">
                  Doctor
                </label>
                <select
                  id="doctor_id"
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                  {...register("doctor_id")}
                >
                  <option value="">Select doctor</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.full_name} — {doc.specialization}
                    </option>
                  ))}
                </select>
                {errors.doctor_id && (
                  <p className="mt-1 text-xs text-destructive">{errors.doctor_id.message}</p>
                )}
              </div>
            )}
            <div>
              <label htmlFor="appt-date" className="mb-1.5 block text-sm font-medium">
                Date
              </label>
              <Input
                id="appt-date"
                type="date"
                min={today()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Available Slots</label>
            {!doctorId && <p className="text-sm text-muted-foreground">Select a doctor first.</p>}
            {doctorId && slotsLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading slots…
              </div>
            )}
            {doctorId && !slotsLoading && slots.length === 0 && (
              <p className="text-sm text-muted-foreground">No open slots for this date.</p>
            )}
            {doctorId && !slotsLoading && slots.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setValue("slot_id", slot.id, { shouldValidate: true })}
                    className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                      selectedSlotId === slot.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input hover:bg-accent"
                    }`}
                  >
                    {slot.start_time}
                  </button>
                ))}
              </div>
            )}
            {errors.slot_id && (
              <p className="mt-1 text-xs text-destructive">{errors.slot_id.message}</p>
            )}
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
              Book Appointment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

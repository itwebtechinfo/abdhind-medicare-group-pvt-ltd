"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { toast } from "@/src/lib/toast";
import type { NormalizedApiError } from "@/src/types/api";
import { doctorService } from "./doctor";
import type { ApiDoctor } from "./doctor";

interface LeaveCalendarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor: ApiDoctor | null;
}

export function LeaveCalendarDialog({ open, onOpenChange, doctor }: LeaveCalendarDialogProps) {
  const queryClient = useQueryClient();
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [slotDate, setSlotDate] = useState("");
  const [slotStart, setSlotStart] = useState("");
  const [slotEnd, setSlotEnd] = useState("");

  const queryKey = ["doctors", doctor?.id, "leaves"] as const;
  const slotsQueryKey = ["doctors", doctor?.id, "slots"] as const;

  const { data: leaves = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => (await doctorService.listLeaves(doctor?.id as string)).data.leaves,
    enabled: open && Boolean(doctor),
  });

  const { data: slots = [], isLoading: slotsLoading } = useQuery({
    queryKey: slotsQueryKey,
    queryFn: async () => (await doctorService.listSlots(doctor?.id as string)).data.slots,
    enabled: open && Boolean(doctor),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });
  const invalidateSlots = () => queryClient.invalidateQueries({ queryKey: slotsQueryKey });

  const createMutation = useMutation({
    mutationFn: () => doctorService.createLeave(doctor?.id as string, { date, reason }),
    onSuccess: (res) => {
      toast.success(res.msg);
      setDate("");
      setReason("");
      invalidate();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const deleteMutation = useMutation({
    mutationFn: (leaveId: string) => doctorService.deleteLeave(doctor?.id as string, leaveId),
    onSuccess: (res) => {
      toast.success(res.msg);
      invalidate();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const generateMutation = useMutation({
    mutationFn: () => doctorService.generateSlots(doctor?.id as string),
    onSuccess: (res) => {
      toast.success(res.msg, `${res.data.created} slots created`);
      invalidateSlots();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const createSlotMutation = useMutation({
    mutationFn: () =>
      doctorService.createSlot(doctor?.id as string, {
        date: slotDate,
        start_time: slotStart,
        end_time: slotEnd,
      }),
    onSuccess: (res) => {
      toast.success(res.msg);
      setSlotDate("");
      setSlotStart("");
      setSlotEnd("");
      invalidateSlots();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{doctor?.full_name}&rsquo;s Leave Calendar</DialogTitle>
          <DialogDescription>
            Adding a leave removes that doctor&rsquo;s open (unbooked) slots for the day.
          </DialogDescription>
        </DialogHeader>

        <h3 className="text-sm font-semibold">Leaves</h3>

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label htmlFor="leave-date" className="mb-1.5 block text-sm font-medium">
              Date
            </label>
            <Input id="leave-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex-1">
            <label htmlFor="leave-reason" className="mb-1.5 block text-sm font-medium">
              Reason
            </label>
            <Input
              id="leave-reason"
              placeholder="Personal leave"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <Button
            disabled={!date || !reason || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add
          </Button>
        </div>

        <div className="max-h-[35vh] space-y-1.5 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
          {!isLoading && leaves.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">No leaves scheduled.</p>
          )}
          {leaves.map((leave) => (
            <div
              key={leave.id}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium">{leave.date}</p>
                <p className="text-xs text-muted-foreground">{leave.reason}</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(leave.id)}
                aria-label="Delete leave"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <h3 className="text-sm font-semibold">Slots</h3>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label htmlFor="slot-date" className="mb-1.5 block text-sm font-medium">
              Date
            </label>
            <Input id="slot-date" type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} />
          </div>
          <div>
            <label htmlFor="slot-start" className="mb-1.5 block text-sm font-medium">
              Start
            </label>
            <Input
              id="slot-start"
              type="time"
              value={slotStart}
              onChange={(e) => setSlotStart(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="slot-end" className="mb-1.5 block text-sm font-medium">
              End
            </label>
            <Input id="slot-end" type="time" value={slotEnd} onChange={(e) => setSlotEnd(e.target.value)} />
          </div>
        </div>
        <Button
          className="w-full"
          disabled={!slotDate || !slotStart || !slotEnd || createSlotMutation.isPending}
          onClick={() => createSlotMutation.mutate()}
        >
          {createSlotMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Single Slot
        </Button>

        <div className="max-h-[35vh] space-y-1.5 overflow-y-auto">
          {slotsLoading && (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
          {!slotsLoading && slots.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">No open slots.</p>
          )}
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
            >
              <p className="font-medium">{slot.date}</p>
              <p className="text-xs text-muted-foreground">
                {slot.start_time} - {slot.end_time}
              </p>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          className="gap-2"
          disabled={generateMutation.isPending}
          onClick={() => generateMutation.mutate()}
        >
          {generateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Bulk Generate Slots
        </Button>
      </DialogContent>
    </Dialog>
  );
}

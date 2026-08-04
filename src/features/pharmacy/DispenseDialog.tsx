"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
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
import { toast } from "@/src/lib/toast";
import type { NormalizedApiError } from "@/src/types/api";
import { dispenseService, medicineService } from "./medicine";
import type { DispenseItemInput } from "./medicine";

interface DispenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string | null;
}

interface DraftLine {
  medicine_id: string;
  quantity: number;
}

export function DispenseDialog({ open, onOpenChange, appointmentId }: DispenseDialogProps) {
  const queryClient = useQueryClient();
  const [lines, setLines] = useState<DraftLine[]>([{ medicine_id: "", quantity: 1 }]);

  const { data: medicines = [] } = useQuery({
    queryKey: ["medicines"],
    queryFn: async () => (await medicineService.list()).data.medicines,
    enabled: open,
  });

  const dispenseQueryKey = ["appointments", appointmentId, "dispenses"] as const;

  const { data: dispenses = [] } = useQuery({
    queryKey: dispenseQueryKey,
    queryFn: async () => (await dispenseService.list(appointmentId as string)).data.dispenses,
    enabled: open && Boolean(appointmentId),
  });

  const dispenseMutation = useMutation({
    mutationFn: (items: DispenseItemInput[]) =>
      dispenseService.dispense(appointmentId as string, items),
    onSuccess: (res) => {
      toast.success(res.msg);
      setLines([{ medicine_id: "", quantity: 1 }]);
      queryClient.invalidateQueries({ queryKey: dispenseQueryKey });
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const validLines = lines.filter((l) => l.medicine_id && l.quantity > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Dispense Medicines</DialogTitle>
          <DialogDescription>Only available once the visit is marked Completed.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {lines.map((line, index) => (
            <div key={index} className="flex items-center gap-2">
              <select
                className="h-9 flex-1 rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none"
                value={line.medicine_id}
                onChange={(e) => {
                  const next = [...lines];
                  next[index] = { ...next[index], medicine_id: e.target.value };
                  setLines(next);
                }}
              >
                <option value="">Select medicine</option>
                {medicines.map((med) => (
                  <option key={med.id} value={med.id}>
                    {med.name} ({med.unit}) · ₹{med.price}
                  </option>
                ))}
              </select>
              <Input
                type="number"
                min={1}
                className="w-20"
                value={line.quantity}
                onChange={(e) => {
                  const next = [...lines];
                  next[index] = { ...next[index], quantity: Number(e.target.value) || 1 };
                  setLines(next);
                }}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setLines(lines.filter((_, i) => i !== index))}
                disabled={lines.length === 1}
                aria-label="Remove line"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setLines([...lines, { medicine_id: "", quantity: 1 }])}
          >
            <Plus className="h-4 w-4" />
            Add Line
          </Button>
        </div>

        {dispenses.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium">Previously Dispensed</p>
            <div className="max-h-[25vh] space-y-1.5 overflow-y-auto">
              {dispenses.map((d, i) => (
                <div key={i} className="rounded-lg border border-border px-3 py-2 text-xs">
                  {d.items.map((item) => (
                    <div key={item.medicine_id} className="flex justify-between">
                      <span>
                        {item.medicine_name} × {item.quantity}
                      </span>
                      <span>₹{(item.unit_price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <p className="mt-1 text-muted-foreground">by {d.dispensed_by.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            disabled={validLines.length === 0 || dispenseMutation.isPending}
            onClick={() =>
              dispenseMutation.mutate(
                validLines.map((l) => ({ medicine_id: l.medicine_id, quantity: l.quantity }))
              )
            }
          >
            {dispenseMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Dispense
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

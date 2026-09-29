"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Textarea } from "@/src/components/ui/textarea";
import { ConfirmDialog } from "@/src/components/ui/confirm-dialog";
import { usePermission } from "@/src/hooks/usePermission";
import { toast } from "@/src/lib/toast";
import { formatEpochMs } from "@/src/lib/format";
import { formatPrice } from "@/src/lib/products";
import type { NormalizedApiError } from "@/src/types/api";
import { NEXT_ORDER_STATUSES, orderService } from "./order";
import type { OrderStatus, ProductOrder } from "./order";

export const ORDERS_QUERY_KEY = ["product-orders"] as const;

export const ORDER_STATUS_VARIANT: Record<OrderStatus, "success" | "warning" | "secondary" | "destructive"> = {
  NEW: "warning",
  CONFIRMED: "secondary",
  DISPATCHED: "secondary",
  DELIVERED: "success",
  CANCELLED: "destructive",
};

const STATUS_ACTION_LABEL: Record<OrderStatus, string> = {
  NEW: "Mark New",
  CONFIRMED: "Confirm Order",
  DISPATCHED: "Mark Dispatched",
  DELIVERED: "Mark Delivered",
  CANCELLED: "Cancel Order",
};

/** Must match MAX_STAFF_NOTE_LENGTH in routes/orders.py. */
const MAX_STAFF_NOTE_LENGTH = 500;

interface OrderDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: ProductOrder;
}

/** Mount with `key={order.id}` so switching orders resets the note/draft state. */
export function OrderDetailDialog({ open, onOpenChange, order }: OrderDetailDialogProps) {
  const queryClient = useQueryClient();
  const { can } = usePermission();
  const canEdit = can("orders:edit");
  const [current, setCurrent] = useState<ProductOrder>(order);
  const [note, setNote] = useState(order.staff_note ?? "");
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);

  const noteTrimmed = note.trim();
  const noteChanged = noteTrimmed !== (current.staff_note ?? "");
  const noteTooLong = noteTrimmed.length > MAX_STAFF_NOTE_LENGTH;

  const onUpdated = (updated: ProductOrder, msg: string) => {
    toast.success(msg);
    setCurrent(updated);
    setNote(updated.staff_note ?? "");
    queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
  };

  const onError = (err: NormalizedApiError) => {
    toast.error(err.error, err.msg);
    // 409 = someone else moved it first; the list refetch shows the real state.
    queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
  };

  const noteMutation = useMutation({
    mutationFn: () => orderService.update(current.id, { staff_note: noteTrimmed || null }),
    onSuccess: (res) => onUpdated(res.data.order, res.msg),
    onError,
  });

  const statusMutation = useMutation({
    mutationFn: (status: OrderStatus) =>
      // The note (if edited) rides along so it's recorded on this history entry.
      orderService.update(current.id, noteChanged ? { status, staff_note: noteTrimmed || null } : { status }),
    onSuccess: (res) => {
      setPendingStatus(null);
      onUpdated(res.data.order, res.msg);
    },
    onError: (err: NormalizedApiError) => {
      setPendingStatus(null);
      onError(err);
    },
  });

  const nextStatuses = NEXT_ORDER_STATUSES[current.status];
  const busy = noteMutation.isPending || statusMutation.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="font-mono">{current.reference_code}</span>
              <Badge variant={ORDER_STATUS_VARIANT[current.status]}>{current.status}</Badge>
            </DialogTitle>
            <DialogDescription>
              Placed {current.created_at} via {current.source === "whatsapp" ? "WhatsApp" : current.source}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-border px-3 py-2">
              <p className="font-medium">{current.product_name}</p>
              <p className="text-xs text-muted-foreground">
                {current.quantity} × {formatPrice(current.unit_price)} = {formatPrice(current.total_price)}
                {current.mrp != null && current.mrp > current.unit_price && <> · MRP {formatPrice(current.mrp)}</>}
              </p>
            </div>

            <div className="rounded-lg border border-border px-3 py-2">
              <p className="font-medium">{current.customer_name || "Unknown customer"}</p>
              <p className="text-xs text-muted-foreground">{current.customer_phone}</p>
              <p className="mt-1 whitespace-pre-wrap text-xs">
                <span className="font-medium">Delivery address:</span> {current.delivery_address}
              </p>
            </div>

            <div>
              <label htmlFor="order-staff-note" className="mb-1.5 block text-xs font-medium">
                Staff note {canEdit && <span className="text-muted-foreground">(courier, tracking, reason…)</span>}
              </label>
              {canEdit ? (
                <>
                  <Textarea
                    id="order-staff-note"
                    value={note}
                    maxLength={MAX_STAFF_NOTE_LENGTH}
                    onChange={(e) => setNote(e.target.value)}
                    disabled={busy}
                    placeholder="Visible to staff only"
                  />
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {noteTrimmed.length}/{MAX_STAFF_NOTE_LENGTH}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!noteChanged || noteTooLong || busy}
                      onClick={() => noteMutation.mutate()}
                    >
                      {noteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Note
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">{current.staff_note || "—"}</p>
              )}
            </div>

            {canEdit && nextStatuses.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {nextStatuses.map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={status === "CANCELLED" ? "destructive" : "default"}
                    disabled={busy || noteTooLong}
                    onClick={() => setPendingStatus(status)}
                  >
                    {STATUS_ACTION_LABEL[status]}
                  </Button>
                ))}
              </div>
            )}

            <div>
              <p className="mb-1.5 text-xs font-medium">History</p>
              <ol className="max-h-40 space-y-1.5 overflow-y-auto">
                {[...current.status_history].reverse().map((entry, i) => (
                  <li key={`${entry.changed_at}-${i}`} className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {entry.from_status ? `${entry.from_status} → ${entry.to_status}` : entry.to_status}
                    </span>{" "}
                    · {entry.changed_by_name ?? entry.changed_by_role ?? "—"} · {formatEpochMs(entry.changed_at)}
                    {entry.note && <span className="block pl-2">“{entry.note}”</span>}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingStatus !== null}
        onOpenChange={(next) => {
          if (!next && !statusMutation.isPending) setPendingStatus(null);
        }}
        title={pendingStatus ? STATUS_ACTION_LABEL[pendingStatus] : ""}
        description={
          pendingStatus === "CANCELLED"
            ? `${current.reference_code} will be cancelled. This can't be undone — add the reason in the staff note first.`
            : `${current.reference_code} will move from ${current.status} to ${pendingStatus}. This can't be undone.`
        }
        confirmLabel={pendingStatus ? STATUS_ACTION_LABEL[pendingStatus] : "Confirm"}
        cancelLabel="Go Back"
        variant={pendingStatus === "CANCELLED" ? "destructive" : "default"}
        isLoading={statusMutation.isPending}
        onConfirm={() => pendingStatus && statusMutation.mutate(pendingStatus)}
      />
    </>
  );
}

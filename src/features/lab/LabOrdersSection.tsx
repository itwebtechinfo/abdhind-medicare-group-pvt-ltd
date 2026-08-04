"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FlaskConical, Loader2, Upload } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { usePermission } from "@/src/hooks/usePermission";
import { toast } from "@/src/lib/toast";
import { resolveUploadUrl } from "@/src/lib/upload";
import type { NormalizedApiError } from "@/src/types/api";
import { labOrderService, labTestService } from "./lab-test";
import type { LabOrderStatus } from "./lab-test";

const STATUS_VARIANT: Record<LabOrderStatus, "warning" | "success"> = {
  ORDERED: "warning",
  COMPLETED: "success",
};

export function LabOrdersSection({ appointmentId }: { appointmentId: string }) {
  const { can } = usePermission();
  const queryClient = useQueryClient();
  const [testId, setTestId] = useState("");
  const [recordingOrderId, setRecordingOrderId] = useState<string | null>(null);
  const [resultText, setResultText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ordersKey = ["appointments", appointmentId, "lab-orders"] as const;

  const { data: orders = [] } = useQuery({
    queryKey: ordersKey,
    queryFn: async () => (await labOrderService.listForAppointment(appointmentId)).data.lab_orders,
  });

  const { data: labTests = [] } = useQuery({
    queryKey: ["lab-tests"],
    queryFn: async () => (await labTestService.list()).data.lab_tests,
    enabled: can("appointments:manage"),
  });

  const invalidateOrders = () => queryClient.invalidateQueries({ queryKey: ordersKey });

  const orderMutation = useMutation({
    mutationFn: () => labOrderService.order(appointmentId, testId),
    onSuccess: (res) => {
      toast.success(res.msg);
      setTestId("");
      invalidateOrders();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const resultMutation = useMutation({
    mutationFn: ({ orderId, file }: { orderId: string; file?: File }) =>
      labOrderService.recordResult(orderId, resultText, file),
    onSuccess: (res) => {
      toast.success(res.msg);
      setRecordingOrderId(null);
      setResultText("");
      invalidateOrders();
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
        <FlaskConical className="h-4 w-4" />
        Lab Orders
      </p>

      <div className="space-y-2">
        {orders.map((order) => (
          <div key={order.id} className="rounded-lg border border-border px-3 py-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">{order.test_name}</span>
              <Badge variant={STATUS_VARIANT[order.status]}>{order.status}</Badge>
            </div>

            {order.status === "COMPLETED" && (
              <div className="mt-1 text-xs text-muted-foreground">
                <p>{order.result_text}</p>
                {order.result_file && (
                  <a
                    href={resolveUploadUrl(order.result_file)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline"
                  >
                    View attached file
                  </a>
                )}
              </div>
            )}

            {order.status === "ORDERED" && can("lab:manage") && (
              <div className="mt-2">
                {recordingOrderId === order.id ? (
                  <div className="space-y-2">
                    <Input
                      placeholder="Result text (e.g. WBC normal, RBC normal)"
                      value={resultText}
                      onChange={(e) => setResultText(e.target.value)}
                    />
                    <input ref={fileInputRef} type="file" className="text-xs" />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={!resultText.trim() || resultMutation.isPending}
                        onClick={() =>
                          resultMutation.mutate({
                            orderId: order.id,
                            file: fileInputRef.current?.files?.[0],
                          })
                        }
                      >
                        {resultMutation.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                        Save Result
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setRecordingOrderId(null);
                          setResultText("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => setRecordingOrderId(order.id)}
                  >
                    <Upload className="h-4 w-4" />
                    Record Result
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
        {orders.length === 0 && <p className="text-sm text-muted-foreground">No lab tests ordered yet.</p>}
      </div>

      {can("appointments:manage") && (
        <div className="mt-3 flex items-center gap-2">
          <select
            className="h-9 flex-1 rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none"
            value={testId}
            onChange={(e) => setTestId(e.target.value)}
          >
            <option value="">Order a test…</option>
            {labTests.map((test) => (
              <option key={test.id} value={test.id}>
                {test.name} · ₹{test.price}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            disabled={!testId || orderMutation.isPending}
            onClick={() => orderMutation.mutate()}
          >
            {orderMutation.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Order
          </Button>
        </div>
      )}
    </div>
  );
}

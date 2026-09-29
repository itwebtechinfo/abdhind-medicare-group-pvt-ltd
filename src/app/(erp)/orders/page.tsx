"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, ShoppingBag } from "lucide-react";
import { ErpPageShell } from "@/src/components/dashboard/ErpPageShell";
import { ErpDataTable } from "@/src/components/erp/ErpDataTable";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent } from "@/src/components/ui/card";
import type { DataTableRowAction } from "@/src/components/common/data-table/types";
import { formatPrice } from "@/src/lib/products";
import { ORDER_STATUSES, orderService } from "@/src/features/orders/order";
import type { OrderStatus, ProductOrder } from "@/src/features/orders/order";
import {
  ORDERS_QUERY_KEY,
  ORDER_STATUS_VARIANT,
  OrderDetailDialog,
} from "@/src/features/orders/OrderDetailDialog";

/** Statuses that still need staff action — surfaced as the headline count. */
const OPEN_STATUSES: OrderStatus[] = ["NEW", "CONFIRMED", "DISPATCHED"];

export default function ProductOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [viewing, setViewing] = useState<ProductOrder | null>(null);

  // Always fetch everything and filter client-side: the summary cards need
  // the full set, and bot orders are low-volume enough for one request.
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: async () => (await orderService.list()).data.orders,
  });

  const visibleOrders = useMemo(
    () => (statusFilter ? orders.filter((o) => o.status === statusFilter) : orders),
    [orders, statusFilter]
  );

  const counts = useMemo(() => {
    const byStatus = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0])) as Record<OrderStatus, number>;
    for (const order of orders) byStatus[order.status] = (byStatus[order.status] ?? 0) + 1;
    return {
      byStatus,
      open: OPEN_STATUSES.reduce((sum, s) => sum + byStatus[s], 0),
      deliveredValue: orders
        .filter((o) => o.status === "DELIVERED")
        .reduce((sum, o) => sum + o.total_price, 0),
    };
  }, [orders]);

  const rowActions = useMemo<DataTableRowAction<ProductOrder>[]>(
    () => [{ label: "View", icon: <Eye className="h-4 w-4" />, onClick: (row) => setViewing(row) }],
    []
  );

  return (
    <ErpPageShell
      title="Product Orders"
      description="Orders placed through the WhatsApp bot's MR Dental Product catalog — confirm, dispatch and track delivery."
      icon={ShoppingBag}
    >
      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground">New (needs action)</p>
            <p className="mt-1 text-2xl font-bold">{counts.byStatus.NEW}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Open orders</p>
            <p className="mt-1 text-2xl font-bold">{counts.open}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Delivered</p>
            <p className="mt-1 text-2xl font-bold">{counts.byStatus.DELIVERED}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground">Delivered value</p>
            <p className="mt-1 text-2xl font-bold">{formatPrice(counts.deliveredValue)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="order-status-filter" className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Status
          </label>
          <select
            id="order-status-filter"
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "")}
          >
            <option value="">All ({orders.length})</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s} ({counts.byStatus[s]})
              </option>
            ))}
          </select>
        </div>
      </div>

      <ErpDataTable
        data={visibleOrders}
        isLoading={isLoading}
        searchPlaceholder="Search by order ID, customer, phone, product or address…"
        emptyMessage="No product orders yet."
        rowActions={rowActions}
        columns={[
          {
            key: "reference_code",
            header: "Order ID",
            render: (r) => <span className="font-mono text-xs">{r.reference_code}</span>,
          },
          { key: "customer_name", header: "Customer", render: (r) => r.customer_name || "—" },
          { key: "customer_phone", header: "Phone", render: (r) => r.customer_phone },
          { key: "product_name", header: "Product", render: (r) => r.product_name },
          { key: "total_price", header: "Amount", render: (r) => formatPrice(r.total_price) },
          {
            key: "delivery_address",
            header: "Delivery Address",
            render: (r) => (
              <span className="line-clamp-2 max-w-[240px] text-xs" title={r.delivery_address}>
                {r.delivery_address}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (r) => <Badge variant={ORDER_STATUS_VARIANT[r.status]}>{r.status}</Badge>,
          },
          { key: "created_at", header: "Placed", render: (r) => r.created_at },
        ]}
      />

      {viewing && (
        <OrderDetailDialog
          key={viewing.id}
          open
          onOpenChange={(open) => !open && setViewing(null)}
          order={viewing}
        />
      )}
    </ErpPageShell>
  );
}

import { createElement } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge, type BadgeProps } from "@/src/components/ui/badge";

type StatusVariant = NonNullable<BadgeProps["variant"]>;

function readValue<TData>(row: TData, key: keyof TData | string): unknown {
  if (typeof key !== "string") return row[key];

  return key.split(".").reduce<unknown>((value, part) => {
    if (value && typeof value === "object" && part in value) {
      return (value as Record<string, unknown>)[part];
    }
    return undefined;
  }, row);
}

export function statusBadgeVariant(value: unknown): StatusVariant {
  const status = String(value ?? "").toLowerCase();
  if (["active", "confirmed", "completed", "paid", "available", "success"].includes(status)) {
    return "success";
  }
  if (["pending", "follow-up", "processing", "due", "warning"].includes(status)) {
    return "warning";
  }
  if (["cancelled", "failed", "inactive", "overdue", "error"].includes(status)) {
    return "destructive";
  }
  return "secondary";
}

export function statusBadgeColumn<TData>(
  key: keyof TData | string = "status",
  header = "Status"
): ColumnDef<TData, unknown> {
  return {
    id: String(key),
    accessorFn: (row) => readValue(row, key),
    header,
    cell: ({ getValue }) => {
      const value = getValue();
      return createElement(
        Badge,
        { variant: statusBadgeVariant(value), className: "capitalize" },
        String(value ?? "Unknown")
      );
    },
  };
}

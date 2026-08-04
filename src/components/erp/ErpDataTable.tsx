"use client";

import type { ColumnDef, VisibilityState } from "@tanstack/react-table";
import { memo, useMemo } from "react";
import { DataTable } from "@/src/components/common/data-table/DataTable";
import type { DataTableRowAction } from "@/src/components/common/data-table/types";

export type ErpTableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  /** Set false to pin this column so it can't be hidden via the Columns menu (default: hideable). */
  hideable?: boolean;
};

interface ErpDataTableProps<T> {
  data: T[];
  columns: ErpTableColumn<T>[];
  searchPlaceholder?: string;
  emptyMessage?: string;
  isLoading?: boolean;
  rowActions?: DataTableRowAction<T>[];
  /** Columns hidden by default (by column key) — still toggleable via the Columns menu. */
  initialColumnVisibility?: VisibilityState;
}

function ErpDataTableInner<T extends { id: string }>({
  data,
  columns,
  searchPlaceholder = "Search…",
  emptyMessage = "No records found.",
  isLoading = false,
  rowActions,
  initialColumnVisibility,
}: ErpDataTableProps<T>) {
  const tableColumns = useMemo<ColumnDef<T, unknown>[]>(
    () =>
      columns.map((column) => ({
        id: column.key,
        accessorFn: (row) => row[column.key as keyof T],
        header: column.header,
        cell: ({ row }) => column.render(row.original),
        enableHiding: column.hideable ?? true,
      })),
    [columns]
  );

  return (
    <DataTable
      data={data}
      columns={tableColumns}
      loading={isLoading}
      searchPlaceholder={searchPlaceholder}
      emptyMessage={emptyMessage}
      enableRowSelection={false}
      rowActions={rowActions}
      getRowId={(row) => row.id}
      initialColumnVisibility={initialColumnVisibility}
    />
  );
}

export const ErpDataTable = memo(ErpDataTableInner) as typeof ErpDataTableInner;

"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { memo, useMemo } from "react";
import { DataTable } from "@/src/components/common/data-table/DataTable";

export type ErpTableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
};

interface ErpDataTableProps<T> {
  data: T[];
  columns: ErpTableColumn<T>[];
  searchPlaceholder?: string;
  emptyMessage?: string;
  isLoading?: boolean;
}

function ErpDataTableInner<T extends { id: string }>({
  data,
  columns,
  searchPlaceholder = "Search…",
  emptyMessage = "No records found.",
  isLoading = false,
}: ErpDataTableProps<T>) {
  const tableColumns = useMemo<ColumnDef<T, unknown>[]>(
    () =>
      columns.map((column) => ({
        id: column.key,
        accessorFn: (row) => row[column.key as keyof T],
        header: column.header,
        cell: ({ row }) => column.render(row.original),
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
      getRowId={(row) => row.id}
    />
  );
}

export const ErpDataTable = memo(ErpDataTableInner) as typeof ErpDataTableInner;

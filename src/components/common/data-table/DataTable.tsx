"use client";

import {
  flexRender,
  type ColumnDef,
  type Header,
  type Row,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Inbox,
  MoreHorizontal,
  Search,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Input } from "@/src/components/ui/input";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { cn } from "@/src/lib/utils";
import { useDataTable } from "./useDataTable";
import type {
  DataTableBulkAction,
  DataTableFilterConfig,
  DataTableProps,
  DataTableRowAction,
} from "./types";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const EMPTY_FILTER_CONFIG: DataTableFilterConfig<never>[] = [];
const EMPTY_ROW_ACTIONS: DataTableRowAction<never>[] = [];
const EMPTY_BULK_ACTIONS: DataTableBulkAction<never>[] = [];

function DataTableCheckbox({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean | "indeterminate";
  disabled?: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = checked === "indeterminate";
  }, [checked]);

  return (
    <input
      ref={ref}
      type="checkbox"
      aria-label={label}
      checked={checked === true}
      disabled={disabled}
      onChange={(event) => onChange(event.target.checked)}
      className="h-4 w-4 rounded border-border text-primary accent-primary transition disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
}

function sortIcon<TData>(header: Header<TData, unknown>) {
  const sorted = header.column.getIsSorted();
  if (sorted === "asc") return <ArrowUp className="h-3.5 w-3.5" />;
  if (sorted === "desc") return <ArrowDown className="h-3.5 w-3.5" />;
  return <ArrowUpDown className="h-3.5 w-3.5 opacity-45" />;
}

function pageItems(currentPage: number, pageCount: number): (number | "dots")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);

  const pages = new Set([1, pageCount, currentPage - 1, currentPage, currentPage + 1]);
  return Array.from(pages)
    .filter((page) => page >= 1 && page <= pageCount)
    .sort((a, b) => a - b)
    .flatMap((page, index, ordered) =>
      index > 0 && page - ordered[index - 1] > 1 ? ["dots" as const, page] : [page]
    );
}

function filterLabel<TData>(filter: DataTableFilterConfig<TData>) {
  return filter.label || filter.key;
}

function csvEscape(value: unknown) {
  const text =
    value === null || value === undefined
      ? ""
      : value instanceof Date
        ? value.toISOString()
        : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function downloadCsv<TData>(
  filename: string,
  rows: Row<TData>[],
  columns: ReturnType<Row<TData>["getVisibleCells"]>[number]["column"][]
) {
  const headers = columns.map((column) =>
    csvEscape(typeof column.columnDef.header === "string" ? column.columnDef.header : column.id)
  );
  const body = rows.map((row) =>
    columns.map((column) => csvEscape(row.getValue(column.id))).join(",")
  );
  const blob = new Blob([[headers.join(","), ...body].join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function actionIsVisible<TData>(action: DataTableRowAction<TData>, row: TData) {
  return !action.hidden?.(row);
}

export function DataTable<TData>({
  columns,
  data,
  loading = false,
  totalCount,
  filters,
  filterConfig = EMPTY_FILTER_CONFIG as DataTableFilterConfig<TData>[],
  onFilterChange,
  onApplyFilters,
  onResetFilters,
  searchKeys,
  searchPlaceholder = "Search records...",
  serverSide = false,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  initialPageSize = pageSizeOptions[0] ?? 10,
  enableRowSelection = true,
  rowActions = EMPTY_ROW_ACTIONS as DataTableRowAction<TData>[],
  bulkActions = EMPTY_BULK_ACTIONS as DataTableBulkAction<TData>[],
  onExport,
  exportFileName = "data-table-export.csv",
  getRowId,
  emptyTitle = "No records found",
  emptyMessage = "Try adjusting your search or filters.",
  toolbar,
  className,
}: DataTableProps<TData>) {
  const tableColumns = useMemo<ColumnDef<TData, unknown>[]>(() => {
    const next: ColumnDef<TData, unknown>[] = [];

    if (enableRowSelection) {
      next.push({
        id: "select",
        enableHiding: false,
        enableSorting: false,
        header: ({ table }) => (
          <DataTableCheckbox
            label="Select visible rows"
            checked={
              table.getIsAllPageRowsSelected()
                ? true
                : table.getIsSomePageRowsSelected()
                  ? "indeterminate"
                  : false
            }
            onChange={(checked) => table.toggleAllPageRowsSelected(checked)}
          />
        ),
        cell: ({ row }) => (
          <DataTableCheckbox
            label="Select row"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={(checked) => row.toggleSelected(checked)}
          />
        ),
      });
    }

    next.push(...columns);

    if (rowActions.length) {
      next.push({
        id: "actions",
        enableHiding: false,
        enableSorting: false,
        header: "",
        cell: ({ row }) => {
          const actions = rowActions.filter((action) =>
            actionIsVisible(action, row.original)
          );
          if (!actions.length) return null;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open row actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {actions.map((action) => (
                  <DropdownMenuItem
                    key={action.label}
                    disabled={action.disabled?.(row.original)}
                    className={cn(action.destructive && "text-destructive focus:text-destructive")}
                    onClick={() => action.onClick(row.original)}
                  >
                    {action.icon}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      });
    }

    return next;
  }, [columns, enableRowSelection, rowActions]);

  const {
    table,
    draftFilters,
    setFilterValue,
    applyFilters,
    resetFilters,
    selectedCount,
    selectedRows,
    totalRows,
    clearSelection,
  } = useDataTable({
    columns: tableColumns,
    data,
    totalCount,
    filters,
    filterConfig,
    onFilterChange,
    onApplyFilters,
    onResetFilters,
    searchKeys,
    serverSide,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
    initialPageSize,
    enableRowSelection,
    getRowId,
  });

  const handleExport = useCallback(() => {
    const rows = selectedCount
      ? table.getSelectedRowModel().rows
      : table.getPrePaginationRowModel().rows;
    const exportColumns = table
      .getVisibleLeafColumns()
      .filter((column) => column.id !== "select" && column.id !== "actions");

    if (onExport) {
      onExport(rows.map((row) => row.original));
      return;
    }
    downloadCsv(exportFileName, rows, exportColumns);
  }, [exportFileName, onExport, selectedCount, table]);

  const pageCount = table.getPageCount();
  const { pageIndex, pageSize } = table.getState().pagination;
  const currentPage = pageIndex + 1;
  const rows = table.getRowModel().rows;
  const firstRecord = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const lastRecord = Math.min(totalRows, pageIndex * pageSize + rows.length);
  const hasFilters = Boolean(
    Object.values(draftFilters).some((value) => value !== undefined && value !== null && value !== "")
  );

  return (
    <Card className={cn("overflow-hidden rounded-lg border-border/80 shadow-sm", className)}>
      <CardContent className="p-0">
        <div className="space-y-3 border-b border-border bg-card px-4 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative min-w-0 flex-1 lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={String(draftFilters.search ?? "")}
                onChange={(event) => setFilterValue("search", event.target.value)}
                placeholder={searchPlaceholder}
                className="h-10 bg-background pl-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {toolbar}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleExport}
                disabled={loading || (!rows.length && selectedCount === 0)}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {filterConfig.length > 0 && (
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
              {filterConfig.map((filter) => {
                if (filter.type === "date-range") {
                  const fromKey = filter.fromKey ?? `${filter.key}From`;
                  const toKey = filter.toKey ?? `${filter.key}To`;

                  return (
                    <div key={filter.key} className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        aria-label={`${filterLabel(filter)} from`}
                        value={String(draftFilters[fromKey] ?? "")}
                        onChange={(event) => setFilterValue(fromKey, event.target.value)}
                        className="h-10"
                      />
                      <Input
                        type="date"
                        aria-label={`${filterLabel(filter)} to`}
                        value={String(draftFilters[toKey] ?? "")}
                        onChange={(event) => setFilterValue(toKey, event.target.value)}
                        className="h-10"
                      />
                    </div>
                  );
                }

                return (
                  <select
                    key={filter.key}
                    value={String(draftFilters[filter.key] ?? "")}
                    onChange={(event) => setFilterValue(filter.key, event.target.value)}
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm shadow-sm outline-none transition-colors focus:ring-2 focus:ring-ring"
                    aria-label={filterLabel(filter)}
                  >
                    <option value="">
                      {filter.placeholder ?? `All ${filterLabel(filter).toLowerCase()}`}
                    </option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                );
              })}

              <div className="flex gap-2">
                <Button type="button" size="sm" className="h-10 flex-1" onClick={applyFilters}>
                  Apply filters
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-10 flex-1 gap-2"
                  onClick={resetFilters}
                  disabled={!hasFilters}
                >
                  <X className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
          )}

          {selectedCount > 0 && (
            <div className="flex flex-col gap-2 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Badge variant="secondary">{selectedCount}</Badge>
                selected
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {bulkActions.map((action) => (
                  <Button
                    key={action.label}
                    type="button"
                    variant={action.destructive ? "destructive" : "outline"}
                    size="sm"
                    className="gap-2"
                    disabled={action.disabled}
                    onClick={() => action.onClick(selectedRows)}
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                ))}
                <Button type="button" variant="ghost" size="sm" onClick={clearSelection}>
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="max-h-[620px] overflow-auto">
          <Table className="min-w-[760px]">
            <TableHeader className="sticky top-0 z-10 bg-muted/95 backdrop-blur supports-[backdrop-filter]:bg-muted/80">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="whitespace-nowrap">
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sortIcon(header)}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: Math.min(pageSize, 8) }).map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {table.getVisibleLeafColumns().map((column) => (
                      <TableCell key={column.id}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : rows.length ? (
                rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={table.getVisibleLeafColumns().length} className="h-64">
                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                      <Inbox className="h-10 w-10 text-muted-foreground/60" />
                      <p className="text-sm font-semibold">{emptyTitle}</p>
                      <p className="max-w-sm text-sm text-muted-foreground">{emptyMessage}</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>
            Showing <span className="font-medium text-foreground">{firstRecord}</span>-
            <span className="font-medium text-foreground">{lastRecord}</span> of{" "}
            <span className="font-medium text-foreground">{totalRows}</span> records
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2">
              <span>Rows</span>
              <select
                value={pageSize}
                onChange={(event) => table.setPageSize(Number(event.target.value))}
                className="h-9 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
              </Button>
              {pageItems(currentPage, pageCount).map((page, index) =>
                page === "dots" ? (
                  <span key={`dots-${index}`} className="px-2">
                    ...
                  </span>
                ) : (
                  <Button
                    key={page}
                    type="button"
                    variant={page === currentPage ? "default" : "outline"}
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => table.setPageIndex(page - 1)}
                  >
                    {page}
                  </Button>
                )
              )}
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

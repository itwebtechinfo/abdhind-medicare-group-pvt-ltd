"use client";

import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type Row,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  DataTableFilterConfig,
  DataTableFilters,
  DataTableFilterValue,
} from "./types";

interface UseDataTableOptions<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  totalCount?: number;
  filters?: DataTableFilters;
  filterConfig?: DataTableFilterConfig<TData>[];
  onFilterChange?: (filters: DataTableFilters) => void;
  onApplyFilters?: (filters: DataTableFilters) => void;
  onResetFilters?: () => void;
  searchKeys?: (keyof TData | string)[];
  serverSide?: boolean;
  pagination?: PaginationState;
  onPaginationChange?: (updater: PaginationState | ((old: PaginationState) => PaginationState)) => void;
  sorting?: SortingState;
  onSortingChange?: (updater: SortingState | ((old: SortingState) => SortingState)) => void;
  initialPageSize?: number;
  enableRowSelection?: boolean;
  getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string;
  searchDebounceMs?: number;
}

const EMPTY_FILTER_CONFIG: DataTableFilterConfig<never>[] = [];

function isEmptyFilterValue(value: DataTableFilterValue): boolean {
  return value === undefined || value === null || value === "";
}

function compactFilters(filters: DataTableFilters): DataTableFilters {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => !isEmptyFilterValue(value))
  );
}

function filtersEqual(a: DataTableFilters, b: DataTableFilters): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  return (
    aKeys.length === bKeys.length &&
    aKeys.every((key) => Object.is(a[key], b[key]))
  );
}

function readValue<TData>(row: TData, key: keyof TData | string): unknown {
  if (typeof key !== "string") return row[key];

  return key.split(".").reduce<unknown>((value, part) => {
    if (value && typeof value === "object" && part in value) {
      return (value as Record<string, unknown>)[part];
    }
    return undefined;
  }, row);
}

function textValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") return Object.values(value).map(textValue).join(" ");
  return String(value);
}

function parseDate(value: unknown, endOfDay = false): number | null {
  if (!value) return null;
  const date = value instanceof Date ? new Date(value) : new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  if (endOfDay) date.setHours(23, 59, 59, 999);
  return date.getTime();
}

function rowMatchesFilters<TData>(
  row: TData,
  filters: DataTableFilters,
  filterConfig: DataTableFilterConfig<TData>[],
  searchKeys?: (keyof TData | string)[]
): boolean {
  const search = String(filters.search ?? "").trim().toLowerCase();
  if (search) {
    const values = searchKeys?.length
      ? searchKeys.map((key) => readValue(row, key))
      : Object.values(row as Record<string, unknown>);

    if (!values.some((value) => textValue(value).toLowerCase().includes(search))) {
      return false;
    }
  }

  return filterConfig.every((filter) => {
    if (filter.type === "date-range") {
      const fromKey = filter.fromKey ?? `${filter.key}From`;
      const toKey = filter.toKey ?? `${filter.key}To`;
      const from = parseDate(filters[fromKey]);
      const to = parseDate(filters[toKey], true);
      if (!from && !to) return true;

      const rowDate = parseDate(
        filter.accessor ? filter.accessor(row) : readValue(row, filter.key)
      );
      if (!rowDate) return false;
      if (from && rowDate < from) return false;
      if (to && rowDate > to) return false;
      return true;
    }

    const filterValue = filters[filter.key];
    if (isEmptyFilterValue(filterValue)) return true;

    const rowValue = filter.accessor ? filter.accessor(row) : readValue(row, filter.key);
    if (filter.match) return filter.match(filterValue, rowValue, row);

    return String(rowValue).toLowerCase() === String(filterValue).toLowerCase();
  });
}

export function useDataTable<TData>({
  columns,
  data,
  totalCount,
  filters,
  filterConfig = EMPTY_FILTER_CONFIG as DataTableFilterConfig<TData>[],
  onFilterChange,
  onApplyFilters,
  onResetFilters,
  searchKeys,
  serverSide = false,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  initialPageSize = 10,
  enableRowSelection = true,
  getRowId,
  searchDebounceMs = 350,
}: UseDataTableOptions<TData>) {
  const [internalFilters, setInternalFilters] = useState<DataTableFilters>(() =>
    compactFilters(filters ?? {})
  );
  const [draftFilters, setDraftFilters] = useState<DataTableFilters>(() =>
    compactFilters(filters ?? {})
  );
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [internalPagination, setInternalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  const activeFilters = useMemo(
    () => (filters ? compactFilters(filters) : internalFilters),
    [filters, internalFilters]
  );
  const sortingState = sorting ?? internalSorting;
  const paginationState = pagination ?? internalPagination;

  useEffect(() => {
    if (!filters) return;
    const next = compactFilters(filters);
    setDraftFilters((current) => (filtersEqual(current, next) ? current : next));
  }, [filters]);

  const resetPageIndex = useCallback(() => {
    if (paginationState.pageIndex === 0) return;

    const next = { ...paginationState, pageIndex: 0 };
    if (pagination) {
      onPaginationChange?.(next);
      return;
    }
    setInternalPagination(next);
  }, [onPaginationChange, pagination, paginationState]);

  const commitFilters = useCallback(
    (nextFilters: DataTableFilters) => {
      const next = compactFilters(nextFilters);
      if (!filters) {
        setInternalFilters((current) => (filtersEqual(current, next) ? current : next));
      }
      onFilterChange?.(next);
      resetPageIndex();
    },
    [filters, onFilterChange, resetPageIndex]
  );

  useEffect(() => {
    const draftSearch = String(draftFilters.search ?? "");
    const activeSearch = String(activeFilters.search ?? "");
    if (draftSearch === activeSearch) return;

    const timeout = window.setTimeout(() => {
      commitFilters({ ...activeFilters, search: draftSearch });
    }, searchDebounceMs);

    return () => window.clearTimeout(timeout);
  }, [activeFilters, commitFilters, draftFilters.search, searchDebounceMs]);

  const setFilterValue = useCallback((key: string, value: DataTableFilterValue) => {
    setDraftFilters((current) => compactFilters({ ...current, [key]: value }));
  }, []);

  const applyFilters = useCallback(() => {
    const next = compactFilters(draftFilters);
    commitFilters(next);
    onApplyFilters?.(next);
  }, [commitFilters, draftFilters, onApplyFilters]);

  const resetFilters = useCallback(() => {
    setDraftFilters((current) => (filtersEqual(current, {}) ? current : {}));
    if (!filters) {
      setInternalFilters((current) => (filtersEqual(current, {}) ? current : {}));
    }
    onFilterChange?.({});
    onResetFilters?.();
    resetPageIndex();
  }, [filters, onFilterChange, onResetFilters, resetPageIndex]);

  const filteredData = useMemo(() => {
    if (serverSide) return data;
    return data.filter((row) =>
      rowMatchesFilters(row, activeFilters, filterConfig, searchKeys)
    );
  }, [activeFilters, data, filterConfig, searchKeys, serverSide]);

  // TanStack Table intentionally returns table methods from this hook.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting: sortingState,
      pagination: paginationState,
      rowSelection,
    },
    pageCount: serverSide
      ? Math.ceil((totalCount ?? data.length) / paginationState.pageSize)
      : undefined,
    manualPagination: serverSide,
    manualSorting: serverSide,
    enableRowSelection,
    getRowId,
    onRowSelectionChange: setRowSelection,
    onSortingChange: onSortingChange ?? setInternalSorting,
    onPaginationChange: onPaginationChange ?? setInternalPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: serverSide ? undefined : getSortedRowModel(),
    getPaginationRowModel: serverSide ? undefined : getPaginationRowModel(),
  });

  const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);
  const totalRows = serverSide ? totalCount ?? data.length : filteredData.length;

  return {
    table,
    activeFilters,
    draftFilters,
    setFilterValue,
    applyFilters,
    resetFilters,
    selectedRows,
    selectedCount: selectedRows.length,
    totalRows,
    clearSelection: () => table.resetRowSelection(),
  };
}

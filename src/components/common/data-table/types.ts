import type {
  ColumnDef,
  OnChangeFn,
  PaginationState,
  Row,
  SortingState,
} from "@tanstack/react-table";
import type { ReactNode } from "react";

export type DataTableFilterValue = string | number | boolean | null | undefined;

export type DataTableFilters = Record<string, DataTableFilterValue>;

export interface DataTableFilterOption {
  label: string;
  value: string;
}

export type DataTableFilterConfig<TData> =
  | {
      type: "select" | "status";
      key: string;
      label: string;
      placeholder?: string;
      options: DataTableFilterOption[];
      accessor?: (row: TData) => unknown;
      match?: (filterValue: DataTableFilterValue, rowValue: unknown, row: TData) => boolean;
    }
  | {
      type: "date-range";
      key: string;
      label: string;
      fromKey?: string;
      toKey?: string;
      accessor?: (row: TData) => unknown;
    };

export interface DataTableRowAction<TData> {
  label: string;
  icon?: ReactNode;
  onClick: (row: TData) => void;
  disabled?: (row: TData) => boolean;
  hidden?: (row: TData) => boolean;
  destructive?: boolean;
}

export interface DataTableBulkAction<TData> {
  label: string;
  icon?: ReactNode;
  onClick: (rows: TData[]) => void;
  disabled?: boolean;
  destructive?: boolean;
}

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  loading?: boolean;
  totalCount?: number;
  filters?: DataTableFilters;
  filterConfig?: DataTableFilterConfig<TData>[];
  onFilterChange?: (filters: DataTableFilters) => void;
  onApplyFilters?: (filters: DataTableFilters) => void;
  onResetFilters?: () => void;
  searchKeys?: (keyof TData | string)[];
  searchPlaceholder?: string;
  serverSide?: boolean;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  pageSizeOptions?: number[];
  initialPageSize?: number;
  enableRowSelection?: boolean;
  rowActions?: DataTableRowAction<TData>[];
  bulkActions?: DataTableBulkAction<TData>[];
  onExport?: (rows: TData[]) => void;
  exportFileName?: string;
  getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string;
  emptyTitle?: string;
  emptyMessage?: string;
  toolbar?: ReactNode;
  className?: string;
}

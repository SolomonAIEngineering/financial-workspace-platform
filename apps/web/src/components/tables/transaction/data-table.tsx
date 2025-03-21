'use client';

import * as React from 'react';

import { BaseChartSchema, columnFilterSchema } from './schema';
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  Row,
  RowSelectionState,
  SortingState,
  Table as TTable,
  Updater,
  VisibilityState,
} from '@tanstack/react-table';
import type {
  DataTableFilterField,
  SheetField,
} from '@/components/data-table/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/registry/default/potion-ui/table';
import { arrSome, inDateRange } from '@/lib/table/filterfns';
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedMinMaxValues as getTTableFacetedMinMaxValues,
  getFacetedUniqueValues as getTTableFacetedUniqueValues,
  useReactTable,
} from '@tanstack/react-table';

import { Button } from '@/registry/default/potion-ui/button';
import { CreateTransactionModal } from '../../modals/create-transaction-modal';
import { DataTableFilterCommand } from '@/components/data-table/data-table-filter-command';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { DataTableProvider } from '@/components/data-table/data-table-provider';
import { DataTableSheetDetails } from '@/components/data-table/data-table-sheet/data-table-sheet-details';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { FilterSidebar } from './filter-sidebar';
import { RefreshButton } from '@/components/buttons/refresh-button';
import { TransactionSheetDetails } from './data-table-sheet-transaction';
import { cn } from '@/lib/utils';
import { searchParamsParser } from './search-params';
import { useHotKey } from '@/hooks/use-hot-key';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useQueryStates } from 'nuqs';

/**
 * Implements a specialized data table for financial transactions. This
 * component extends the generic DataTable pattern with transaction-specific
 * features, including custom filtering, sorting, and detail views.
 *
 * @file Data-table.tsx
 */

/**
 * Props interface for the DataTable component.
 *
 * @template TData - The type of data being displayed in the table
 * @template TValue - The type of values in the table cells
 * @template TMeta - The type of metadata associated with the table
 * @property columns - Column definitions for the table
 * @property data - The data to display in the table
 * @property defaultColumnFilters - Initial column filter state
 * @property defaultColumnSorting - Initial sorting state
 * @property defaultRowSelection - Initial row selection state
 * @property defaultColumnVisibility - Initial column visibility state
 * @property filterFields - Filter field definitions for the filter sidebar
 * @property sheetFields - Field definitions for the detail sheet
 * @property chartData - Data for charts in the table or details view
 * @property isFetching - Whether data is currently being fetched
 * @property isLoading - Whether the table is in a loading state
 * @property refetch - Function to refetch the data
 * @property getRowClassName - Function to determine row CSS classes
 * @property getFacetedUniqueValues - Function to get faceted unique values
 * @property getFacetedMinMaxValues - Function to get faceted min/max values
 * @property meta - Additional metadata for the table
 * @property pagination - Pagination information from the server
 * @property onPaginationChange - Callback to handle pagination changes
 */
export interface DataTableProps<
  TData,
  TValue,
  TMeta = Record<string, unknown>,
> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  defaultColumnFilters?: ColumnFiltersState;
  defaultColumnSorting?: SortingState;
  defaultRowSelection?: RowSelectionState;
  defaultColumnVisibility?: VisibilityState;
  // TODO: add sortingColumnFilters
  filterFields?: DataTableFilterField<TData>[];
  sheetFields?: SheetField<TData, TMeta>[];
  chartData?: BaseChartSchema[];
  isFetching?: boolean;
  isLoading?: boolean;
  refetch?: () => void;
  getRowClassName?: (row: Row<TData>) => string;
  getFacetedUniqueValues?: (
    table: TTable<TData>,
    columnId: string
  ) => Map<string, number>;
  getFacetedMinMaxValues?: (
    table: TTable<TData>,
    columnId: string
  ) => undefined | [number, number];
  meta?: TMeta;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onPaginationChange?: {
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  filterSidebarClassName?: string;
  filterHeaderClassName?: string;
  filterContentClassName?: string;
  filterTitle?: string;
}

/**
 * DataTable component for financial transactions.
 *
 * Provides a full-featured data table with:
 *
 * - Sorting and filtering
 * - Pagination
 * - Row selection
 * - URL-based state persistence
 * - Detail view panel
 * - Keyboard shortcuts
 * - Toolbar with actions
 *
 * The table uses the TransactionSheetDetails component to display detailed
 * information about a selected transaction.
 *
 * @example
 *   ```tsx
 *   <DataTable
 *     columns={columns}
 *     data={transactions}
 *     filterFields={filterFields}
 *     chartData={transactionChartData}
 *     isFetching={isFetching}
 *     refetch={refetch}
 *   />
 *   ```;
 *
 * @template TData - The type of data being displayed in the table
 * @template TValue - The type of values in the table cells
 * @template TMeta - The type of metadata associated with the table
 * @param props - The component props
 * @returns A React component that displays a data table for financial
 *   transactions
 */
export function DataTable<TData, TValue, TMeta = Record<string, unknown>>({
  columns,
  data,
  defaultColumnFilters = [],
  defaultColumnSorting = [],
  defaultRowSelection = {},
  defaultColumnVisibility = {},
  filterFields = [],
  sheetFields = [],
  chartData = [],
  isFetching,
  isLoading,
  refetch,
  getRowClassName,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  meta,
  pagination: serverPagination,
  onPaginationChange,
  filterSidebarClassName,
  filterHeaderClassName,
  filterContentClassName,
  filterTitle,
}: DataTableProps<TData, TValue, TMeta>) {
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>(defaultColumnFilters);
  const [sorting, setSorting] =
    React.useState<SortingState>(defaultColumnSorting);
  const [paginationState, setPaginationState] = React.useState<PaginationState>(
    {
      pageIndex: serverPagination?.page ? serverPagination.page - 1 : 0,
      pageSize: serverPagination?.limit || 10,
    }
  );
  const [rowSelection, setRowSelection] =
    React.useState<RowSelectionState>(defaultRowSelection);
  const [columnOrder, setColumnOrder] = useLocalStorage<string[]>(
    'data-table-column-order',
    []
  );
  const [columnVisibility, setColumnVisibility] =
    useLocalStorage<VisibilityState>(
      'data-table-visibility',
      defaultColumnVisibility
    );
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [_, setSearch] = useQueryStates(searchParamsParser);
  const topBarRef = React.useRef<HTMLDivElement>(null);
  const [topBarHeight, setTopBarHeight] = React.useState(0);

  const prevPaginationRef = React.useRef<{
    page?: number;
    pageSize?: number;
  }>({});

  React.useEffect(() => {
    const observer = new ResizeObserver(() => {
      const rect = topBarRef.current?.getBoundingClientRect();
      if (rect) {
        setTopBarHeight(rect.height);
      }
    });

    const topBar = topBarRef.current;
    if (!topBar) return;

    observer.observe(topBar);
    return () => observer.unobserve(topBar);
  }, [topBarRef]);

  React.useEffect(() => {
    if (serverPagination) {
      setPaginationState({
        pageIndex: serverPagination.page - 1,
        pageSize: serverPagination.limit,
      });
    }
  }, [serverPagination]);

  const handlePaginationChange = React.useCallback(
    (updater: Updater<PaginationState>) => {
      setPaginationState((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;

        prevPaginationRef.current = {
          page: next.pageIndex + 1,
          pageSize: next.pageSize,
        };

        return next;
      });
    },
    []
  );

  React.useEffect(() => {
    if (
      !prevPaginationRef.current.page ||
      !prevPaginationRef.current.pageSize
    ) {
      return;
    }

    const newPage = prevPaginationRef.current.page;
    const newPageSize = prevPaginationRef.current.pageSize;

    if (onPaginationChange) {
      if (newPage !== serverPagination?.page) {
        onPaginationChange.onPageChange(newPage);
      }

      if (newPageSize !== serverPagination?.limit) {
        onPaginationChange.onPageSizeChange(newPageSize);
      }
    }
  }, [paginationState, onPaginationChange, serverPagination]);

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      sorting,
      columnVisibility,
      pagination: paginationState,
      rowSelection,
      columnOrder,
    },
    enableRowSelection: true,
    columnResizeMode: 'onChange',
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: handlePaginationChange,
    onColumnOrderChange: setColumnOrder,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedMinMaxValues: getTTableFacetedMinMaxValues(),
    getFacetedUniqueValues: getTTableFacetedUniqueValues(),
    filterFns: { inDateRange, arrSome },
    meta: { getRowClassName },
  });

  React.useEffect(() => {
    const columnFiltersWithNullable = filterFields.map((field) => {
      const filterValue = columnFilters.find(
        (filter) => filter.id === field.value
      );
      if (!filterValue) return { id: field.value, value: null };
      return { id: field.value, value: filterValue.value };
    });

    const search = columnFiltersWithNullable.reduce(
      (prev, curr) => {
        prev[curr.id as string] = curr.value;
        return prev;
      },
      {} as Record<string, unknown>
    );

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    setSearch(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnFilters]);

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    setSearch({ sort: sorting?.[0] || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorting]);

  const selectedRow = React.useMemo(() => {
    if ((isLoading || isFetching) && data.length === 0) return;
    const selectedRowKey = Object.keys(rowSelection)?.[0];
    return table
      .getCoreRowModel()
      .flatRows.find((row) => row.id === selectedRowKey);
  }, [rowSelection, table, isLoading, isFetching, data]);

  React.useEffect(() => {
    if (isLoading || isFetching) return;
    if (Object.keys(rowSelection)?.length && !selectedRow) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      setSearch({ uuid: null });
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      setRowSelection({});
    } else {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      setSearch({ uuid: Object.keys(rowSelection)?.[0] || null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection, selectedRow, isLoading, isFetching]);

  const columnSizeVars = React.useMemo(() => {
    const headers = table.getFlatHeaders();
    const colSizes: { [key: string]: string } = {};
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]!;
      // REMINDER: replace "." with "-" to avoid invalid CSS variable name (e.g. "timing.dns" -> "timing-dns")
      colSizes[`--header-${header.id.replace('.', '-')}-size`] =
        `${header.getSize()}px`;
      colSizes[`--col-${header.column.id.replace('.', '-')}-size`] =
        `${header.column.getSize()}px`;
    }
    return colSizes;
  }, [
    table.getState().columnSizingInfo,
    table.getState().columnSizing,
    table.getState().columnVisibility,
  ]);

  useHotKey(() => {
    setColumnOrder([]);
    setColumnVisibility(defaultColumnVisibility);
  }, 'u');

  return (
    <DataTableProvider
      table={table}
      columns={columns}
      filterFields={filterFields}
      columnFilters={columnFilters}
      sorting={sorting}
      pagination={paginationState}
      rowSelection={rowSelection}
      columnOrder={columnOrder}
      columnVisibility={columnVisibility}
      enableColumnOrdering={true}
      isLoading={isFetching || isLoading}
      getFacetedUniqueValues={getFacetedUniqueValues}
      getFacetedMinMaxValues={getFacetedMinMaxValues}
    >
      <div
        className="flex h-full min-h-screen w-full flex-col sm:flex-row"
        style={
          {
            '--top-bar-height': `${topBarHeight}px`,
            ...columnSizeVars,
          } as React.CSSProperties
        }
      >
        <FilterSidebar
          className={filterSidebarClassName}
          headerClassName={filterHeaderClassName}
          contentClassName={filterContentClassName}
          title={filterTitle}
        />
        <div
          className={cn(
            'flex max-w-full flex-1 flex-col border-gray-300 md:p-[2%]',
            'group-data-[expanded=true]/controls:sm:max-w-[calc(100vw_-_208px)] group-data-[expanded=true]/controls:md:max-w-[calc(100vw_-_288px)]'
          )}
        >
          <div
            ref={topBarRef}
            className={cn(
              'flex flex-col gap-4 bg-background p-2',
              'sticky top-0 z-10 pb-4'
            )}
          >
            <DataTableFilterCommand schema={columnFilterSchema} />
            <DataTableToolbar
              renderActions={() => [
                <Button
                  key="create"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mr-2 flex items-center gap-1"
                >
                  <PlusCircle className="h-4 w-4" />
                  Create Transaction
                </Button>,
                refetch && <RefreshButton key="refresh" onClick={refetch} />,
              ]}
            />
          </div>
          <div className="relative z-0">
            <div className="absolute top-1/2 -left-8 z-20 -translate-y-1/2">
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-100 focus:outline-none"
                onClick={() => {
                  const tableContainer = document.querySelector(
                    '[class*="max-h-[calc(100vh_-_var(--top-bar-height))]"]'
                  );
                  if (tableContainer) {
                    tableContainer.scrollLeft -= 200;
                  }
                }}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>

            <div className="absolute top-1/2 right-0 z-20 -translate-y-1/2">
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-100 focus:outline-none"
                onClick={() => {
                  const tableContainer = document.querySelector(
                    '[class*="max-h-[calc(100vh_-_var(--top-bar-height))]"]'
                  );
                  if (tableContainer) {
                    tableContainer.scrollLeft += 200;
                  }
                }}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <Table
              className="border-separate border-spacing-x-0 border-spacing-y-2"
              containerClassName="max-h-[calc(100vh_-_var(--top-bar-height))] overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              <TableHeader className={cn('sticky top-0 z-20 bg-background')}>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className={cn('bg-muted/50 hover:bg-muted/50')}
                  >
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          className={cn(
                            'relative truncate select-none [&>.cursor-col-resize]:last:opacity-0',
                            header.column.columnDef.meta?.headerClassName
                          )}
                          aria-sort={
                            header.column.getIsSorted() === 'asc'
                              ? 'ascending'
                              : header.column.getIsSorted() === 'desc'
                                ? 'descending'
                                : 'none'
                          }
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          {header.column.getCanResize() && (
                            <div
                              onDoubleClick={() => header.column.resetSize()}
                              onMouseDown={header.getResizeHandler()}
                              onTouchStart={header.getResizeHandler()}
                              className={cn(
                                'user-select-none absolute top-0 -right-2 z-10 flex h-full w-4 cursor-col-resize touch-none justify-center'
                              )}
                            />
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody
                id="content"
                tabIndex={-1}
                className="transition-colors"
                style={{
                  scrollMarginTop: 'calc(var(--top-bar-height) + 40px)',
                }}
              >
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      id={row.id}
                      tabIndex={0}
                      data-state={row.getIsSelected() && 'selected'}
                      onClick={() => row.toggleSelected()}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          row.toggleSelected();
                        }
                      }}
                      className={cn(
                        'transition-colors',
                        'focus-visible:bg-muted/50',
                        table.options.meta?.getRowClassName?.(row)
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            'truncate',
                            'py-4',
                            cell.column.columnDef.meta?.cellClassName
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination />
        </div>
      </div>

      {/* Transaction details sheet */}
      <DataTableSheetDetails
        title="Transaction Details"
        titleClassName="font-medium"
      >
        <TransactionSheetDetails
          onDeleteSuccess={refetch}
          onCreateSuccess={refetch}
          onUpdateSuccess={refetch}
        />
      </DataTableSheetDetails>

      {/* Create Transaction Modal */}
      <CreateTransactionModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={refetch}
      />
    </DataTableProvider>
  );
}

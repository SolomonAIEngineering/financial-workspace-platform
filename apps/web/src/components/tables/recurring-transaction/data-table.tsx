'use client';

import * as React from 'react';

import { BaseChartSchema, recurringTransactionFilterSchema } from './schema';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

import { DataTableFilterCommand } from '@/components/data-table/data-table-filter-command';
import { DataTableFilterControls } from '@/components/data-table/data-table-filter-controls';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { DataTableProvider } from '@/components/data-table/data-table-provider';
import { DataTableResetButton } from '@/components/data-table/data-table-reset-button';
import { DataTableSheetDetails } from '@/components/data-table/data-table-sheet/data-table-sheet-details';
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar';
import { RecurringTransactionSheetDetails } from './recurring-transaction-sheet-details';
import { cn } from '@/lib/utils';
import { searchParamsParser } from './search-params';
import { useHotKey } from '@/hooks/use-hot-key';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useQueryStates } from 'nuqs';

/**
 * Implements a specialized data table for recurring transactions. This
 * component extends the generic DataTable pattern with recurring
 * transaction-specific features, including custom filtering, sorting, and
 * detail views.
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
 * @property onPaginationChange - Callback for pagination changes
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
}

/**
 * DataTable component for recurring transactions.
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
 * The table uses the RecurringTransactionSheetDetails component to display
 * detailed information about a selected recurring transaction.
 *
 * @example
 *   ```tsx
 *   <DataTable
 *     columns={columns}
 *     data={recurringTransactions}
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
 * @returns A React component that displays a data table for recurring
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
  pagination,
  onPaginationChange,
}: DataTableProps<TData, TValue, TMeta>) {
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>(defaultColumnFilters);
  const [sorting, setSorting] =
    React.useState<SortingState>(defaultColumnSorting);
  const [rowSelection, setRowSelection] =
    React.useState<RowSelectionState>(defaultRowSelection);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(defaultColumnVisibility);
  const [paginationState, setPaginationState] = React.useState<PaginationState>(
    {
      pageIndex: pagination?.page ? pagination.page - 1 : 0,
      pageSize: pagination?.limit || 10,
    }
  );
  const [columnOrder, setColumnOrder] = useLocalStorage<string[]>(
    'recurring-data-table-column-order',
    []
  );
  const topBarRef = React.useRef<HTMLDivElement>(null);
  const [topBarHeight, setTopBarHeight] = React.useState(0);
  const [showLeftScroll, setShowLeftScroll] = React.useState(false);
  const [showRightScroll, setShowRightScroll] = React.useState(true);
  const tableRef = React.useRef<HTMLDivElement>(null);

  const prevPaginationRef = React.useRef<{
    page?: number;
    pageSize?: number;
  }>({});

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
      if (newPage !== pagination?.page) {
        onPaginationChange.onPageChange(newPage);
      }

      if (newPageSize !== pagination?.limit) {
        onPaginationChange.onPageSizeChange(newPageSize);
      }
    }
  }, [paginationState, onPaginationChange, pagination]);

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
    if (pagination) {
      setPaginationState({
        pageIndex: pagination.page - 1,
        pageSize: pagination.limit,
      });
    }
  }, [pagination]);

  // Check scroll position to show/hide arrows
  const checkScrollPosition = React.useCallback(() => {
    if (tableRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tableRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 5); // 5px buffer
    }
  }, []);

  // Add scroll event listener to the table container
  React.useEffect(() => {
    const tableContainer = tableRef.current;
    if (tableContainer) {
      tableContainer.addEventListener('scroll', checkScrollPosition);
      // Initial check
      checkScrollPosition();

      // Check again when window resizes
      window.addEventListener('resize', checkScrollPosition);

      return () => {
        tableContainer.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
  }, [checkScrollPosition]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getTTableFacetedUniqueValues(),
    getFacetedMinMaxValues: getTTableFacetedMinMaxValues(),
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange,
    onColumnOrderChange: setColumnOrder,
    state: {
      columnFilters,
      sorting,
      rowSelection,
      columnVisibility,
      pagination: paginationState,
      columnOrder,
    },
    enableRowSelection: true,
    enableMultiRowSelection: false,
    columnResizeMode: 'onChange',
    meta: {
      getRowClassName,
      ...meta,
    } as any,
    filterFns: { inDateRange, arrSome },
  });

  // Subscribe to the query params
  const [searchParams, setSearchParams] = useQueryStates(searchParamsParser, {
    shallow: true,
  });

  // reset columns, filters and sorting
  const resetColumns = React.useCallback(async () => {
    setColumnFilters(defaultColumnFilters);
    setColumnVisibility(defaultColumnVisibility);
    setSorting(defaultColumnSorting);
    setPaginationState({
      pageIndex: 0,
      pageSize: 10,
    });
    if (searchParams) {
      await setSearchParams({}, { shallow: false });
    }
  }, [
    setSearchParams,
    searchParams,
    defaultColumnFilters,
    defaultColumnVisibility,
    defaultColumnSorting,
  ]);

  // Keyboard shortcuts
  useHotKey(() => {
    if (refetch) {
      refetch();
    }
  }, 'Meta+R');

  useHotKey(() => {
    setColumnOrder([]);
    setColumnVisibility(defaultColumnVisibility);
  }, 'u');

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
        <div
          className={cn(
            'h-full w-full flex-col p-[1%] sm:sticky sm:top-0 sm:max-h-screen sm:min-h-screen sm:max-w-52 sm:min-w-52 sm:self-start md:max-w-100 md:min-w-90',
            'group-data-[expanded=false]/controls:hidden',
            'hidden sm:flex'
          )}
        >
          <div className="rounded-t-lg border-b border-gray-200 bg-background md:sticky md:top-0 dark:border-gray-800">
            <div className="flex h-[46px] items-center justify-between gap-3 px-4">
              <p className="font-medium text-foreground">Filters</p>
              <div>
                {table.getState().columnFilters.length > 0 ? (
                  <DataTableResetButton />
                ) : null}
              </div>
            </div>
          </div>
          <div
            className="no-scrollbar flex-1 overflow-y-auto p-3"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <style jsx global>{`
              .no-scrollbar::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <div className="space-y-6">
              <div>
                <h3 className="mb-3 text-sm font-medium">Status & Type</h3>
                <DataTableFilterControls />
              </div>
              <div>
                <h3 className="mb-3 text-sm font-medium">
                  Amount & Date Ranges
                </h3>
                <div className="space-y-2">
                  {/* Ranges will appear here based on type */}
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4 text-xs text-muted-foreground">
                Showing {table.getFilteredRowModel().rows.length} of{' '}
                {table.getCoreRowModel().rows.length} recurring transactions
              </div>
            </div>
          </div>
        </div>

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
            <DataTableFilterCommand schema={recurringTransactionFilterSchema} />
            <DataTableToolbar
              renderActions={() => [
                refetch && (
                  <button
                    key="refresh"
                    onClick={refetch}
                    className="rounded border p-1.5 text-sm hover:bg-muted"
                  >
                    Refresh
                  </button>
                ),
              ]}
            />
            {chartData.length > 0 && <div className="-mb-2" />}
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

            {showLeftScroll && (
              <div className="absolute top-1/2 left-1 z-20 -translate-y-1/2">
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 shadow-md transition-all duration-200 hover:bg-white focus:outline-none"
                  onClick={() => {
                    if (tableRef.current) {
                      tableRef.current.scrollLeft -= 200;
                    }
                  }}
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-600" />
                </button>
              </div>
            )}

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

            {showRightScroll && (
              <div className="absolute top-1/2 right-1 z-20 -translate-y-1/2">
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 shadow-md transition-all duration-200 hover:bg-white focus:outline-none"
                  onClick={() => {
                    if (tableRef.current) {
                      tableRef.current.scrollLeft += 200;
                    }
                  }}
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-6 w-6 text-gray-600" />
                </button>
              </div>
            )}

            <Table
              className="border-separate border-spacing-x-0 border-spacing-y-2"
              containerClassName="max-h-[calc(100vh_-_var(--top-bar-height))] overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              ref={tableRef as React.RefObject<HTMLTableElement>}
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
                className="transition-colors focus-visible:outline"
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
                        'focus-visible:bg-muted/50 focus-visible:outline data-[state=selected]:outline',
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
      <DataTableSheetDetails
        title="Recurring Transaction Details"
        titleClassName="font-medium"
      >
        <RecurringTransactionSheetDetails />
      </DataTableSheetDetails>
    </DataTableProvider>
  );
}

"use client";

import * as React from "react";

import { BaseChartSchema, columnFilterSchema } from "./schema";
import type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  Row,
  RowSelectionState,
  SortingState,
  Table as TTable,
  VisibilityState,
} from "@tanstack/react-table";
import type { DataTableFilterField, SheetField } from "@/components/data-table/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/default/potion-ui/table";
import { arrSome, inDateRange } from "@/lib/table/filterfns";
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
} from "@tanstack/react-table";

import { DataTableFilterCommand } from "@/components/data-table/data-table-filter-command";
import { DataTableFilterControls } from "@/components/data-table/data-table-filter-controls";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableProvider } from "@/components/data-table/data-table-provider";
import { DataTableResetButton } from "@/components/data-table/data-table-reset-button";
import { DataTableSheetDetails } from "@/components/data-table/data-table-sheet/data-table-sheet-details";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { RefreshButton } from "../infinite/_components/refresh-button";
import { TimelineChart } from "../infinite/timeline-chart";
import { TransactionSheetDetails } from "./data-table-sheet-transaction";
import { cn } from "@/lib/utils";
import { searchParamsParser } from "./search-params";
import { useHotKey } from "@/hooks/use-hot-key";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useQueryStates } from "nuqs";

export interface DataTableProps<TData, TValue, TMeta = Record<string, unknown>> {
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
    columnId: string,
  ) => Map<string, number>;
  getFacetedMinMaxValues?: (
    table: TTable<TData>,
    columnId: string,
  ) => undefined | [number, number];
  meta?: TMeta;
}

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
}: DataTableProps<TData, TValue, TMeta>) {
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>(defaultColumnFilters);
  const [sorting, setSorting] = React.useState<SortingState>(defaultColumnSorting);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(defaultRowSelection);
  const [columnOrder, setColumnOrder] = useLocalStorage<string[]>(
    "data-table-column-order",
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    useLocalStorage<VisibilityState>(
      "data-table-visibility",
      defaultColumnVisibility,
    );
  const [_, setSearch] = useQueryStates(searchParamsParser);
  const topBarRef = React.useRef<HTMLDivElement>(null);
  const [topBarHeight, setTopBarHeight] = React.useState(0);

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

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      sorting,
      columnVisibility,
      pagination,
      rowSelection,
      columnOrder,
    },
    enableRowSelection: true,
    columnResizeMode: "onChange",
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
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
        (filter) => filter.id === field.value,
      );
      if (!filterValue) return { id: field.value, value: null };
      return { id: field.value, value: filterValue.value };
    });

    const search = columnFiltersWithNullable.reduce(
      (prev, curr) => {
        prev[curr.id as string] = curr.value;
        return prev;
      },
      {} as Record<string, unknown>,
    );

    setSearch(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnFilters]);

  React.useEffect(() => {
    setSearch({ sort: sorting?.[0] || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorting]);

  const selectedRow = React.useMemo(() => {
    if ((isLoading || isFetching) && !data.length) return;
    const selectedRowKey = Object.keys(rowSelection)?.[0];
    return table
      .getCoreRowModel()
      .flatRows.find((row) => row.id === selectedRowKey);
  }, [rowSelection, table, isLoading, isFetching, data]);

  React.useEffect(() => {
    if (isLoading || isFetching) return;
    if (Object.keys(rowSelection)?.length && !selectedRow) {
      setSearch({ uuid: null });
      setRowSelection({});
    } else {
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
      colSizes[`--header-${header.id.replace(".", "-")}-size`] =
        `${header.getSize()}px`;
      colSizes[`--col-${header.column.id.replace(".", "-")}-size`] =
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
  }, "u");

  return (
    <DataTableProvider
      table={table}
      columns={columns}
      filterFields={filterFields}
      columnFilters={columnFilters}
      sorting={sorting}
      pagination={pagination}
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
            "--top-bar-height": `${topBarHeight}px`,
            ...columnSizeVars,
          } as React.CSSProperties
        }
      >
        <div
          className={cn(
            "p-[1%] h-full w-full flex-col sm:sticky sm:top-0 sm:max-h-screen sm:min-h-screen sm:min-w-52 sm:max-w-52 sm:self-start md:min-w-90 md:max-w-100",
            "group-data-[expanded=false]/controls:hidden",
            "hidden sm:flex",
          )}
        >
          <div className="border-b border-gray-300 bg-background p-2 md:sticky md:top-0">
            <div className="flex h-[46px] items-center justify-between gap-3">
              <p className="px-2 font-medium text-foreground">Filters</p>
              <div>
                {table.getState().columnFilters.length ? (
                  <DataTableResetButton />
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex-1 p-2 sm:overflow-y-scroll">
            <DataTableFilterControls />
          </div>
        </div>
        <div
          className={cn(
            "flex max-w-full flex-1 flex-col border-gray-300 sm:border-l",
            "group-data-[expanded=true]/controls:sm:max-w-[calc(100vw_-_208px)] group-data-[expanded=true]/controls:md:max-w-[calc(100vw_-_288px)]",
          )}
        >
          <div
            ref={topBarRef}
            className={cn(
              "flex flex-col gap-4 bg-background p-2",
              "sticky top-0 z-10 pb-4",
            )}
          >
            <DataTableFilterCommand schema={columnFilterSchema} />
            <DataTableToolbar
              renderActions={() => [
                refetch && <RefreshButton key="refresh" onClick={refetch} />,
              ]}
            />
            {chartData.length > 0 && <TimelineChart data={chartData} className="-mb-2" columnId="date" />}
          </div>
          <div className="z-0">
            <Table
              className="border-separate border-spacing-0 [&_*]:border-gray-300 ![&_tr]:border-gray-300 ![&_td]:border-gray-300 ![&_th]:border-gray-300"
              containerClassName="max-h-[calc(100vh_-_var(--top-bar-height))]"
            >
              <TableHeader className={cn("sticky top-0 z-20 bg-background")}>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className={cn(
                      "bg-muted/50 hover:bg-muted/50",
                      "[&>*]:border-t [&>*]:border-gray-300 [&>:not(:last-child)]:border-r [&>:not(:last-child)]:border-gray-300",
                    )}
                  >
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          className={cn(
                            "relative select-none truncate border-b border-gray-300 [&>.cursor-col-resize]:last:opacity-0",
                            header.column.columnDef.meta?.headerClassName,
                          )}
                          aria-sort={
                            header.column.getIsSorted() === "asc"
                              ? "ascending"
                              : header.column.getIsSorted() === "desc"
                                ? "descending"
                                : "none"
                          }
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          {header.column.getCanResize() && (
                            <div
                              onDoubleClick={() => header.column.resetSize()}
                              onMouseDown={header.getResizeHandler()}
                              onTouchStart={header.getResizeHandler()}
                              className={cn(
                                "user-select-none absolute -right-2 top-0 z-10 flex h-full w-4 cursor-col-resize touch-none justify-center",
                                "before:absolute before:inset-y-0 before:w-px before:translate-x-px before:bg-gray-300",
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
                className="outline-1 -outline-offset-1 outline-gray-300 transition-colors focus-visible:outline"
                style={{
                  scrollMarginTop: "calc(var(--top-bar-height) + 40px)",
                }}
              >
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      id={row.id}
                      tabIndex={0}
                      data-state={row.getIsSelected() && "selected"}
                      onClick={() => row.toggleSelected()}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          row.toggleSelected();
                        }
                      }}
                      className={cn(
                        "border-b border-gray-300",
                        "[&>:not(:last-child)]:border-r [&>:not(:last-child)]:border-gray-300",
                        "outline-1 -outline-offset-1 outline-gray-300 transition-colors",
                        "focus-visible:bg-muted/50 focus-visible:outline data-[state=selected]:outline",
                        table.options.meta?.getRowClassName?.(row),
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "truncate border-b border-gray-300",
                            cell.column.columnDef.meta?.cellClassName,
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
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
        <TransactionSheetDetails />
      </DataTableSheetDetails>
    </DataTableProvider>
  );
}

"use client";

import {
    ColumnDef,
    ColumnFiltersState,
    Row,
    RowSelectionState,
    SortingState,
    Table as TTable,
    TableOptions,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    getFacetedMinMaxValues as getTTableFacetedMinMaxValues,
    getFacetedUniqueValues as getTTableFacetedUniqueValues,
    useReactTable,
} from "@tanstack/react-table";
import type { FetchNextPageOptions, FetchPreviousPageOptions, RefetchOptions } from "@tanstack/react-query";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../primitives/table";

import { BaseChartSchema } from "./core/schema";
import { Button } from "../../primitives/button";
import { DataTableFilterControls } from "../data-table-v2/filters/DataTableFilterControls";
import { DataTableFilterField } from "../data-table-v2/core/types";
import { DataTableProvider } from "../data-table-v2/core/DataTableProvider";
import { DataTableResetButton } from "../data-table-v2/filters/DataTableResetButton";
import { LoaderCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import { useLocalStorage } from "../../hooks/use-local-storage";

/**
 * Format a number in a compact format (e.g. 1.2k, 1.2m)
 */
function formatCompactNumber(num: number): string {
    return new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(num);
}

/**
 * Custom date range filter function
 */
function inDateRange<TData>(
    row: Row<TData>,
    columnId: string,
    filterValue: [Date, Date]
): boolean {
    const value = row.getValue(columnId) as Date;
    const [min, max] = filterValue;

    if (min && max) {
        return value >= min && value <= max;
    }

    if (min) {
        return value >= min;
    }

    if (max) {
        return value <= max;
    }

    return true;
}

/**
 * Custom array filter function
 */
function arrSome<TData>(
    row: Row<TData>,
    columnId: string,
    filterValue: unknown[]
): boolean {
    const rowValue = row.getValue(columnId);

    if (!filterValue.length) return true;

    if (Array.isArray(rowValue)) {
        return rowValue.some((val) => filterValue.includes(val));
    }

    return filterValue.includes(rowValue);
}

/**
 * Memoized row component for better performance
 */
const MemoizedRow = React.memo(
    ({
        row,
        table,
        selected,
    }: {
        row: Row<any>;
        table: TTable<any>;
        selected: boolean;
    }) => {
        const getRowClassName = table.options.meta?.getRowClassName;

        return (
            <TableRow
                data-state={selected ? "selected" : undefined}
                className={cn(getRowClassName?.(row))}
                onClick={() => {
                    if (selected) {
                        row.toggleSelected(false);
                    } else {
                        table.resetRowSelection();
                        row.toggleSelected();
                    }
                }}
            >
                {row.getVisibleCells().map((cell) => (
                    <TableCell
                        key={cell.id}
                        className={cn(
                            "p-2 truncate",
                            cell.column.columnDef.meta?.cellClassName
                        )}
                    >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                ))}
            </TableRow>
        );
    },
    (prev, next) => {
        // Only re-render if the selection state changes
        return prev.selected === next.selected;
    }
);

MemoizedRow.displayName = "MemoizedRow";

/**
 * Props for sheet field
 */
export interface SheetField<TData, TMeta> {
    label: string;
    value: keyof TData | string;
    render?: (data: TData, metadata: TMeta) => React.ReactNode;
}

/**
 * Props for the DataTableInfinite component
 */
export interface DataTableInfiniteProps<TData, TValue, TMeta> {
    /**
     * Column definitions for the table
     */
    columns: ColumnDef<TData, TValue>[];

    /**
     * Function to get row class name based on row data
     */
    getRowClassName?: (row: Row<TData>) => string;

    /**
     * Function to get row ID
     */
    getRowId: TableOptions<TData>["getRowId"];

    /**
     * Data to display in the table
     */
    data: TData[];

    /**
     * Default column filters
     */
    defaultColumnFilters?: ColumnFiltersState;

    /**
     * Default column sorting
     */
    defaultColumnSorting?: SortingState;

    /**
     * Default row selection
     */
    defaultRowSelection?: RowSelectionState;

    /**
     * Default column visibility
     */
    defaultColumnVisibility?: VisibilityState;

    /**
     * Filter fields for the data table
     */
    filterFields?: DataTableFilterField<TData>[];

    /**
     * Sheet fields for detail view
     */
    sheetFields?: SheetField<TData, TMeta>[];

    /**
     * Function to get faceted unique values
     */
    getFacetedUniqueValues?: (
        table: TTable<TData>,
        columnId: string,
    ) => Map<string, number>;

    /**
     * Function to get faceted min/max values
     */
    getFacetedMinMaxValues?: (
        table: TTable<TData>,
        columnId: string,
    ) => undefined | [number, number];

    /**
     * Total number of rows in the data source
     */
    totalRows?: number;

    /**
     * Number of rows after filtering
     */
    filterRows?: number;

    /**
     * Number of rows fetched so far
     */
    totalRowsFetched?: number;

    /**
     * Metadata for the table
     */
    meta: TMeta;

    /**
     * Chart data for visualization
     */
    chartData?: BaseChartSchema[];

    /**
     * Whether data is being fetched
     */
    isFetching?: boolean;

    /**
     * Whether data is loading
     */
    isLoading?: boolean;

    /**
     * Function to fetch the next page of data
     */
    fetchNextPage: (
        options?: FetchNextPageOptions | undefined,
    ) => Promise<unknown>;

    /**
     * Function to fetch the previous page of data
     */
    fetchPreviousPage?: (
        options?: FetchPreviousPageOptions | undefined,
    ) => Promise<unknown>;

    /**
     * Function to refetch data
     */
    refetch: (options?: RefetchOptions | undefined) => void;

    /**
     * Function to render a live row indicator
     */
    renderLiveRow?: (props?: { row: Row<TData> }) => React.ReactNode;

    /**
     * Optional class name for the component
     */
    className?: string;
}

/**
 * DataTableInfinite component that combines infinite scrolling with data table functionality
 * 
 * @example
 * ```tsx
 * <DataTableInfinite
 *   columns={columns}
 *   data={data}
 *   getRowId={(row) => row.id}
 *   filterFields={filterFields}
 *   fetchNextPage={fetchNextPage}
 *   refetch={refetch}
 *   meta={metadata}
 * />
 * ```
 */
export function DataTableInfinite<TData, TValue, TMeta>({
    columns,
    getRowClassName,
    getRowId,
    data,
    defaultColumnFilters = [],
    defaultColumnSorting = [],
    defaultRowSelection = {},
    defaultColumnVisibility = {},
    filterFields = [],
    sheetFields = [],
    isFetching,
    isLoading,
    fetchNextPage,
    fetchPreviousPage,
    refetch,
    totalRows = 0,
    filterRows = 0,
    totalRowsFetched = 0,
    chartData = [],
    getFacetedUniqueValues,
    getFacetedMinMaxValues,
    meta,
    renderLiveRow,
    className,
}: DataTableInfiniteProps<TData, TValue, TMeta>) {
    // State management
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(defaultColumnFilters);
    const [sorting, setSorting] = useState<SortingState>(defaultColumnSorting);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>(defaultRowSelection);
    const [columnOrder, setColumnOrder] = useLocalStorage<string[]>("data-table-column-order", []);
    const [columnVisibility, setColumnVisibility] = useLocalStorage<VisibilityState>(
        "data-table-visibility",
        defaultColumnVisibility
    );

    // Refs
    const topBarRef = useRef<HTMLDivElement>(null);
    const tableRef = useRef<HTMLTableElement>(null);
    const [topBarHeight, setTopBarHeight] = useState(0);

    // Handle scrolling to load more data
    const onScroll = useCallback(
        (e: React.UIEvent<HTMLElement>) => {
            const onPageBottom =
                Math.ceil(e.currentTarget.scrollTop + e.currentTarget.clientHeight) >=
                e.currentTarget.scrollHeight;

            if (onPageBottom && !isFetching && totalRowsFetched < filterRows) {
                fetchNextPage();
            }
        },
        [fetchNextPage, isFetching, filterRows, totalRowsFetched]
    );

    // Measure top bar height
    useEffect(() => {
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

    // Create table instance
    const table = useReactTable({
        data,
        columns,
        state: {
            columnFilters,
            sorting,
            columnVisibility,
            rowSelection,
            columnOrder,
        },
        enableMultiRowSelection: false,
        columnResizeMode: "onChange",
        getRowId,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnFiltersChange: setColumnFilters,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnOrderChange: setColumnOrder,
        getSortedRowModel: getSortedRowModel(),
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getTTableFacetedUniqueValues(),
        getFacetedMinMaxValues: getTTableFacetedMinMaxValues(),
        filterFns: { inDateRange, arrSome },
        meta: { getRowClassName },
    });

    // Calculate column size CSS variables
    const columnSizeVars = useMemo(() => {
        const headers = table.getFlatHeaders();
        const colSizes: { [key: string]: string } = {};
        for (let i = 0; i < headers.length; i++) {
            const header = headers[i]!;
            // Replace "." with "-" to avoid invalid CSS variable name (e.g. "timing.dns" -> "timing-dns")
            colSizes[`--header-${header.id.replace(".", "-")}-size`] = `${header.getSize()}px`;
            colSizes[`--col-${header.column.id.replace(".", "-")}-size`] = `${header.column.getSize()}px`;
        }
        return colSizes;
    }, [
        table.getState().columnSizingInfo,
        table.getState().columnSizing,
        table.getState().columnVisibility,
    ]);

    // Get selected row
    const selectedRow = useMemo(() => {
        if ((isLoading || isFetching) && !data.length) return;
        const selectedRowKey = Object.keys(rowSelection)?.[0];
        return table
            .getCoreRowModel()
            .flatRows.find((row) => row.id === selectedRowKey);
    }, [rowSelection, table, isLoading, isFetching, data]);

    return (
        <DataTableProvider
            table={table}
            columns={columns}
            filterFields={filterFields}
            columnFilters={columnFilters}
            sorting={sorting}
            rowSelection={rowSelection}
            columnOrder={columnOrder}
            columnVisibility={columnVisibility}
            enableColumnOrdering={true}
            isLoading={isFetching || isLoading}
            getFacetedUniqueValues={getFacetedUniqueValues}
            getFacetedMinMaxValues={getFacetedMinMaxValues}
        >
            <div
                className={cn("flex h-full min-h-screen w-full flex-col sm:flex-row", className)}
                style={
                    {
                        "--top-bar-height": `${topBarHeight}px`,
                        ...columnSizeVars,
                    } as React.CSSProperties
                }
            >
                {/* Filter sidebar - desktop view */}
                <div
                    className={cn(
                        "h-full w-full flex-col sm:sticky sm:top-0 sm:max-h-screen sm:min-h-screen sm:min-w-52 sm:max-w-52 sm:self-start md:min-w-72 md:max-w-72",
                        "group-data-[expanded=false]/controls:hidden",
                        "hidden sm:flex",
                    )}
                >
                    <div className="border-b border-border bg-background p-2 md:sticky md:top-0" ref={topBarRef}>
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
                    <div className="border-t border-border bg-background p-4 md:sticky md:bottom-0">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                                {formatCompactNumber(filterRows)} of {formatCompactNumber(totalRows)} rows
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => refetch()}
                                disabled={isFetching}
                            >
                                {isFetching ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Refresh
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main content area */}
                <div className="flex-1 flex flex-col" style={{ height: "100vh" }}>
                    {/* Chart area - can be implemented separately */}
                    {chartData.length > 0 && (
                        <div className="border-b border-border bg-background p-4">
                            {/* TimelineChart component to be implemented */}
                            <div className="h-48 bg-muted/20 rounded-md flex items-center justify-center">
                                <span className="text-muted-foreground">Timeline Chart</span>
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    <div className="z-0 flex-1 overflow-auto">
                        <Table
                            ref={tableRef}
                            onScroll={onScroll}
                            // Border-separate for sticky headers
                            className="border-separate border-spacing-0"
                        >
                            <TableHeader className={cn("sticky top-0 z-20 bg-background")}>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow
                                        key={headerGroup.id}
                                        className={cn(
                                            "bg-muted/50 hover:bg-muted/50",
                                            "[&>*]:border-t [&>:not(:last-child)]:border-r",
                                        )}
                                    >
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <TableHead
                                                    key={header.id}
                                                    className={cn(
                                                        "relative select-none truncate border-b border-border [&>.cursor-col-resize]:last:opacity-0",
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
                                                                "before:absolute before:inset-y-0 before:w-px before:translate-x-px before:bg-border",
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
                                className="outline-1 -outline-offset-1 outline-primary transition-colors focus-visible:outline"
                                style={{
                                    scrollMarginTop: "calc(var(--top-bar-height) + 40px)",
                                }}
                            >
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <React.Fragment key={row.id}>
                                            {renderLiveRow?.({ row })}
                                            <MemoizedRow
                                                row={row}
                                                table={table}
                                                selected={row.getIsSelected()}
                                            />
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <React.Fragment>
                                        {renderLiveRow && renderLiveRow()}
                                        <TableRow>
                                            <TableCell
                                                colSpan={columns.length}
                                                className="h-24 text-center"
                                            >
                                                No results.
                                            </TableCell>
                                        </TableRow>
                                    </React.Fragment>
                                )}
                                <TableRow className="hover:bg-transparent data-[state=selected]:bg-transparent">
                                    <TableCell colSpan={columns.length} className="text-center">
                                        {totalRowsFetched < filterRows ||
                                            !table.getCoreRowModel().rows?.length ? (
                                            <Button
                                                disabled={isFetching || isLoading}
                                                onClick={() => fetchNextPage()}
                                                size="sm"
                                                variant="outline"
                                            >
                                                {isFetching ? (
                                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                                ) : null}
                                                Load More
                                            </Button>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                No more data to load (
                                                <span className="font-mono font-medium">
                                                    {formatCompactNumber(filterRows)}
                                                </span>{" "}
                                                of{" "}
                                                <span className="font-mono font-medium">
                                                    {formatCompactNumber(totalRows)}
                                                </span>{" "}
                                                rows)
                                            </p>
                                        )}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </DataTableProvider>
    );
} 
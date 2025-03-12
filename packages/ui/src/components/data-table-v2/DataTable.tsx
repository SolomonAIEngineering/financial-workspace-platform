"use client";

import {
    ColumnDef,
    ColumnFiltersState,
    PaginationState,
    Row,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedMinMaxValues,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import React, { useEffect, useMemo, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/table";

import { DataTableFilterControls } from "./filters/DataTableFilterControls";
import { DataTableFilterControlsDrawer } from "./filters/DataTableFilterControlsDrawer";
import type { DataTableFilterField } from "./core/types";
import { DataTablePagination } from "./pagination/DataTablePagination";
import { DataTableProvider } from "./core/DataTableProvider";
import { DataTableSkeleton } from "./DataTableSkeleton";
import { DataTableToolbar } from "./DataTableToolbar";
import { cn } from "@/lib/utils";

/**
 * Props for the DataTable component
 * 
 * @template TData The data type for the table rows
 * @template TValue The value type for the table cells
 */
export interface DataTableProps<TData, TValue> {
    /**
     * The data to be displayed in the table
     */
    data: TData[];

    /**
     * The column definitions for the table
     */
    columns: ColumnDef<TData, TValue>[];

    /**
     * Optional filter fields for the table
     * @default []
     */
    filterFields?: DataTableFilterField<TData>[];

    /**
     * Optional default column filters
     * @default []
     */
    defaultColumnFilters?: ColumnFiltersState;

    /**
     * Optional default sorting state
     * @default []
     */
    defaultSorting?: SortingState;

    /**
     * Optional default pagination state
     * @default { pageIndex: 0, pageSize: 10 }
     */
    defaultPagination?: PaginationState;

    /**
     * Optional default column visibility state
     * @default {}
     */
    defaultColumnVisibility?: VisibilityState;

    /**
     * Whether to show the toolbar
     * @default true
     */
    showToolbar?: boolean;

    /**
     * Whether to show the filter controls on the side (desktop) or in a drawer (mobile)
     * @default true
     */
    showFilters?: boolean;

    /**
     * Whether to show the pagination controls
     * @default true
     */
    showPagination?: boolean;

    /**
     * Optional custom class name for the table container
     */
    className?: string;

    /**
     * Optional loading state for the table
     * @default false
     */
    isLoading?: boolean;

    /**
     * Optional callback when row is clicked
     */
    onRowClick?: (row: Row<TData>) => void;

    /**
     * Optional callback when column filters change
     */
    onColumnFiltersChange?: (filters: ColumnFiltersState) => void;

    /**
     * Optional callback when sorting changes
     */
    onSortingChange?: (sorting: SortingState) => void;

    /**
     * Optional callback when pagination changes
     */
    onPaginationChange?: (pagination: PaginationState) => void;

    /**
     * Optional callback when column visibility changes
     */
    onColumnVisibilityChange?: (visibility: VisibilityState) => void;
}

/**
 * A comprehensive data table component that combines all data table subcomponents
 * 
 * @template TData The data type for the table rows
 * @template TValue The value type for the table cells
 * 
 * @example
 * ```tsx
 * <DataTable
 *   data={data}
 *   columns={columns}
 *   filterFields={filterFields}
 * />
 * ```
 */
export function DataTable<TData, TValue>({
    data,
    columns,
    filterFields = [],
    defaultColumnFilters = [],
    defaultSorting = [],
    defaultPagination = { pageIndex: 0, pageSize: 10 },
    defaultColumnVisibility = {},
    showToolbar = true,
    showFilters = true,
    showPagination = true,
    className,
    isLoading = false,
    onRowClick,
    onColumnFiltersChange,
    onSortingChange,
    onPaginationChange,
    onColumnVisibilityChange,
}: DataTableProps<TData, TValue>) {
    // State management for table
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(defaultColumnFilters);
    const [sorting, setSorting] = useState<SortingState>(defaultSorting);
    const [pagination, setPagination] = useState<PaginationState>(defaultPagination);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(defaultColumnVisibility);

    // Handle controlled state changes with callbacks
    const handleColumnFiltersChange = (filters: ColumnFiltersState) => {
        setColumnFilters(filters);
        onColumnFiltersChange?.(filters);
    };

    const handleSortingChange = (newSorting: SortingState) => {
        setSorting(newSorting);
        onSortingChange?.(newSorting);
    };

    const handlePaginationChange = (newPagination: PaginationState) => {
        setPagination(newPagination);
        onPaginationChange?.(newPagination);
    };

    const handleColumnVisibilityChange = (newVisibility: VisibilityState) => {
        setColumnVisibility(newVisibility);
        onColumnVisibilityChange?.(newVisibility);
    };

    // Create table instance
    const table = useReactTable({
        data,
        columns,
        state: {
            columnFilters,
            sorting,
            pagination,
            columnVisibility,
        },
        onColumnFiltersChange: handleColumnFiltersChange,
        onSortingChange: handleSortingChange,
        onPaginationChange: handlePaginationChange,
        onColumnVisibilityChange: handleColumnVisibilityChange,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFacetedMinMaxValues: getFacetedMinMaxValues(),
    });

    // Handle row click events
    const handleRowClick = (row: Row<TData>) => {
        onRowClick?.(row);
    };

    // Memoize the row click handler to prevent re-renders
    const memoizedRowClick = useMemo(() => handleRowClick, [onRowClick]);

    // Return loading state if isLoading
    if (isLoading) {
        return <DataTableSkeleton />;
    }

    return (
        <DataTableProvider
            table={table}
            columns={columns}
            filterFields={filterFields}
            columnFilters={columnFilters}
            sorting={sorting}
            pagination={pagination}
            isLoading={isLoading}
        >
            <div className={cn("flex flex-col space-y-4", className)}>
                {/* Mobile filter drawer - only shown on small screens */}
                {showFilters && filterFields.length > 0 && (
                    <div className="block md:hidden">
                        <DataTableFilterControlsDrawer />
                    </div>
                )}

                <div className="flex flex-col md:flex-row md:gap-4">
                    {/* Desktop filter sidebar - only shown on medium and up screens */}
                    {showFilters && filterFields.length > 0 && (
                        <div className="hidden md:block md:w-64">
                            <DataTableFilterControls />
                        </div>
                    )}

                    <div className="flex-1 space-y-4">
                        {/* Toolbar with search and view options */}
                        {showToolbar && <DataTableToolbar />}

                        {/* Main table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <TableHead key={header.id} colSpan={header.colSpan}>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow
                                                key={row.id}
                                                data-state={row.getIsSelected() && "selected"}
                                                onClick={() => memoizedRowClick(row)}
                                                className={onRowClick ? "cursor-pointer" : ""}
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id}>
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
                                                No results found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination controls */}
                        {showPagination && <DataTablePagination />}
                    </div>
                </div>
            </div>
        </DataTableProvider>
    );
} 
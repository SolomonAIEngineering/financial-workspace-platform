import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import React, { useCallback, useMemo } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useDataTable, useDataTableCallbacks } from "../core/DataTableProvider";

import { Button } from "@/components/ui/button";
import type { Table } from "@tanstack/react-table";

/**
 * Props for the DataTablePagination component
 * @template TData - The data type for the table
 */
export interface DataTablePaginationProps<TData = unknown> {
    /**
     * The table instance to use for pagination
     */
    table?: Table<TData>;

    /**
     * Custom class name for the pagination component
     */
    className?: string;

    /**
     * Available page size options to display
     * @default [10, 20, 30, 40, 50]
     */
    pageSizeOptions?: number[];

    /**
     * Whether to show the "Go to first page" and "Go to last page" buttons
     * @default true
     */
    showEdgeButtons?: boolean;

    /**
     * Custom text to use for "Rows per page" label
     * @default "Rows per page"
     */
    rowsPerPageText?: string;

    /**
     * Custom text to use for page count
     * @default "Page {current} of {total}"
     */
    pageCountText?: string;
}

/**
 * A pagination component for data tables with page size selection and navigation
 * 
 * @template TData - The data type for the table
 * @param {DataTablePaginationProps<TData>} props - The component props
 * @returns React component
 */
export function DataTablePagination<TData>({
    table: externalTable,
    className,
    pageSizeOptions = [10, 20, 30, 40, 50],
    showEdgeButtons = true,
    rowsPerPageText = "Rows per page",
    pageCountText,
}: DataTablePaginationProps<TData>) {
    const context = useDataTable<TData>();
    const callbacks = useDataTableCallbacks<TData>();

    // Use external table if provided, otherwise use table from context
    const table = externalTable || context.table;
    const state = context.state;

    // Get current pagination state
    const currentPageIndex = state.pageIndex || 0;
    const currentPageSize = state.pageSize || 10;

    // Calculate page count
    const pageCount = useMemo(() => table.getPageCount(), [table]);

    // Generate page count text based on current state
    const currentPageCountText = useMemo(() => {
        if (pageCountText) return pageCountText;
        return `Page ${currentPageIndex + 1} of ${pageCount}`;
    }, [pageCountText, currentPageIndex, pageCount]);

    // Handle page size change
    const handlePageSizeChange = useCallback((value: string) => {
        const newPageSize = Number(value);
        table.setPageSize(newPageSize);

        // Update through dispatch for controlled tables
        context.dispatch({
            type: 'SET_PAGE_SIZE',
            payload: newPageSize
        });

        // Call callback if provided
        callbacks?.onPageSizeChange?.(newPageSize);
    }, [table, context, callbacks]);

    // Handle page change
    const handlePageChange = useCallback((newPageIndex: number) => {
        table.setPageIndex(newPageIndex);

        // Update through dispatch for controlled tables
        context.dispatch({
            type: 'SET_PAGE_INDEX',
            payload: newPageIndex
        });

        // Call callback if provided
        callbacks?.onPageChange?.(newPageIndex + 1); // Convert to 1-indexed for the callback
    }, [table, context, callbacks]);

    // Go to first page
    const goToFirstPage = useCallback(() => {
        handlePageChange(0);
    }, [handlePageChange]);

    // Go to previous page
    const goToPreviousPage = useCallback(() => {
        handlePageChange(Math.max(0, currentPageIndex - 1));
    }, [handlePageChange, currentPageIndex]);

    // Go to next page
    const goToNextPage = useCallback(() => {
        handlePageChange(Math.min(pageCount - 1, currentPageIndex + 1));
    }, [handlePageChange, currentPageIndex, pageCount]);

    // Go to last page
    const goToLastPage = useCallback(() => {
        handlePageChange(Math.max(0, pageCount - 1));
    }, [handlePageChange, pageCount]);

    return (
        <div className={`flex items-center justify-end space-x-4 md:space-x-6 lg:space-x-8 ${className || ''}`}>
            <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">{rowsPerPageText}</p>
                <Select
                    value={`${currentPageSize}`}
                    onValueChange={handlePageSizeChange}
                >
                    <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={currentPageSize} />
                    </SelectTrigger>
                    <SelectContent side="top">
                        {pageSizeOptions.map((pageSize) => (
                            <SelectItem key={pageSize} value={`${pageSize}`}>
                                {pageSize}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center justify-center text-sm font-medium">
                {currentPageCountText}
            </div>

            <div className="flex items-center space-x-2">
                {showEdgeButtons && (
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={goToFirstPage}
                        disabled={!table.getCanPreviousPage()}
                        aria-label="Go to first page"
                    >
                        <span className="sr-only">Go to first page</span>
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                )}

                <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={goToPreviousPage}
                    disabled={!table.getCanPreviousPage()}
                    aria-label="Go to previous page"
                >
                    <span className="sr-only">Go to previous page</span>
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={goToNextPage}
                    disabled={!table.getCanNextPage()}
                    aria-label="Go to next page"
                >
                    <span className="sr-only">Go to next page</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>

                {showEdgeButtons && (
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={goToLastPage}
                        disabled={!table.getCanNextPage()}
                        aria-label="Go to last page"
                    >
                        <span className="sr-only">Go to last page</span>
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
} 
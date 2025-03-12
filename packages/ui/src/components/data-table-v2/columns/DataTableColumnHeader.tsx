import { ChevronDown, ChevronUp } from "lucide-react";
import { useDataTable, useDataTableCallbacks } from "../core/DataTableProvider";

import { Button } from "@/components/ui/button";
import { ButtonProps } from "@/components/ui/button";
import type { Column } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { useCallback } from "react";

/**
 * Props for the DataTableColumnHeader component
 * @template TData - The data type for the table
 * @template TValue - The value type for the column
 */
export interface DataTableColumnHeaderProps<TData, TValue> extends ButtonProps {
    /**
     * The column to render the header for
     */
    column: Column<TData, TValue>;

    /**
     * The title to display in the header
     */
    title: string;

    /**
     * Whether to show sort indicators
     * @default true
     */
    showSortIndicator?: boolean;

    /**
     * Aria label for the sort button
     * If not provided, it will be generated based on the title
     */
    ariaLabel?: string;
}

/**
 * A header cell component for data tables with sorting capability
 * 
 * @template TData - The data type for the table
 * @template TValue - The value type for the column
 * @param {DataTableColumnHeaderProps<TData, TValue>} props - The component props
 * @returns React component
 */
export function DataTableColumnHeader<TData, TValue>({
    column,
    title,
    className,
    showSortIndicator = true,
    ariaLabel,
    ...props
}: DataTableColumnHeaderProps<TData, TValue>) {
    const callbacks = useDataTableCallbacks<TData>();
    const { table } = useDataTable<TData>();

    // If the column can't be sorted, render a simple div
    if (!column.getCanSort()) {
        return <div className={cn("flex items-center px-2 py-1", className)}>{title}</div>;
    }

    // Handle click on the column header
    const handleClick = useCallback((e: React.MouseEvent) => {
        // Call the onHeaderClick callback if provided
        callbacks?.onHeaderClick?.(column, e);

        // Get the current sort direction
        const oldSortDirection = column.getIsSorted();

        // Toggle sorting
        column.toggleSorting(undefined);

        // Get the updated sorting state
        const newSortingState = table?.getState().sorting;

        // Call the onSortingChange callback if provided
        callbacks?.onSortingChange?.(newSortingState ?? []);
    }, [column, callbacks, table]);

    // Generate the aria-label for the sort button
    const sortAriaLabel = ariaLabel || `Sort by ${title}`;

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleClick}
            className={cn(
                "flex h-8 w-full items-center justify-between gap-2 px-2 py-1 hover:bg-accent hover:text-accent-foreground",
                className,
            )}
            aria-label={sortAriaLabel}
            {...props}
        >
            <span>{title}</span>
            {showSortIndicator && (
                <span className="flex flex-col">
                    <ChevronUp
                        className={cn(
                            "-mb-0.5 h-3 w-3",
                            column.getIsSorted() === "asc"
                                ? "text-accent-foreground"
                                : "text-muted-foreground",
                        )}
                        aria-hidden="true"
                    />
                    <ChevronDown
                        className={cn(
                            "-mt-0.5 h-3 w-3",
                            column.getIsSorted() === "desc"
                                ? "text-accent-foreground"
                                : "text-muted-foreground",
                        )}
                        aria-hidden="true"
                    />
                </span>
            )}
        </Button>
    );
} 
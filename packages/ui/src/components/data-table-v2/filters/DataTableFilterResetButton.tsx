"use client";

import { Button } from "../../../primitives/button";
import type { DataTableFilterField } from "../core/types";
import React from "react";
import { X } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useDataTable } from "../core/DataTableProvider";

/**
 * Props for the DataTableFilterResetButton component
 */
export interface DataTableFilterResetButtonProps<TData = unknown> extends DataTableFilterField<TData> {
    /**
     * Optional custom class name for the button
     */
    className?: string;

    /**
     * Optional callback when the filter is reset
     */
    onReset?: () => void;
}

/**
 * A button component that resets a specific column filter
 * Used within filter accordions to clear individual filters
 * 
 * @template TData The data type for the table rows
 */
export function DataTableFilterResetButton<TData = unknown>({
    value,
    className,
    onReset,
}: DataTableFilterResetButtonProps<TData>) {
    const { table } = useDataTable<TData>();

    // Get current filters
    const filters = table.getState().columnFilters;

    // Check if this field has a filter applied
    const hasFilter = filters.some((filter) => filter.id === value);

    // If no filter is applied, don't render anything
    if (!hasFilter) {
        return null;
    }

    // Handle click to reset this specific filter
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent accordion toggle
        table.getColumn(value as string)?.setFilterValue(undefined);
        onReset?.();
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className={cn("h-6 w-6 p-0 text-muted-foreground", className)}
            onClick={handleClick}
            aria-label={`Reset ${value} filter`}
            data-testid={`filter-reset-${value}`}
        >
            <X className="h-3 w-3" />
            <span className="sr-only">Reset filter</span>
        </Button>
    );
} 
"use client";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/tooltip";
import { useDataTable, useDataTableCallbacks } from "./core/DataTableProvider";

import { Button } from "@/components/button";
import { Kbd } from "../custom/kbd";
import React from "react";
import type { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Props for the DataTableResetButton component
 * 
 * @template TData The data type for the table rows
 */
export interface DataTableResetButtonProps<TData = unknown> {
    /**
     * Optional table instance to use instead of the context-provided table
     */
    table?: Table<TData>;

    /**
     * Custom class name for the button
     */
    className?: string;

    /**
     * Button variant
     * @default "ghost"
     */
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";

    /**
     * Button size
     * @default "sm"
     */
    size?: "default" | "sm" | "lg" | "icon";

    /**
     * Custom text to display on the button
     * @default "Reset"
     */
    text?: string;

    /**
     * Icon to use on the button
     * @default X icon from lucide-react
     */
    icon?: React.ReactNode;

    /**
     * Whether to show the keyboard shortcut tooltip
     * @default true
     */
    showTooltip?: boolean;

    /**
     * Tooltip text
     * @default "Reset filters with ⌘ Esc"
     */
    tooltipText?: string;

    /**
     * Side where the tooltip should appear
     * @default "left"
     */
    tooltipSide?: "top" | "right" | "bottom" | "left";

    /**
     * Whether to disable the keyboard shortcut
     * @default false
     */
    disableShortcut?: boolean;

    /**
     * Additional callback to run when the button is clicked
     */
    onClick?: () => void;
}

/**
 * DataTableResetButton component that provides a button to reset all column filters
 * 
 * @template TData The data type for the table rows
 * @example
 * ```tsx
 * <DataTableResetButton 
 *   variant="outline"
 *   text="Clear Filters"
 * />
 * ```
 */
export function DataTableResetButton<TData = unknown>({
    table: externalTable,
    className,
    variant = "ghost",
    size = "sm",
    text = "Reset",
    icon,
    showTooltip = true,
    tooltipText,
    tooltipSide = "left",
    disableShortcut = false,
    onClick,
}: DataTableResetButtonProps<TData>) {
    const context = useDataTable<TData>();
    const callbacks = useDataTableCallbacks<TData>();

    // Use external table if provided, otherwise use table from context
    const table = externalTable || context.table;

    // Set up the reset function
    const handleReset = () => {
        // Reset filters in the table
        table?.resetColumnFilters();

        // Call the custom onClick handler if provided
        onClick?.();

        // Call the callback if provided
        callbacks?.onFiltersReset?.();
    };

    // Handle keyboard shortcut unless disabled
    if (!disableShortcut) {
        // Note: This would normally use useHotKey, but we're handling it directly here
        React.useEffect(() => {
            const handleKeyDown = (e: KeyboardEvent) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Escape") {
                    handleReset();
                }
            };

            window.addEventListener("keydown", handleKeyDown);
            return () => window.removeEventListener("keydown", handleKeyDown);
        }, [table]);
    }

    // Default tooltip text if not provided
    const defaultTooltipText = (
        <p>
            Reset filters with{" "}
            <Kbd className="ml-1 text-muted-foreground group-hover:text-accent-foreground">
                <span className="mr-1">⌘</span>
                <span>Esc</span>
            </Kbd>
        </p>
    );

    // Render the button, optionally with a tooltip
    const buttonElement = (
        <Button
            variant={variant}
            size={size}
            onClick={handleReset}
            className={cn(className)}
            data-testid="data-table-reset-button"
            aria-label="Reset filters"
        >
            {icon || <X className="mr-2 h-4 w-4" />}
            {text}
        </Button>
    );

    // If tooltip is disabled, return just the button
    if (!showTooltip) {
        return buttonElement;
    }

    // Otherwise, return the button wrapped in a tooltip
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {buttonElement}
                </TooltipTrigger>
                <TooltipContent side={tooltipSide}>
                    {tooltipText ? tooltipText : defaultTooltipText}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
} 
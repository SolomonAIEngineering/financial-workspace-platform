"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import React, { useMemo } from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/tooltip";

import { Button } from "@/components/button";
import { DataTableFilterControlsDrawer } from "./filters/DataTableFilterControlsDrawer";
import { DataTableResetButton } from "./DataTableResetButton";
import { DataTableViewOptions } from "./DataTableViewOptions";
import { Kbd } from "../custom/kbd";
import { formatCompactNumber } from "@/lib/format";
import { useDataTable } from "./core/DataTableProvider";

/**
 * Props for the DataTableToolbar component
 * 
 * @interface DataTableToolbarProps
 */
export interface DataTableToolbarProps {
    /**
     * Optional render function to add custom actions to the toolbar
     */
    renderActions?: () => React.ReactNode;

    /**
     * Optional className to be applied to the toolbar container
     */
    className?: string;

    /**
     * Optional boolean to control if the controls panel is open
     * When not provided, the component will use the internal state from useDataTable
     */
    controlsOpen?: boolean;

    /**
     * Optional callback when the controls panel toggle button is clicked
     * When not provided, the component will use the internal state setter from useDataTable
     */
    onControlsOpenChange?: (open: boolean) => void;

    /**
     * Optional flag to disable all controls
     * @default false
     */
    disabled?: boolean;

    /**
     * Optional flag to hide the row count information
     * @default false
     */
    hideRowCount?: boolean;

    /**
     * Optional flag to hide the reset button when filters are applied
     * @default false
     */
    hideResetButton?: boolean;

    /**
     * Optional flag to hide the view options button
     * @default false
     */
    hideViewOptions?: boolean;
}

/**
 * DataTableToolbar component that provides a user interface for table operations
 * including toggling controls visibility, displaying row counts, and access to filter/view options
 * 
 * @example
 * ```tsx
 * <DataTableToolbar 
 *   renderActions={() => <Button>Export</Button>}
 *   hideViewOptions={true}
 * />
 * ```
 */
export function DataTableToolbar({
    renderActions,
    className = "",
    controlsOpen: controlsOpenProp,
    onControlsOpenChange,
    disabled = false,
    hideRowCount = false,
    hideResetButton = false,
    hideViewOptions = false,
}: DataTableToolbarProps) {
    const {
        table,
        isLoading,
        state
    } = useDataTable();

    // Use React state for controls visibility if not provided by context
    const [internalControlsOpen, setInternalControlsOpen] = React.useState(false);

    // Use props if provided, otherwise fall back to internal state
    const controlsOpen = controlsOpenProp !== undefined ? controlsOpenProp : internalControlsOpen;
    const setControlsOpen = onControlsOpenChange || setInternalControlsOpen;

    // Get column filters from table state
    const columnFilters = table?.getState().columnFilters || [];

    // Calculate row counts for display
    const rows = useMemo(
        () => ({
            total: table?.getCoreRowModel().rows.length || 0,
            filtered: table?.getFilteredRowModel().rows.length || 0,
        }),
        [isLoading, columnFilters, table]
    );

    const filters = table?.getState().columnFilters || [];
    const hasFilters = filters.length > 0;

    return (
        <div className={`flex flex-wrap items-center justify-between gap-4 ${className}`}>
            <div className="flex flex-wrap items-center gap-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setControlsOpen(!controlsOpen)}
                                className="hidden gap-2 sm:flex"
                                disabled={disabled}
                                aria-label={controlsOpen ? "Hide controls" : "Show controls"}
                                data-testid="data-table-controls-toggle"
                            >
                                {controlsOpen ? (
                                    <>
                                        <PanelLeftClose className="h-4 w-4" />
                                        <span className="hidden md:block">Hide Controls</span>
                                    </>
                                ) : (
                                    <>
                                        <PanelLeftOpen className="h-4 w-4" />
                                        <span className="hidden md:block">Show Controls</span>
                                    </>
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>
                                Toggle controls with{" "}
                                <Kbd className="ml-1 text-muted-foreground group-hover:text-accent-foreground">
                                    <span className="mr-1">⌘</span>
                                    <span>B</span>
                                </Kbd>
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <div className="block sm:hidden">
                    <DataTableFilterControlsDrawer />
                </div>

                {!hideRowCount && (
                    <div>
                        <p className="hidden text-sm text-muted-foreground sm:block">
                            <span className="font-mono font-medium">
                                {formatCompactNumber(rows.filtered)}
                            </span>{" "}
                            of <span className="font-mono font-medium">{rows.total}</span>{" "}
                            row(s) <span className="sr-only sm:not-sr-only">filtered</span>
                        </p>
                        <p className="block text-sm text-muted-foreground sm:hidden">
                            <span className="font-mono font-medium">
                                {formatCompactNumber(rows.filtered)}
                            </span>{" "}
                            row(s)
                        </p>
                    </div>
                )}
            </div>

            <div className="ml-auto flex items-center gap-2">
                {!hideResetButton && hasFilters && <DataTableResetButton />}
                {renderActions?.()}
                {!hideViewOptions && <DataTableViewOptions />}
            </div>
        </div>
    );
} 
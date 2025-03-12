"use client";

import { Check, GripVertical, Settings2 } from "lucide-react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/popover";
import React, { useMemo, useState } from "react";
import { Sortable, SortableDragHandle, SortableItem } from "../custom/sortable";
import { useDataTable, useDataTableCallbacks } from "./core/DataTableProvider";

import { Button } from "@/components/button";
import type { Table } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

/**
 * Props for the DataTableViewOptions component
 * 
 * @template TData The data type for the table rows
 */
export interface DataTableViewOptionsProps<TData = unknown> {
    /**
     * Optional table instance to use instead of the context-provided table
     */
    table?: Table<TData>;

    /**
     * Custom class name for the component
     */
    className?: string;

    /**
     * Custom class name for the trigger button
     */
    triggerClassName?: string;

    /**
     * Custom class name for the popover content
     */
    contentClassName?: string;

    /**
     * Label to show in the command input placeholder
     * @default "Search columns..."
     */
    searchPlaceholder?: string;

    /**
     * Text to show when no column matches the search query
     * @default "No column found."
     */
    emptySearchText?: string;

    /**
     * Whether to allow column ordering via drag and drop
     * When not provided, falls back to the enableColumnOrdering from context
     */
    enableColumnOrdering?: boolean;

    /**
     * Icon to use for the trigger button
     * @default Settings2 icon from lucide-react
     */
    icon?: React.ReactNode;

    /**
     * Text to use for the trigger button's screen reader text
     * @default "Toggle column visibility"
     */
    ariaLabel?: string;

    /**
     * Whether to include an external column filter
     * @default false
     */
    includeColumnFilter?: boolean;
}

/**
 * DataTableViewOptions component that provides a UI for toggling column visibility
 * and reordering columns (when enabled)
 * 
 * @template TData The data type for the table rows
 * @example
 * ```tsx
 * <DataTableViewOptions 
 *   enableColumnOrdering={true}
 *   searchPlaceholder="Find column..."
 * />
 * ```
 */
export function DataTableViewOptions<TData = unknown>({
    table: externalTable,
    className,
    triggerClassName,
    contentClassName,
    searchPlaceholder = "Search columns...",
    emptySearchText = "No column found.",
    enableColumnOrdering: externalEnableColumnOrdering,
    icon,
    ariaLabel = "Toggle column visibility",
    includeColumnFilter = false,
}: DataTableViewOptionsProps<TData>) {
    const context = useDataTable<TData>();
    const callbacks = useDataTableCallbacks<TData>();

    // Use external table if provided, otherwise use table from context
    const table = externalTable || context.table;

    // Use external enableColumnOrdering if provided, otherwise default to false
    const enableColumnOrdering = externalEnableColumnOrdering !== undefined
        ? externalEnableColumnOrdering
        : false;

    const [open, setOpen] = useState(false);
    const [drag, setDrag] = useState(false);
    const [search, setSearch] = useState("");

    // Get the current column order
    const columnOrder = table?.getState().columnOrder || [];

    // Sort columns based on the column order
    const sortedColumns = useMemo(
        () =>
            table?.getAllColumns().sort((a, b) => {
                return columnOrder.indexOf(a.id) - columnOrder.indexOf(b.id);
            }),
        [table, columnOrder],
    );

    // Handle column visibility toggle
    const handleColumnVisibilityToggle = (columnId: string, isVisible: boolean) => {
        // Toggle visibility in the table
        table?.getColumn(columnId)?.toggleVisibility(isVisible);

        // Call the callback if provided
        if (callbacks?.onColumnVisibilityChange) {
            const visibleColumns = table?.getAllColumns()
                .filter(column => column.getIsVisible())
                .map(column => column.id);

            callbacks.onColumnVisibilityChange(columnId, isVisible);
        }
    };

    // Handle column order change
    const handleColumnOrderChange = (items: { id: string }[]) => {
        const newOrder = items.map(item => item.id);

        // Set column order in the table
        table?.setColumnOrder(newOrder);

        // Call the callback if provided
        callbacks?.onColumnOrderChange?.(newOrder);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("h-9 w-9", triggerClassName)}
                    aria-label={ariaLabel}
                    data-testid="data-table-view-options"
                >
                    {icon || <Settings2 className="h-4 w-4" />}
                    <span className="sr-only">{ariaLabel}</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                side="bottom"
                align="end"
                className={cn("w-[220px] p-0", contentClassName)}
            >
                <Command className={className}>
                    <CommandInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder={searchPlaceholder}
                    />
                    <CommandList>
                        <CommandEmpty>{emptySearchText}</CommandEmpty>
                        <CommandGroup>
                            <Sortable
                                value={sortedColumns?.map((c) => ({ id: c.id })) || []}
                                onValueChange={handleColumnOrderChange}
                                overlay={<div className="h-8 w-full rounded-md bg-muted/60" />}
                                onDragStart={() => setDrag(true)}
                                onDragEnd={() => setDrag(false)}
                                onDragCancel={() => setDrag(false)}
                            >
                                {sortedColumns
                                    ?.filter(
                                        (column) =>
                                            // Only include columns with accessorFn that can be hidden
                                            typeof column.accessorFn !== "undefined" &&
                                            column.getCanHide() &&
                                            // Filter by search if there's a search query
                                            (search
                                                ? (column.columnDef.meta?.label || column.id)
                                                    .toLowerCase()
                                                    .includes(search.toLowerCase())
                                                : true),
                                    )
                                    .map((column) => (
                                        <SortableItem key={column.id} value={column.id} asChild>
                                            <CommandItem
                                                value={column.id}
                                                onSelect={() =>
                                                    handleColumnVisibilityToggle(column.id, !column.getIsVisible())
                                                }
                                                className="capitalize"
                                                disabled={drag}
                                            >
                                                <div
                                                    className={cn(
                                                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                        column.getIsVisible()
                                                            ? "bg-primary text-primary-foreground"
                                                            : "opacity-50 [&_svg]:invisible",
                                                    )}
                                                >
                                                    <Check className={cn("h-4 w-4")} />
                                                </div>
                                                <span>{column.columnDef.meta?.label || column.id}</span>
                                                {enableColumnOrdering && !search ? (
                                                    <SortableDragHandle
                                                        variant="ghost"
                                                        size="icon"
                                                        className="ml-auto size-5 text-muted-foreground hover:text-foreground focus:bg-muted focus:text-foreground"
                                                    >
                                                        <GripVertical
                                                            className="size-4"
                                                            aria-hidden="true"
                                                        />
                                                    </SortableDragHandle>
                                                ) : null}
                                            </CommandItem>
                                        </SortableItem>
                                    ))}
                            </Sortable>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
} 
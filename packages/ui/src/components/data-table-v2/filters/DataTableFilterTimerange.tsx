"use client";

import type { DataTableTimerangeFilterField, DatePreset } from "../core/types";
import { Popover, PopoverContent, PopoverTrigger } from "../../../primitives/popover";
import React, { useEffect, useState } from "react";
import { useDataTable, useDataTableCallbacks } from "../core/DataTableProvider";

import { Button } from "../../../primitives/button";
import { Calendar } from "../../../primitives/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "../../../lib/utils";
import { format } from "date-fns";

/**
 * Props for the DataTableFilterTimerange component
 * 
 * @template TData The data type for the table rows
 */
export interface DataTableFilterTimerangeProps<TData = unknown> extends DataTableTimerangeFilterField<TData> {
    /**
     * Optional custom class name for the component container
     */
    className?: string;

    /**
     * Optional format string for displaying the date
     * @default "MMM d, yyyy"
     */
    dateFormat?: string;

    /**
     * Optional callback when date range changes
     */
    onChange?: (range: { from: Date; to: Date } | undefined) => void;

    /**
     * Optional array of date presets
     */
    presets?: DatePreset[];
}

/**
 * A date range picker component for filtering date columns in a data table
 * 
 * @template TData The data type for the table rows
 */
export function DataTableFilterTimerange<TData = unknown>({
    value: columnId,
    className,
    dateFormat = "MMM d, yyyy",
    onChange,
    presets = [
        {
            label: "Today",
            from: new Date(),
            to: new Date(),
            shortcut: "t",
        },
        {
            label: "Last 7 days",
            from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            to: new Date(),
            shortcut: "w",
        },
        {
            label: "Last 30 days",
            from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            to: new Date(),
            shortcut: "m",
        },
    ],
}: DataTableFilterTimerangeProps<TData>) {
    const { table } = useDataTable<TData>();
    const callbacks = useDataTableCallbacks<TData>();

    // Get column and current filter value
    const column = table.getColumn(columnId as string);
    const currentFilterValue = column?.getFilterValue() as { from: Date; to: Date } | undefined;

    // Local state for the date range
    const [range, setRange] = useState<{ from: Date; to: Date } | undefined>(currentFilterValue);
    const [isOpen, setIsOpen] = useState(false);

    // Update local state when filter value changes externally
    useEffect(() => {
        if (currentFilterValue) {
            setRange({
                from: new Date(currentFilterValue.from),
                to: new Date(currentFilterValue.to),
            });
        } else {
            setRange(undefined);
        }
    }, [currentFilterValue]);

    // Handle calendar selection
    const handleSelect = (date: Date | undefined) => {
        if (!date) return;

        let newRange: { from: Date; to: Date } | undefined;

        if (!range?.from) {
            // If no from date is set, set it
            newRange = { from: date, to: date };
        } else if (range.from && !range.to) {
            // If from date is set but no to date, set to date
            const from = range.from;
            const to = date;

            // Make sure from date is before to date
            if (from <= to) {
                newRange = { from, to };
            } else {
                newRange = { from: to, to: from };
            }

            // Close the popover after selecting the range
            setIsOpen(false);
        } else {
            // If both dates are set, start a new range
            newRange = { from: date, to: date };
        }

        // Update the range
        setRange(newRange);

        // Update the filter value
        if (column) {
            column.setFilterValue(newRange);
            onChange?.(newRange);
            callbacks?.onFilterChange?.(columnId as string, newRange);
        }
    };

    // Handle preset selection
    const handlePresetSelect = (preset: DatePreset) => {
        const newRange = { from: preset.from, to: preset.to };

        // Update the range
        setRange(newRange);

        // Update the filter value
        if (column) {
            column.setFilterValue(newRange);
            onChange?.(newRange);
            callbacks?.onFilterChange?.(columnId as string, newRange);
        }

        // Close the popover
        setIsOpen(false);
    };

    // Handle clearing the range
    const handleClear = () => {
        // Clear the range
        setRange(undefined);

        // Clear the filter value
        if (column) {
            column.setFilterValue(undefined);
            onChange?.(undefined);
            callbacks?.onFilterChange?.(columnId as string, undefined);
        }

        // Close the popover
        setIsOpen(false);
    };

    // Generate display text for the button
    const buttonText = range
        ? `${format(range.from, dateFormat)} - ${format(range.to, dateFormat)}`
        : "Select dates";

    return (
        <div className={cn("space-y-2", className)} data-testid={`filter-timerange-${columnId}`}>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                            "justify-start text-left w-full",
                            !range && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {buttonText}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="flex w-auto flex-col space-y-2 p-2" align="start">
                    {presets.length > 0 && (
                        <div className="flex flex-wrap gap-1 px-1 pt-1">
                            {presets.map((preset) => (
                                <Button
                                    key={preset.label}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => handlePresetSelect(preset)}
                                >
                                    {preset.label}
                                </Button>
                            ))}
                        </div>
                    )}
                    <Calendar
                        mode="range"
                        selected={{ from: range?.from, to: range?.to }}
                        onSelect={(value) => handleSelect(value?.from)}
                        numberOfMonths={1}
                        defaultMonth={range?.from || new Date()}
                    />
                    <div className="flex justify-end px-1">
                        <Button variant="ghost" size="sm" onClick={handleClear}>
                            Clear
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
} 
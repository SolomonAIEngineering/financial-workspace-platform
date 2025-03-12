"use client";

import React, { useEffect, useState } from "react";
import { useDataTable, useDataTableCallbacks } from "../core/DataTableProvider";

import type { DataTableSliderFilterField } from "../core/types";
import { Slider } from "../../../primitives/slider";
import { cn } from "../../../lib/utils";

/**
 * Props for the DataTableFilterSlider component
 * 
 * @template TData The data type for the table rows
 */
export interface DataTableFilterSliderProps<TData = unknown> extends DataTableSliderFilterField<TData> {
    /**
     * Optional custom class name for the component container
     */
    className?: string;

    /**
     * Optional class name for the value display
     */
    valueDisplayClassName?: string;

    /**
     * Optional debounce time in milliseconds
     * @default 300
     */
    debounceTime?: number;

    /**
     * Optional callback when slider value changes
     */
    onChange?: (value: [number, number]) => void;

    /**
     * Optional step value for the slider
     * @default 1
     */
    step?: number;

    /**
     * Optional format function for displaying values
     */
    formatValue?: (value: number) => string;
}

/**
 * A range slider component for filtering numeric columns in a data table
 * 
 * @template TData The data type for the table rows
 */
export function DataTableFilterSlider<TData = unknown>({
    value: columnId,
    min,
    max,
    className,
    valueDisplayClassName,
    debounceTime = 300,
    onChange,
    step = 1,
    formatValue = (value) => value.toString(),
}: DataTableFilterSliderProps<TData>) {
    const { table } = useDataTable<TData>();
    const callbacks = useDataTableCallbacks<TData>();

    // Get column and current filter value
    const column = table.getColumn(columnId as string);
    const currentFilterValue = column?.getFilterValue() as [number, number] || [min, max];

    // Local state for slider value (for debouncing)
    const [sliderValue, setSliderValue] = useState<[number, number]>(currentFilterValue);

    // Update local state when filter value changes externally
    useEffect(() => {
        if (Array.isArray(currentFilterValue) && currentFilterValue.length === 2) {
            setSliderValue(currentFilterValue);
        } else {
            setSliderValue([min, max]);
        }
    }, [currentFilterValue, min, max]);

    // Handle slider value change
    const handleValueChange = (value: [number, number]) => {
        setSliderValue(value);
    };

    // Update filter with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            // Only update if the value has changed
            if (
                column &&
                (sliderValue[0] !== currentFilterValue[0] ||
                    sliderValue[1] !== currentFilterValue[1])
            ) {
                // If the slider is at min/max, clear the filter
                const isAtExtremes = sliderValue[0] === min && sliderValue[1] === max;
                column.setFilterValue(isAtExtremes ? undefined : sliderValue);

                // Call callbacks
                onChange?.(sliderValue);
                callbacks?.onFilterChange?.(columnId as string, isAtExtremes ? undefined : sliderValue);
            }
        }, debounceTime);

        return () => clearTimeout(timer);
    }, [sliderValue, debounceTime, column, columnId, currentFilterValue, min, max, onChange, callbacks]);

    return (
        <div className={cn("space-y-2", className)} data-testid={`filter-slider-${columnId}`}>
            <div className={cn("flex justify-between text-xs text-muted-foreground", valueDisplayClassName)}>
                <div>{formatValue(sliderValue[0])}</div>
                <div>{formatValue(sliderValue[1])}</div>
            </div>
            <Slider
                min={min}
                max={max}
                step={step}
                value={sliderValue}
                onValueChange={handleValueChange as (value: number[]) => void}
                className="py-2"
                aria-label={`Filter by ${columnId} range`}
            />
        </div>
    );
} 
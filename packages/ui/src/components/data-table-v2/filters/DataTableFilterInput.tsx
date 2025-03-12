"use client";

import React, { useEffect, useState } from "react";
import { useDataTable, useDataTableCallbacks } from "../core/DataTableProvider";

import type { DataTableInputFilterField } from "../core/types";
import { Input } from "@/components/input";
import { cn } from "@/lib/utils";

/**
 * Props for the DataTableFilterInput component
 * 
 * @template TData The data type for the table rows
 */
export interface DataTableFilterInputProps<TData = unknown> extends DataTableInputFilterField<TData> {
    /**
     * Optional custom class name for the input
     */
    className?: string;

    /**
     * Optional placeholder text for the input
     * @default "Search..."
     */
    placeholder?: string;

    /**
     * Optional debounce time in milliseconds
     * @default 300
     */
    debounceTime?: number;

    /**
     * Optional callback when input value changes
     */
    onChange?: (value: string) => void;
}

/**
 * A text input component for filtering data table columns
 * 
 * @template TData The data type for the table rows
 */
export function DataTableFilterInput<TData = unknown>({
    value: columnId,
    className,
    placeholder = "Search...",
    debounceTime = 300,
    onChange,
}: DataTableFilterInputProps<TData>) {
    const { table } = useDataTable<TData>();
    const callbacks = useDataTableCallbacks<TData>();

    // Get the column and current filter value
    const column = table?.getColumn(columnId as string);
    const currentFilterValue = column?.getFilterValue() as string || "";

    // Local state for input value (for debouncing)
    const [inputValue, setInputValue] = useState(currentFilterValue);

    // Update local state when filter value changes externally
    useEffect(() => {
        setInputValue(currentFilterValue);
    }, [currentFilterValue]);

    // Update filter with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (column && inputValue !== currentFilterValue) {
                column.setFilterValue(inputValue || undefined);
                onChange?.(inputValue);
                callbacks?.onFilterChange?.(columnId as string, inputValue);
            }
        }, debounceTime);

        return () => clearTimeout(timer);
    }, [inputValue, debounceTime, column, columnId, currentFilterValue, onChange, callbacks]);

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    return (
        <Input
            type="text"
            value={inputValue}
            onChange={handleChange}
            placeholder={placeholder}
            className={cn("h-8", className)}
            aria-label={`Filter by ${String(columnId)}`}
            data-testid={`filter-input-${String(columnId)}`}
        />
    );
} 
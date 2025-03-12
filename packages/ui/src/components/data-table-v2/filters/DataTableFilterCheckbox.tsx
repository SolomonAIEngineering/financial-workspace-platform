"use client";

import type { DataTableCheckboxFilterField, Option } from "../core/types";
import React, { useMemo } from "react";
import { useDataTable, useDataTableCallbacks } from "../core/DataTableProvider";

import { Checkbox } from "../../../primitives/checkbox";
import { Label } from "../../../primitives/label";
import { cn } from "../../../lib/utils";

/**
 * Props for the DataTableFilterCheckbox component
 * 
 * @template TData The data type for the table rows
 */
export interface DataTableFilterCheckboxProps<TData = unknown> extends DataTableCheckboxFilterField<TData> {
    /**
     * Optional custom class name for the component container
     */
    className?: string;

    /**
     * Optional class name for each checkbox item
     */
    itemClassName?: string;

    /**
     * Optional callback when checkbox selection changes
     */
    onChange?: (selectedValues: string[]) => void;
}

/**
 * A checkbox group component for filtering data table columns
 * 
 * @template TData The data type for the table rows
 */
export function DataTableFilterCheckbox<TData = unknown>({
    value: columnId,
    options = [],
    component: CustomComponent,
    className,
    itemClassName,
    onChange,
}: DataTableFilterCheckboxProps<TData>) {
    const { table } = useDataTable<TData>();
    const callbacks = useDataTableCallbacks<TData>();

    // Get column and current filter value
    const column = table.getColumn(columnId as string);
    const currentFilterValue = column?.getFilterValue() as string[] || [];

    // Get unique values for the column if options are not provided
    const checkboxOptions = useMemo(() => {
        if (options && options.length > 0) return options;

        // If no options are provided, we could try to extract them from the data
        // This is a placeholder for now
        return [] as Option[];
    }, [options]);

    // Handle checkbox change
    const handleCheckboxChange = (checked: boolean, value: string) => {
        let newValues: string[];

        if (checked) {
            // Add value to the filter
            newValues = [...currentFilterValue, value];
        } else {
            // Remove value from the filter
            newValues = currentFilterValue.filter((val) => val !== value);
        }

        // Update filter in the table
        column?.setFilterValue(newValues.length ? newValues : undefined);

        // Call callbacks
        onChange?.(newValues);
        callbacks?.onFilterChange?.(columnId as string, newValues);
    };

    // If no options are available, don't render anything
    if (!checkboxOptions.length) {
        return null;
    }

    return (
        <div className={cn("flex flex-col space-y-2", className)} data-testid={`filter-checkbox-${columnId}`}>
            {checkboxOptions.map((option) => {
                const optionValue = String(option.value);
                const isChecked = currentFilterValue.includes(optionValue);

                return (
                    <div key={optionValue} className={cn("flex items-center space-x-2", itemClassName)}>
                        <Checkbox
                            id={`${columnId}-${optionValue}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => handleCheckboxChange(!!checked, optionValue)}
                        />
                        <Label
                            htmlFor={`${columnId}-${optionValue}`}
                            className="text-sm cursor-pointer"
                        >
                            {CustomComponent ? (
                                <CustomComponent {...option} />
                            ) : (
                                option.label
                            )}
                        </Label>
                    </div>
                );
            })}
        </div>
    );
} 
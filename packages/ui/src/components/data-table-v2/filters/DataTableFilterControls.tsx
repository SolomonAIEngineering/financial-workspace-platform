"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/accordion";
import React, { useMemo } from "react";
import { useDataTable, useDataTableCallbacks } from "../core/DataTableProvider";

import { DataTableFilterCheckbox } from "./DataTableFilterCheckbox";
import type { DataTableFilterField } from "../core/types";
import { DataTableFilterInput } from "./DataTableFilterInput";
import { DataTableFilterResetButton } from "./DataTableFilterResetButton";
import { DataTableFilterSlider } from "./DataTableFilterSlider";
import { DataTableFilterTimerange } from "./DataTableFilterTimerange";
import { cn } from "@/lib/utils";

/**
 * Props for the DataTableFilterControls component
 * 
 * @template TData The data type for the table rows
 */
export interface DataTableFilterControlsProps<TData = unknown> {
    /**
     * Optional custom class name for the filter controls container
     */
    className?: string;

    /**
     * Optional class name for each filter accordion item
     */
    accordionItemClassName?: string;

    /**
     * Optional class name for the accordion trigger
     */
    triggerClassName?: string;

    /**
     * Optional class name for the accordion content
     */
    contentClassName?: string;

    /**
     * Optional array of filter fields to use instead of those from context
     */
    filterFields?: DataTableFilterField<TData>[];

    /**
     * Optional array of field IDs to exclude from the filters
     */
    excludeFields?: (keyof TData)[];

    /**
     * Optional array of field IDs to include in the filters (if specified, only these will be shown)
     */
    includeFields?: (keyof TData)[];

    /**
     * Optional boolean to determine if filter reset buttons should be shown
     * @default true
     */
    showResetButtons?: boolean;

    /**
     * Optional accordion type
     * @default "multiple"
     */
    accordionType?: "single" | "multiple";

    /**
     * Optional callback when a filter accordion item is opened/closed
     */
    onFilterToggle?: (field: string, isOpen: boolean) => void;
}

/**
 * DataTableFilterControls component that renders a set of filters based on filter fields
 * Supports various filter types: checkbox, slider, input, timerange
 * 
 * @template TData The data type for the table rows
 * @example
 * ```tsx
 * <DataTableFilterControls 
 *   className="p-4"
 *   showResetButtons={false}
 * />
 * ```
 */
export function DataTableFilterControls<TData = unknown>({
    className,
    accordionItemClassName,
    triggerClassName,
    contentClassName,
    filterFields: externalFilterFields,
    excludeFields = [],
    includeFields,
    showResetButtons = true,
    accordionType = "multiple",
    onFilterToggle,
}: DataTableFilterControlsProps<TData>) {
    const { filterFields: contextFilterFields } = useDataTable<TData>();
    const callbacks = useDataTableCallbacks<TData>();

    // Use external filter fields if provided, otherwise use fields from context
    const allFilterFields = externalFilterFields || contextFilterFields || [];

    // Filter the fields based on include/exclude lists
    const filteredFields = useMemo(() => {
        let fields = [...allFilterFields];

        // If includeFields is specified, only include those fields
        if (includeFields && includeFields.length > 0) {
            fields = fields.filter(field =>
                includeFields.includes(field.value as keyof TData)
            );
        }

        // Exclude specified fields
        if (excludeFields && excludeFields.length > 0) {
            fields = fields.filter(field =>
                !excludeFields.includes(field.value as keyof TData)
            );
        }

        return fields;
    }, [allFilterFields, includeFields, excludeFields]);

    // Handle accordion value change
    const handleAccordionValueChange = (value: string[]) => {
        if (!onFilterToggle) return;

        // For each filter field, determine if it's now open or closed
        filteredFields.forEach((field) => {
            const fieldValue = field.value as string;
            const isOpen = value.includes(fieldValue);
            onFilterToggle(fieldValue, isOpen);
        });
    };

    // If there are no filter fields, don't render anything
    if (!filteredFields.length) {
        return null;
    }

    return (
        <div className={cn("w-full", className)} data-testid="data-table-filter-controls">
            <Accordion
                type={accordionType}
                defaultValue={filteredFields
                    .filter(({ defaultOpen }) => defaultOpen)
                    .map(({ value }) => value as string)}
                onValueChange={accordionType === "multiple" ? handleAccordionValueChange : undefined}
            >
                {filteredFields.map((field) => {
                    const value = field.value as string;
                    return (
                        <AccordionItem
                            key={value}
                            value={value}
                            className={cn("border-none", accordionItemClassName)}
                        >
                            <AccordionTrigger
                                className={cn(
                                    "w-full px-2 py-0 hover:no-underline",
                                    "data-[state=closed]:text-muted-foreground data-[state=open]:text-foreground",
                                    "focus-within:data-[state=closed]:text-foreground hover:data-[state=closed]:text-foreground",
                                    triggerClassName
                                )}
                            >
                                <div className="flex w-full items-center justify-between gap-2 truncate py-2 pr-2">
                                    <div className="flex items-center gap-2 truncate">
                                        <p className="text-sm font-medium">{field.label}</p>
                                        {value !== field.label.toLowerCase() && !field.commandDisabled ? (
                                            <p className="mt-px truncate font-mono text-[10px] text-muted-foreground">
                                                {value}
                                            </p>
                                        ) : null}
                                    </div>
                                    {showResetButtons && (
                                        <DataTableFilterResetButton<TData>
                                            {...field as any}
                                        />
                                    )}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className={contentClassName}>
                                {/* Avoid focus state being cut due to overflow-hidden */}
                                <div className="p-1">
                                    {(() => {
                                        switch (field.type) {
                                            case "checkbox": {
                                                return <DataTableFilterCheckbox {...field} />;
                                            }
                                            case "slider": {
                                                return <DataTableFilterSlider {...field} />;
                                            }
                                            case "input": {
                                                return <DataTableFilterInput {...field} />;
                                            }
                                            case "timerange": {
                                                return <DataTableFilterTimerange {...field} />;
                                            }
                                            default: {
                                                // Type guard
                                                return null;
                                            }
                                        }
                                    })()}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </div>
    );
} 
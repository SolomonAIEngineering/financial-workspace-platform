"use client";

import type { ColumnSchema, FacetMetadataSchema } from "./schema";
import { LEVELS, getLevelColor } from "./constants";
import React, { useCallback, useEffect, useMemo } from "react";

import type { DataTableFilterField } from "../../data-table-v2/core/types";
import { SearchParamsType } from "../utils/searchParams";
import type { Table } from "@tanstack/react-table";
import { cn } from "../../../lib/utils";
import { useInfiniteQuery } from "./useInfiniteQuery";

/**
 * Props for the InfiniteClient component
 */
export interface InfiniteClientProps {
    /**
     * Initial search parameters for the infinite query
     */
    initialSearchParams?: Partial<SearchParamsType>;

    /**
     * API endpoint for fetching data
     * @default "/api/infinite"
     */
    apiEndpoint?: string;

    /**
     * Filter fields for the data table
     */
    defaultFilterFields?: DataTableFilterField<ColumnSchema>[];

    /**
     * Sheet fields for detail view
     */
    sheetFields?: Array<{
        label: string;
        value: keyof ColumnSchema | string;
    }>;

    /**
     * Render function for LiveRow indicator component
     */
    renderLiveRow?: (props: { row: any }) => React.ReactNode;

    /**
     * Column definitions for the data table
     */
    columns?: any[];

    /**
     * Optional className for the component
     */
    className?: string;
}

/**
 * InfiniteClient component that handles data fetching and state management for infinite data tables
 * 
 * @example
 * ```tsx
 * <InfiniteClient 
 *   initialSearchParams={{ size: 100 }}
 *   apiEndpoint="/api/logs" 
 *   defaultFilterFields={filterFields}
 * />
 * ```
 */
export function InfiniteClient({
    initialSearchParams,
    apiEndpoint = "/api/infinite",
    defaultFilterFields = [],
    sheetFields = [],
    renderLiveRow,
    columns = [],
    className,
}: InfiniteClientProps) {
    // Use our custom infinite query hook
    const {
        data: flatData,
        metadata,
        isLoading,
        isFetching,
        fetchNextPage,
        fetchPreviousPage,
        refetch,
        searchParams,
        liveMode,
        liveAnchorRow,
        liveTimestamp,
    } = useInfiniteQuery({
        initialSearchParams,
        apiEndpoint,
    });

    // Extract data from the query response
    const {
        totalRowCount,
        filterRowCount,
        chartData,
        facets,
        totalFetched
    } = metadata;

    // Extract filter parameters from search params
    const { sort, start, size, uuid, cursor, direction, live, ...filter } = searchParams;

    // Process filter fields with facet data
    const filterFields = useMemo(() => {
        return defaultFilterFields.map((field) => {
            const facetsField = facets?.[field.value];
            if (!facetsField) return field;
            if (field.options && field.options.length > 0) return field;

            // If no options are set, populate them from the API data
            const options = facetsField.rows.map(({ value }) => {
                return {
                    label: `${value}`,
                    value,
                };
            });

            if (field.type === "slider") {
                return {
                    ...field,
                    min: facetsField.min ?? field.min,
                    max: facetsField.max ?? field.max,
                    options,
                };
            }

            return { ...field, options };
        });
    }, [facets, defaultFilterFields]);

    // Helper function to get row className based on level
    const getRowClassName = useCallback((row: any) => {
        if (!row?.original) return "";

        const rowTimestamp = row.original.date.getTime();
        const isPast = rowTimestamp <= (liveTimestamp || -1);

        let levelClassName = "";
        if (row.original.level && LEVELS.includes(row.original.level)) {
            const { bg } = getLevelColor(row.original.level);
            levelClassName = `hover:${bg}/10`;
        }

        return cn(levelClassName, isPast ? "opacity-50" : "opacity-100");
    }, [liveTimestamp]);

    // Helper function to get facet unique values
    const getFacetedUniqueValues = useCallback(
        <TData,>(facets?: Record<string, FacetMetadataSchema>) => {
            return (_: Table<TData>, columnId: string): Map<string, number> => {
                return new Map(
                    facets?.[columnId]?.rows?.map(({ value, total }) => [value, total]) || [],
                );
            };
        },
        []
    );

    // Helper function to get facet min/max values
    const getFacetedMinMaxValues = useCallback(
        <TData,>(facets?: Record<string, FacetMetadataSchema>) => {
            return (_: Table<TData>, columnId: string): [number, number] | undefined => {
                const min = facets?.[columnId]?.min;
                const max = facets?.[columnId]?.max;
                if (min && max) return [min, max];
                if (min) return [min, min];
                if (max) return [max, max];
                return undefined;
            };
        },
        []
    );

    // Define the default column filters from search params
    const defaultColumnFilters = Object.entries(filter)
        .map(([key, value]) => ({
            id: key,
            value,
        }))
        .filter(({ value }) => value !== null && value !== undefined);

    // Define the default column sorting from search params
    const defaultColumnSorting = sort ? [sort] : undefined;

    // Define the default row selection from search params
    const defaultRowSelection = uuid ? { [uuid]: true } : undefined;

    // Return data to be used by DataTableInfinite
    return {
        columns,
        data: flatData,
        totalRows: totalRowCount,
        filterRows: filterRowCount,
        totalRowsFetched: totalFetched,
        defaultColumnFilters,
        defaultColumnSorting,
        defaultRowSelection,
        defaultColumnVisibility: {
            uuid: false,
            "timing.dns": false,
            "timing.connection": false,
            "timing.tls": false,
            "timing.ttfb": false,
            "timing.transfer": false,
        },
        metadata,
        filterFields,
        sheetFields,
        isFetching,
        isLoading,
        fetchNextPage,
        fetchPreviousPage,
        refetch,
        chartData,
        getRowClassName,
        getRowId: (row: ColumnSchema) => row.uuid,
        getFacetedUniqueValues: getFacetedUniqueValues(facets),
        getFacetedMinMaxValues: getFacetedMinMaxValues(facets),
        renderLiveRow: renderLiveRow ? (props: any) => {
            if (!liveTimestamp) return null;
            if (props?.row.original.uuid !== liveAnchorRow?.uuid) return null;
            return renderLiveRow(props);
        } : undefined,
    };
} 
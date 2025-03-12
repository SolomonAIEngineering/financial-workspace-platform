"use client";

import { useCallback, useEffect, useState } from "react";

import type { ColumnSchema } from "./schema";
import { InfiniteQueryResponse } from "../utils/queryOptions";
import type { SearchParamsType } from "../utils/searchParams";
import { createQueryOptions } from "../utils/queryOptions";
import { useInfiniteQuery as useInfiniteTanstackQuery } from "@tanstack/react-query";

/**
 * Props for the useInfiniteQuery hook
 */
export interface UseInfiniteQueryProps {
    /**
     * Initial search parameters
     */
    initialSearchParams?: Partial<SearchParamsType>;

    /**
     * API endpoint for fetching data
     * @default "/api/infinite"
     */
    apiEndpoint?: string;

    /**
     * Whether to enable live mode by default
     * @default false
     */
    defaultLiveMode?: boolean;

    /**
     * Interval for live mode refreshes in milliseconds
     * @default 5000
     */
    liveRefreshInterval?: number;
}

/**
 * Hook for using infinite queries with search parameters and live mode support
 * 
 * @param props Configuration props for the hook
 * @returns An object containing the query result and search state management
 */
export function useInfiniteQuery<TData extends object = ColumnSchema[]>({
    initialSearchParams = {},
    apiEndpoint = "/api/infinite",
    defaultLiveMode = false,
    liveRefreshInterval = 5000,
}: UseInfiniteQueryProps = {}) {
    // Create default search params with the initial values
    const defaultSearchParams: SearchParamsType = {
        level: [],
        latency: [],
        "timing.dns": [],
        "timing.connection": [],
        "timing.tls": [],
        "timing.ttfb": [],
        "timing.transfer": [],
        status: [],
        regions: [],
        method: [],
        host: undefined,
        pathname: undefined,
        date: [],
        sort: null,
        size: 40,
        start: 0,
        direction: "next",
        cursor: new Date(),
        live: defaultLiveMode,
        uuid: undefined,
        ...initialSearchParams,
    };

    // State for search parameters
    const [searchParams, setSearchParams] = useState<SearchParamsType>(defaultSearchParams);

    // Create query options
    const queryOptions = createQueryOptions<TData>(searchParams, apiEndpoint);

    // Use TanStack query
    const query = useInfiniteTanstackQuery<InfiniteQueryResponse<TData>>(queryOptions);

    // Handle live mode refreshing
    useEffect(() => {
        if (!searchParams.live) return;

        const intervalId = setInterval(() => {
            query.refetch();
        }, liveRefreshInterval);

        return () => clearInterval(intervalId);
    }, [searchParams.live, query, liveRefreshInterval]);

    // Flattened data for easier consumption
    const flatData = query.data?.pages.flatMap(page => page.data) || [];

    // Extract metadata from the last page
    const lastPage = query.data?.pages[query.data.pages.length - 1];
    const metadata = {
        totalRowCount: lastPage?.meta?.totalRowCount || 0,
        filterRowCount: lastPage?.meta?.filterRowCount || 0,
        chartData: lastPage?.meta?.chartData || [],
        facets: lastPage?.meta?.facets || {},
        currentPercentiles: lastPage?.meta?.metadata?.currentPercentiles || {},
        totalFetched: flatData.length,
    };

    // Handle live mode
    const liveTimestampRef = { current: searchParams.live ? new Date().getTime() : undefined };

    useEffect(() => {
        if (searchParams.live) {
            liveTimestampRef.current = new Date().getTime();
        } else {
            liveTimestampRef.current = undefined;
        }
    }, [searchParams.live]);

    // Find anchor row for live mode
    const findLiveAnchorRow = useCallback(() => {
        if (!searchParams.live) return undefined;

        return flatData.find(item => {
            if (!liveTimestampRef.current) return true;
            if ('date' in item && item.date instanceof Date) {
                return item.date.getTime() <= liveTimestampRef.current;
            }
            return true;
        });
    }, [searchParams.live, flatData]);

    // Update search params
    const updateSearchParams = useCallback((newParams: Partial<SearchParamsType>) => {
        setSearchParams(prev => ({
            ...prev,
            ...newParams,
        }));
    }, []);

    // Set live mode
    const setLiveMode = useCallback((live: boolean) => {
        updateSearchParams({ live });
    }, [updateSearchParams]);

    // Reset search params
    const resetSearchParams = useCallback(() => {
        setSearchParams(defaultSearchParams);
    }, [defaultSearchParams]);

    return {
        // Query results
        query,
        data: flatData,
        metadata,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        fetchNextPage: query.fetchNextPage,
        fetchPreviousPage: query.fetchPreviousPage,
        refetch: query.refetch,

        // Search params management
        searchParams,
        updateSearchParams,
        resetSearchParams,

        // Live mode
        liveMode: searchParams.live,
        setLiveMode,
        liveAnchorRow: findLiveAnchorRow(),
        liveTimestamp: liveTimestampRef.current,
    };
} 
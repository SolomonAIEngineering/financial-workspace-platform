import { serializeSearchParams, type SearchParamsType } from "./searchParams";
import type { BaseChartSchema, ColumnSchema, FacetMetadataSchema } from "../core/schema";

/**
 * Type for percentile values
 */
export type Percentile = 50 | 75 | 90 | 95 | 99;

/**
 * Metadata specific to logs queries
 */
export type LogsMeta = {
    currentPercentiles: Record<Percentile, number>;
};

/**
 * Generic metadata for infinite queries
 * @template TMeta Additional metadata type
 */
export type InfiniteQueryMeta<TMeta = Record<string, unknown>> = {
    totalRowCount: number;
    filterRowCount: number;
    chartData: BaseChartSchema[];
    facets: Record<string, FacetMetadataSchema>;
    metadata?: TMeta;
};

/**
 * Response structure for infinite queries
 * @template TData The data type
 */
export type InfiniteQueryResponse<TData = ColumnSchema[]> = {
    data: TData;
    meta: InfiniteQueryMeta<LogsMeta>;
    prevCursor: number | null;
    nextCursor: number | null;
};

/**
 * Options for creating a TanStack Query configuration
 * @param search The search parameters
 * @param apiEndpoint The API endpoint to fetch data from
 * @returns Options for creating an infinite query
 */
export function createQueryOptions<TResponseData = ColumnSchema[]>(
    search: SearchParamsType,
    apiEndpoint: string
) {
    return {
        queryKey: [
            "data-table",
            // Remove uuid/live from the query key as they would otherwise retrigger a fetch
            { ...search, uuid: null, live: null },
        ],
        queryFn: async ({ pageParam }: { pageParam: { cursor: number; direction: "next" | "prev" } }) => {
            const cursor = new Date(pageParam.cursor);
            const direction = pageParam.direction;

            // Create the query parameters
            const queryParams = {
                ...search,
                cursor,
                direction,
                uuid: null,
                live: null,
            };

            // Serialize the query parameters
            const serializedParams = serializeSearchParams(queryParams);

            // Fetch the data
            const response = await fetch(`${apiEndpoint}${serializedParams}`);

            if (!response.ok) {
                throw new Error(`Error fetching data: ${response.statusText}`);
            }

            // Parse the response
            const data = await response.json();

            return data as InfiniteQueryResponse<TResponseData>;
        },
        initialPageParam: { cursor: new Date().getTime(), direction: "next" as const },
        getPreviousPageParam: (firstGroup: InfiniteQueryResponse<TResponseData>) => {
            if (!firstGroup.prevCursor) return null;
            return { cursor: firstGroup.prevCursor, direction: "prev" as const };
        },
        getNextPageParam: (lastGroup: InfiniteQueryResponse<TResponseData>) => {
            if (!lastGroup.nextCursor) return null;
            return { cursor: lastGroup.nextCursor, direction: "next" as const };
        },
        refetchOnWindowFocus: false,
    };
}

/**
 * Calculate percentile from a sorted array of numbers
 * @param values Sorted array of values
 * @param percentile The percentile to calculate (0-100)
 * @returns The calculated percentile value
 */
export function calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;

    // Ensure values are sorted
    const sortedValues = [...values].sort((a, b) => a - b);

    const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, index)];
}

/**
 * Calculate specific percentiles from a data set
 * @param values Array of values
 * @param percentiles Array of percentiles to calculate
 * @returns Record of percentile values
 */
export function calculateSpecificPercentiles(
    values: number[],
    percentiles: Percentile[] = [50, 75, 90, 95, 99]
): Record<Percentile, number> {
    // Sort the values once for efficiency
    const sortedValues = [...values].sort((a, b) => a - b);

    return percentiles.reduce((acc, percentile) => {
        acc[percentile] = calculatePercentile(sortedValues, percentile);
        return acc;
    }, {} as Record<Percentile, number>);
} 
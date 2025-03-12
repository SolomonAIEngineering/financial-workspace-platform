import { ARRAY_DELIMITER, LEVELS, METHODS, RANGE_DELIMITER, REGIONS, SLIDER_DELIMITER } from "../core/constants";

// Sort delimiter constant
export const SORT_DELIMITER = ".";

/**
 * Parse a sort string in the format "field.order" (e.g., "latency.desc")
 * @param queryValue The sort string to parse
 * @returns An object with id and desc properties, or null if invalid
 */
export function parseSort(queryValue: string) {
    if (!queryValue) return null;
    const [id, desc] = queryValue.split(SORT_DELIMITER);
    if (!id) return null;
    return { id, desc: desc === "desc" };
}

/**
 * Serialize a sort object into a string
 * @param value The sort object to serialize
 * @returns A string in the format "field.order" (e.g., "latency.desc")
 */
export function serializeSort(value: { id: string; desc: boolean }) {
    return `${value.id}${SORT_DELIMITER}${value.desc ? "desc" : "asc"}`;
}

/**
 * Parse a string array from a delimited string
 * @param value The delimited string to parse
 * @param delimiter The delimiter to use (default: comma)
 * @returns An array of strings
 */
export function parseStringArray(value: string, delimiter = ARRAY_DELIMITER): string[] {
    if (!value) return [];
    return value.split(delimiter);
}

/**
 * Parse a number array from a delimited string
 * @param value The delimited string to parse
 * @param delimiter The delimiter to use (default: colon)
 * @returns An array of numbers
 */
export function parseNumberArray(value: string, delimiter = SLIDER_DELIMITER): number[] {
    if (!value) return [];
    return value.split(delimiter).map(Number);
}

/**
 * Parse a date array from a delimited string of timestamps
 * @param value The delimited string to parse
 * @param delimiter The delimiter to use (default: tilde)
 * @returns An array of dates
 */
export function parseDateArray(value: string, delimiter = RANGE_DELIMITER): Date[] {
    if (!value) return [];
    return value.split(delimiter).map(ts => new Date(Number(ts)));
}

/**
 * Parse a string value, ensuring it's in a given set of allowed values
 * @param value The string to parse
 * @param allowedValues The allowed values
 * @returns The validated string value or undefined if not allowed
 */
export function parseStringLiteral<T extends readonly string[]>(
    value: string,
    allowedValues: T
): T[number] | undefined {
    if (!value) return undefined;
    return allowedValues.includes(value as any) ? (value as T[number]) : undefined;
}

/**
 * Helper for parsing search params into a structured object
 * @param searchParams The URL search params or object of string values
 * @returns A structured object with parsed values
 */
export function parseSearchParams(
    searchParams: URLSearchParams | Record<string, string | string[] | undefined>
): {
    level: (typeof LEVELS)[number][];
    latency: number[];
    "timing.dns": number[];
    "timing.connection": number[];
    "timing.tls": number[];
    "timing.ttfb": number[];
    "timing.transfer": number[];
    status: number[];
    regions: (typeof REGIONS)[number][];
    method: (typeof METHODS)[number][];
    host: string | undefined;
    pathname: string | undefined;
    date: Date[];
    sort: { id: string; desc: boolean } | null;
    size: number;
    start: number;
    direction: "prev" | "next";
    cursor: Date;
    live: boolean;
    uuid: string | undefined;
} {
    // Helper to get a value from either URLSearchParams or an object
    const getValue = (key: string): string | undefined => {
        if (searchParams instanceof URLSearchParams) {
            return searchParams.get(key) || undefined;
        }
        const value = searchParams[key];
        return Array.isArray(value) ? value[0] : value;
    };

    return {
        // CUSTOM FILTERS
        level: getValue("level")
            ? parseStringArray(getValue("level")!)
                .filter(value => LEVELS.includes(value as any))
                .map(value => value as (typeof LEVELS)[number])
            : [],
        latency: getValue("latency") ? parseNumberArray(getValue("latency")!) : [],
        "timing.dns": getValue("timing.dns") ? parseNumberArray(getValue("timing.dns")!) : [],
        "timing.connection": getValue("timing.connection") ? parseNumberArray(getValue("timing.connection")!) : [],
        "timing.tls": getValue("timing.tls") ? parseNumberArray(getValue("timing.tls")!) : [],
        "timing.ttfb": getValue("timing.ttfb") ? parseNumberArray(getValue("timing.ttfb")!) : [],
        "timing.transfer": getValue("timing.transfer") ? parseNumberArray(getValue("timing.transfer")!) : [],
        status: getValue("status") ? parseNumberArray(getValue("status")!) : [],
        regions: getValue("regions")
            ? parseStringArray(getValue("regions")!)
                .filter(value => REGIONS.includes(value as any))
                .map(value => value as (typeof REGIONS)[number])
            : [],
        method: getValue("method")
            ? parseStringArray(getValue("method")!)
                .filter(value => METHODS.includes(value as any))
                .map(value => value as (typeof METHODS)[number])
            : [],
        host: getValue("host"),
        pathname: getValue("pathname"),
        date: getValue("date") ? parseDateArray(getValue("date")!) : [],

        // SORTING & PAGINATION
        sort: getValue("sort") ? parseSort(getValue("sort")!) : null,
        size: getValue("size") ? parseInt(getValue("size")!, 10) : 40,
        start: getValue("start") ? parseInt(getValue("start")!, 10) : 0,

        // INFINITE SCROLLING
        direction: getValue("direction") === "prev" ? "prev" : "next",
        cursor: getValue("cursor") ? new Date(Number(getValue("cursor"))) : new Date(),
        live: getValue("live") === "true",

        // SELECTION
        uuid: getValue("uuid"),
    };
}

/**
 * Serialize search params into a URL query string
 * @param params The params object to serialize
 * @returns A URL query string
 */
export function serializeSearchParams(params: Record<string, any>): string {
    const urlSearchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined) return;

        if (key === "sort" && value) {
            urlSearchParams.set(key, serializeSort(value));
        } else if (Array.isArray(value) && value.length > 0) {
            if (key === "date") {
                // Date array needs special handling
                const dateValues = value.map((date: Date) => date.getTime());
                urlSearchParams.set(key, dateValues.join(RANGE_DELIMITER));
            } else if (["latency", "timing.dns", "timing.connection", "timing.tls", "timing.ttfb", "timing.transfer"].includes(key)) {
                // Number arrays for sliders use a different delimiter
                urlSearchParams.set(key, value.join(SLIDER_DELIMITER));
            } else {
                // String arrays
                urlSearchParams.set(key, value.join(ARRAY_DELIMITER));
            }
        } else if (key === "cursor" && value instanceof Date) {
            urlSearchParams.set(key, String(value.getTime()));
        } else if (typeof value === "boolean") {
            urlSearchParams.set(key, String(value));
        } else if (value !== "") {
            urlSearchParams.set(key, String(value));
        }
    });

    return `?${urlSearchParams.toString()}`;
}

export type SearchParamsType = ReturnType<typeof parseSearchParams>; 
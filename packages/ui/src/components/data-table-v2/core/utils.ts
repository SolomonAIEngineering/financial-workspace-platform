import { type ColumnFiltersState } from "@tanstack/react-table";
import { z } from "zod";

import { type DataTableFilterField } from "./types";

/**
 * Delimiter constants for serializing various filter types
 */
export const ARRAY_DELIMITER = ",";
export const RANGE_DELIMITER = "~";
export const SLIDER_DELIMITER = ":";

/**
 * Deserializes a string into an object based on the provided schema
 * 
 * @template T - Zod schema type
 * @param {T} schema - The Zod schema to validate against
 * @returns A function that parses a string into an object matching the schema
 * @example
 * ```
 * const userSchema = z.object({ name: z.string(), age: z.number() });
 * const parser = deserialize(userSchema);
 * const result = parser("name:John age:30");
 * // result.data = { name: "John", age: 30 }
 * ```
 */
export function deserialize<T extends z.AnyZodObject>(schema: T) {
    const castToSchema = z.preprocess((val) => {
        if (typeof val !== "string") return val;
        return val
            .trim()
            .split(" ")
            .reduce(
                (prev, curr) => {
                    const [name, value] = curr.split(":");
                    if (!value || !name) return prev;
                    prev[name] = value;
                    return prev;
                },
                {} as Record<string, unknown>,
            );
    }, schema);

    /**
     * Parses a string into an object matching the schema
     * 
     * @param {string} value - The string to parse
     * @returns The parsed and validated object
     */
    return (value: string) => castToSchema.safeParse(value);
}

/**
 * Serializes column filters into a string format suitable for command input or URL parameters
 * 
 * @template TData - Type for the table data
 * @param {ColumnFiltersState} columnFilters - The current state of column filters
 * @param {DataTableFilterField<TData>[]} filterFields - The filter field definitions
 * @returns {string} A serialized string representation of the filters
 * @example
 * ```
 * const filters = [
 *   { id: "name", value: "John" },
 *   { id: "age", value: [20, 30] }
 * ];
 * const result = serializeColumnFilters(filters, filterFields);
 * // result = "name:John age:20:30 "
 * ```
 */
export function serializeColumnFilters<TData>(
    columnFilters: ColumnFiltersState,
    filterFields?: DataTableFilterField<TData>[],
): string {
    return columnFilters.reduce((prev, curr) => {
        const field = filterFields?.find((field) => curr.id === field.value);
        const { type, commandDisabled } = field || { commandDisabled: true };

        // If column filter is not found or explicitly disabled for command, skip it
        if (commandDisabled) return prev;

        if (Array.isArray(curr.value)) {
            if (type === "slider") {
                return `${prev}${curr.id}:${curr.value.join(SLIDER_DELIMITER)} `;
            }
            if (type === "checkbox") {
                return `${prev}${curr.id}:${curr.value.join(ARRAY_DELIMITER)} `;
            }
            if (type === "timerange") {
                return `${prev}${curr.id}:${curr.value.join(RANGE_DELIMITER)} `;
            }
        }

        return `${prev}${curr.id}:${curr.value} `;
    }, "");
}

/**
 * Formats a date as a string in the format YYYY-MM-DD
 * 
 * @param {Date} date - The date to format
 * @returns {string} The formatted date string
 */
export function formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
}

/**
 * Checks if two arrays have the same values, regardless of order
 * 
 * @template T - The type of array elements
 * @param {T[]} a - The first array
 * @param {T[]} b - The second array
 * @returns {boolean} True if arrays have the same values
 */
export function haveSameValues<T>(a: T[], b: T[]): boolean {
    if (a.length !== b.length) return false;
    const setA = new Set(a);
    return b.every(value => setA.has(value));
}

/**
 * Generates a unique ID for use in tables
 * 
 * @returns {string} A unique ID string
 */
export function generateUniqueId(): string {
    return `id-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Formats a number with commas as thousands separators
 * 
 * @param {number} num - The number to format
 * @returns {string} The formatted number string
 */
export function formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Extracts a subset of properties from an object
 * 
 * @template T - The source object type
 * @template K - The keys to pick
 * @param {T} obj - The source object
 * @param {K[]} keys - The keys to pick
 * @returns {Pick<T, K>} A new object with only the picked properties
 */
export function pick<T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
): Pick<T, K> {
    return keys.reduce((result, key) => {
        if (key in obj) {
            result[key] = obj[key];
        }
        return result;
    }, {} as Pick<T, K>);
} 
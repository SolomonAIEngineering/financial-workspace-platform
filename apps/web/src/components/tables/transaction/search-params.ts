/**
 * @file search-params.ts
 * @description Defines URL search parameter parsing logic for transactions.
 * This file handles the conversion between URL search parameters and strongly typed
 * filter values used in the data table and other components. It uses the nuqs library
 * for type-safe URL query state management.
 */

// Note: import from 'nuqs/server' to avoid the "use client" directive
import {
  ARRAY_DELIMITER,
  RANGE_DELIMITER,
  SLIDER_DELIMITER,
} from "@/lib/delimiters";
import {
  createParser,
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  parseAsTimestamp,
} from "nuqs/server";

import { REGIONS } from "@/constants/region";
import { TAGS } from "@/constants/tag";

/**
 * Custom parser for sorting parameters.
 * Parses and serializes sort parameters in the format "field.direction" (e.g., "amount.desc").
 * 
 * @returns A parser that converts between URL string and sort configuration object
 * 
 * @example
 * ```tsx
 * // Parse from URL "amount.desc" to { id: "amount", desc: true }
 * const sortConfig = parseAsSort.parseServerSide("amount.desc");
 * 
 * // Serialize from object to URL string
 * const queryString = parseAsSort.serialize({ id: "title", desc: false }); // "title.asc"
 * ```
 */
export const parseAsSort = createParser({
  parse(queryValue) {
    const [id, desc] = queryValue.split(".");
    if (!id && !desc) return null;
    return { id, desc: desc === "desc" };
  },
  serialize(value) {
    return `${value.id}.${value.desc ? "desc" : "asc"}`;
  },
});

/**
 * Configuration object for all search parameters used in transactions.
 * Defines how each parameter should be parsed from and serialized to URL search parameters.
 * 
 * Parameters include:
 * - Filter parameters (url, regions, tags, etc.)
 * - Sorting configuration
 * - Selection tracking
 * 
 * @remarks
 * This configuration enables consistent state management between client-side state
 * and URL parameters, allowing for bookmarkable and shareable filter states.
 */
export const searchParamsParser = {
  // FILTERS
  url: parseAsString,
  p95: parseAsArrayOf(parseAsInteger, SLIDER_DELIMITER),
  public: parseAsArrayOf(parseAsBoolean, ARRAY_DELIMITER),
  active: parseAsArrayOf(parseAsBoolean, ARRAY_DELIMITER),
  regions: parseAsArrayOf(parseAsStringLiteral(REGIONS), ARRAY_DELIMITER),
  tags: parseAsArrayOf(parseAsStringLiteral(TAGS), ARRAY_DELIMITER),
  date: parseAsArrayOf(parseAsTimestamp, RANGE_DELIMITER),
  // REQUIRED FOR SORTING & SELECTION
  sort: parseAsSort,
  uuid: parseAsString,
};

/**
 * Cached search params parser for better performance.
 * This cache enables efficient parsing of URL parameters without unnecessary re-parsing.
 * 
 * @example
 * ```tsx
 * // Use in a component to parse search params
 * import { useSearchParams } from 'next/navigation';
 * 
 * function FilterPanel() {
 *   const searchParams = useSearchParams();
 *   const filters = searchParamsCache.parse(searchParams);
 *   
 *   return (
 *     <div>
 *       {filters.tags?.map(tag => <Badge key={tag}>{tag}</Badge>)}
 *     </div>
 *   );
 * }
 * ```
 */
export const searchParamsCache = createSearchParamsCache(searchParamsParser);

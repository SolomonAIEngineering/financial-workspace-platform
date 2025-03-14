/**
 * Defines URL search parameter parsing logic for recurring transactions. This
 * file handles the conversion between URL search parameters and strongly typed
 * filter values used in the data table and other components. It uses the nuqs
 * library for type-safe URL query state management.
 *
 * @file Search-params.ts
 */

// Note: import from 'nuqs/server' to avoid the "use client" directive
import {
  ARRAY_DELIMITER,
  RANGE_DELIMITER,
  SLIDER_DELIMITER,
} from '@/lib/delimiters';
import {
  IMPORTANCE_LEVELS,
  RECURRING_TRANSACTION_STATUSES,
  RECURRING_TRANSACTION_TYPES,
  TRANSACTION_FREQUENCIES,
} from './schema';
import {
  createParser,
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  parseAsTimestamp,
} from 'nuqs/server';

/**
 * Custom parser for sorting parameters. Parses and serializes sort parameters
 * in the format "field.direction" (e.g., "amount.desc").
 *
 * @example
 *   ```tsx
 *   // Parse from URL "amount.desc" to { id: "amount", desc: true }
 *   const sortConfig = parseAsSort.parseServerSide("amount.desc");
 *
 *   // Serialize from object to URL string
 *   const queryString = parseAsSort.serialize({ id: "title", desc: false }); // "title.asc"
 *   ```;
 *
 * @returns A parser that converts between URL string and sort configuration
 *   object
 */
export const parseAsSort = createParser({
  parse(queryValue) {
    const [id, desc] = queryValue.split('.');
    if (!id && !desc) return null;
    return { id, desc: desc === 'desc' };
  },
  serialize(value) {
    return `${value.id}.${value.desc ? 'desc' : 'asc'}`;
  },
});

/**
 * Configuration object for all search parameters used in recurring
 * transactions. Defines how each parameter should be parsed from and serialized
 * to URL search parameters.
 *
 * Parameters include:
 *
 * - Filter parameters (status, type, frequency, etc.)
 * - Sorting configuration
 * - Selection tracking
 *
 * @remarks
 *   This configuration enables consistent state management between client-side
 *   state and URL parameters, allowing for bookmarkable and shareable filter
 *   states.
 */
export const searchParamsParser = {
  // FILTERS
  status: parseAsArrayOf(
    parseAsStringLiteral(RECURRING_TRANSACTION_STATUSES),
    ARRAY_DELIMITER
  ),
  transactionType: parseAsArrayOf(
    parseAsStringLiteral(RECURRING_TRANSACTION_TYPES),
    ARRAY_DELIMITER
  ),
  frequency: parseAsArrayOf(
    parseAsStringLiteral(TRANSACTION_FREQUENCIES),
    ARRAY_DELIMITER
  ),
  importanceLevel: parseAsArrayOf(
    parseAsStringLiteral(IMPORTANCE_LEVELS),
    ARRAY_DELIMITER
  ),
  amount: parseAsArrayOf(parseAsInteger, SLIDER_DELIMITER),
  nextScheduledDate: parseAsArrayOf(parseAsTimestamp, RANGE_DELIMITER),
  bankAccountId: parseAsString,
  merchantName: parseAsString,
  // REQUIRED FOR SORTING & SELECTION
  sort: parseAsSort,
  uuid: parseAsString,
};

/**
 * Cached search params parser for better performance. This cache enables
 * efficient parsing of URL parameters without unnecessary re-parsing.
 *
 * @example
 *   ```tsx
 *   // Use in a component to parse search params
 *   import { useSearchParams } from 'next/navigation';
 *
 *   function FilterPanel() {
 *     const searchParams = useSearchParams();
 *     const filters = searchParamsCache.parse(searchParams);
 *
 *     return (
 *       <div>
 *         {filters.status?.map(status => <Badge key={status}>{status}</Badge>)}
 *       </div>
 *     );
 *   }
 *   ```;
 */
export const searchParamsCache = createSearchParamsCache(searchParamsParser);

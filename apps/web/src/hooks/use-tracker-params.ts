import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';

import { formatISO } from 'date-fns';

/**
 * UseTrackerParams Hook
 *
 * This hook manages URL query parameters for tracking and filtering
 * functionality, providing a type-safe interface for reading and updating query
 * parameters.
 *
 * @remarks
 *   The hook leverages nuqs for query state management, handling various
 *   parameter types:
 *
 *   - Date-related parameters (date, selectedDate, range, start, end)
 *   - Boolean flags (create, update)
 *   - Filtering parameters (projectId, statuses)
 *
 *   It automatically handles serialization/deserialization of parameters and
 *   maintains state synchronization with the URL.
 * @example
 *   ```tsx
 *   const {
 *   date,
 *   projectId,
 *   statuses,
 *   range,
 *   setParams
 *   } = useTrackerParams('2023-01-01');
 *
 *   // Read current parameters
 *   console.info(`Current date: ${date}, Project: ${projectId}`);
 *
 *   // Update parameters
 *   setParams({ date: '2023-02-01', projectId: 'project-123' });
 *
 *   // Clear a parameter
 *   setParams({ projectId: null });
 *   ```
 *
 * @param initialDate - Optional initial date string to use as default if no
 *   date is specified in URL. If not provided, defaults to the current date in
 *   ISO format (YYYY-MM-DD).
 * @returns An object containing:
 *
 *   - All parsed query parameters with their appropriate types
 *   - SetParams: Function to update any combination of query parameters
 */
export function useTrackerParams(initialDate?: string) {
  const [params, setParams] = useQueryStates({
    date: parseAsString.withDefault(
      initialDate ?? formatISO(new Date(), { representation: 'date' })
    ),
    create: parseAsBoolean,
    projectId: parseAsString,
    update: parseAsBoolean,
    selectedDate: parseAsString,
    range: parseAsArrayOf(parseAsString),
    statuses: parseAsArrayOf(
      parseAsStringLiteral(['completed', 'in_progress'])
    ),
    start: parseAsString,
    end: parseAsString,
  });

  return {
    ...params,
    setParams,
  };
}

/**
 * @file use-debounce.ts
 * @description A custom React hook for debouncing values to limit the rate of state updates.
 */
import * as React from 'react'

/**
 * @hook useDebounce
 * @description Debounces a value by delaying its update until after a specified time has elapsed
 * since the last change. This is useful for reducing the frequency of expensive operations
 * that would otherwise be triggered on every state change, such as API calls or heavy computations.
 * 
 * @template T - The type of the value being debounced
 * @param {T} value - The value to debounce
 * @param {number} [delay=500] - The delay in milliseconds before updating the debounced value
 * @returns {T} - The debounced value
 * 
 * @example
 * ```tsx
 * // Basic usage with search input
 * const SearchComponent = () => {
 *   const [searchTerm, setSearchTerm] = useState('');
 *   const debouncedSearchTerm = useDebounce(searchTerm, 300);
 *   
 *   // Effect only runs when debouncedSearchTerm changes
 *   useEffect(() => {
 *     if (debouncedSearchTerm) {
 *       // Make API call with debounced value
 *       searchAPI(debouncedSearchTerm);
 *     }
 *   }, [debouncedSearchTerm]);
 *   
 *   return (
 *     <input
 *       type="text"
 *       value={searchTerm}
 *       onChange={(e) => setSearchTerm(e.target.value)}
 *       placeholder="Search..."
 *     />
 *   );
 * };
 * ```
 */
export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay ?? 500)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

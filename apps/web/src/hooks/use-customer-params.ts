import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsString,
  useQueryStates,
} from 'nuqs';

/**
 * UseCustomerParams Hook
 * 
 * This hook manages URL parameters for customer-related operations, allowing state
 * persistence across page refreshes and deep linking.
 * 
 * @param options - Configuration options for the hook
 * @param options.shallow - When true, updates URL without triggering navigation/reload
 * 
 * @returns An object containing:
 * - customerId: String parameter for identifying a specific customer
 * - createCustomer: Boolean flag indicating if a new customer should be created
 * - sort: Array of strings defining sort order and fields
 * - name: String parameter for filtering customers by name
 * - q: String parameter for general search queries
 * - setParams: Function to update any combination of the URL parameters
 * 
 * @example
 * ```tsx
 * const { customerId, q, setParams } = useCustomerParams({ shallow: true });
 * 
 * // Update search query
 * const handleSearch = (query) => {
 *   setParams({ q: query });
 * };
 * 
 * // Select a specific customer
 * const selectCustomer = (id) => {
 *   setParams({ customerId: id });
 * };
 * ```
 */
export function useCustomerParams(options?: { shallow: boolean }) {
  const [params, setParams] = useQueryStates(
    {
      customerId: parseAsString,
      createCustomer: parseAsBoolean,
      sort: parseAsArrayOf(parseAsString),
      name: parseAsString,
      q: parseAsString,
    },
    options
  );

  return {
    ...params,
    setParams,
  };
}

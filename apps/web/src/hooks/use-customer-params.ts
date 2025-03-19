import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsString,
  useQueryStates,
} from 'nuqs';

/**
 * UseCustomerParams Hook
 *
 * This hook manages URL parameters for customer-related operations, allowing
 * state persistence across page refreshes and deep linking.
 *
 * @example
 *   ```tsx
 *   const { customerId, q, setParams } = useCustomerParams({ shallow: true });
 *
 *   // Update search query
 *   const handleSearch = (query) => {
 *     setParams({ q: query });
 *   };
 *
 *   // Select a specific customer
 *   const selectCustomer = (id) => {
 *     setParams({ customerId: id });
 *   };
 *   ```;
 *
 * @param options - Configuration options for the hook
 * @param options.shallow - When true, updates URL without triggering
 *   navigation/reload
 * @returns An object containing:
 *
 *   - CustomerId: String parameter for identifying a specific customer
 *   - CreateCustomer: Boolean flag indicating if a new customer should be created
 *   - Sort: Array of strings defining sort order and fields
 *   - Name: String parameter for filtering customers by name
 *   - Q: String parameter for general search queries
 *   - SetParams: Function to update any combination of the URL parameters
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

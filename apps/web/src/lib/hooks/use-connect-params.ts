import { parseAsString, useQueryStates } from 'nuqs';

/**
 * UseConnectParams Hook
 *
 * This hook manages URL parameters for the bank connection flow, allowing state
 * persistence across page refreshes and deep linking.
 */
export function useConnectParams(defaultCountryCode = 'US') {
  const [params, setParams] = useQueryStates({
    step: parseAsString,
    countryCode: parseAsString.withDefault(defaultCountryCode),
    q: parseAsString,
    provider: parseAsString,
    token: parseAsString,
    ref: parseAsString,
    institution_id: parseAsString,
    item_id: parseAsString,
  });

  return {
    ...params,
    setParams,
  };
}

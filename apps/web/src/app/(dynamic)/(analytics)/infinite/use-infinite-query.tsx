import { dataOptions } from './query-options';
import { searchParamsParser } from './search-params';
import { useInfiniteQuery as useInfiniteTanstackQuery } from '@tanstack/react-query';
import { useQueryStates } from 'nuqs';

export function useInfiniteQuery() {
  const [search] = useQueryStates(searchParamsParser);
  const query = useInfiniteTanstackQuery(dataOptions(search));
  return query;
}

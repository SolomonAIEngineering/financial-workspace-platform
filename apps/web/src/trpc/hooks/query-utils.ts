import { QueryClient, useQueryClient } from '@tanstack/react-query';
/* eslint-disable react-hooks/rules-of-hooks */
import { useCallback, useMemo } from 'react';

import { api } from '../react';

export const useQueryUtils =
  <
    T extends {
      cancel: (...args: any) => any;
      getData: (...args: any) => any;
      invalidate: (...args: any) => any;
      setData: (...args: any) => any;
    },
  >(
    useUtils: (utils: ReturnType<typeof api.useUtils>) => T
  ) =>
  (input?: Parameters<T['getData']>[0]) => {
    const utils = useUtils(api.useUtils());

    const methods = useMemo(
      () => ({
        cancel: async () => {
          await utils.cancel(input);
        },
        getData: () => {
          return utils.getData(input) as NonNullable<ReturnType<T['getData']>>;
        },
        invalidate: () => {
          void utils.invalidate(input);
        },
        setData: (updater: Parameters<T['setData']>[1]) => {
          utils.setData(input, updater);
        },
      }),
      [input, utils]
    );

    return {
      ...methods,
      rollback: useCallback(
        // (context?: { prevData: NonNullable<ReturnType<T['getData']>> }) => {
        (context?: any) => {
          methods.setData(context?.prevData);
        },
        [methods]
      ),
      update: useCallback(
        async (
          updater: (
            prevData: NonNullable<ReturnType<T['getData']>>
          ) => NonNullable<ReturnType<T['getData']>>,
          { cancel = true }: { cancel?: boolean } = {}
        ) => {
          if (cancel) {
            await methods.cancel();
          }

          const prevData = methods.getData();

          // Can happen when never queried before
          if (!prevData) return;

          methods.setData(updater(prevData));

          return { prevData };
        },
        [methods]
      ),
      utils,
    };
  };

export const useInfiniteQueryUtils =
  <
    T extends {
      cancel: (...args: any) => any;
      getInfiniteData: (...args: any) => any;
      invalidate: (...args: any) => any;
      setInfiniteData: (...args: any) => any;
    },
  >(
    useUtils: (utils: ReturnType<typeof api.useUtils>) => T
  ) =>
  (input?: Parameters<T['getInfiniteData']>[0]) => {
    const utils = useUtils(api.useUtils());

    const methods = useMemo(
      () => ({
        cancel: async () => {
          await utils.cancel(input);
        },
        getInfiniteData: () => {
          return utils.getInfiniteData(input) as NonNullable<
            ReturnType<T['getInfiniteData']>
          >;
        },
        invalidate: () => {
          void utils.invalidate(input);
        },
        setInfiniteData: (updater: Parameters<T['setInfiniteData']>[1]) => {
          utils.setInfiniteData(input, updater);
        },
      }),
      [input, utils]
    );

    return {
      ...methods,
      rollback: useCallback(
        (context?: {
          prevData: NonNullable<ReturnType<T['getInfiniteData']>>;
        }) => {
          methods.setInfiniteData(context?.prevData);
        },
        [methods]
      ),
      update: useCallback(
        async (
          updater: (
            prevData: NonNullable<ReturnType<T['getInfiniteData']>>
          ) => NonNullable<ReturnType<T['getInfiniteData']>>,
          { cancel = true }: { cancel?: boolean } = {}
        ) => {
          if (cancel) {
            await methods.cancel();
          }

          const prevData = methods.getInfiniteData();

          if (!prevData) return;

          methods.setInfiniteData(updater(prevData));

          return { prevData };
        },
        [methods]
      ),
      utils,
    };
  };

/**
 * Gets the query client instance
 *
 * This function is used to get the query client instance from the global
 * context when inside a component. Outside a component, it will return
 * undefined.
 */
export function getQueryClient(): QueryClient | undefined {
  try {
    // Using try-catch because this will throw if called outside
    // a component wrapped with QueryClientProvider
    return useQueryClient();
  } catch (e) {
    console.warn('getQueryClient called outside QueryClientProvider', e);
    return undefined;
  }
}

/** Builds the query key for a route */
export function buildQueryKey(
  path: string[],
  params: Record<string, any> = {}
): unknown[] {
  if (Object.keys(params).length === 0) {
    return [path];
  }
  return [path, params];
}

/** Invalidates all queries with the given path */
export function invalidateQueries(
  queryClient: QueryClient,
  path: string[]
): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey: [path],
  });
}

/** Refetches all queries with the given path */
export function refetchQueries(
  queryClient: QueryClient,
  path: string[]
): Promise<void> {
  return queryClient.refetchQueries({
    queryKey: [path],
  });
}

/** Cancels all queries with the given path */
export function cancelQueries(
  queryClient: QueryClient,
  path: string[]
): Promise<void> {
  return queryClient.cancelQueries({
    queryKey: [path],
  });
}

/** Sets the data for all queries with the given path */
export function setQueryData<TData>(
  queryClient: QueryClient,
  path: string[],
  updater: TData | ((oldData: TData | undefined) => TData)
): void {
  queryClient.setQueryData([path], updater);
}

'use client';

import { useDocumentId } from '@/lib/navigation/routes';
import { useSession } from '@/components/auth/useSession';
import { useTRPC } from '@/trpc/react';

/** Default options for TRPC queries */
export interface QueryOptions {
  /** Whether to refetch when window regains focus */
  refetchOnWindowFocus?: boolean;
  /** Whether to refetch when the component is remounted */
  refetchOnMount?: boolean;
  /** Whether to refetch on reconnect */
  refetchOnReconnect?: boolean;
  /** Retry options */
  retry?: false | number;
  /** Retry delay in milliseconds */
  retryDelay?: number;
  /** Whether the query should be enabled */
  enabled?: boolean;
  /** Stale time in milliseconds */
  staleTime?: number;
  /** Cache time in milliseconds */
  cacheTime?: number;
}

/** Default query options for all queries */
export const DEFAULT_QUERY_OPTIONS: QueryOptions = {
  refetchOnWindowFocus: false,
  refetchOnMount: true,
  refetchOnReconnect: false,
  retry: false,
  staleTime: 10 * 60 * 1000, // 10 minutes
  cacheTime: 15 * 60 * 1000, // 15 minutes
};

export function useDocumentQueryOptions() {
  const documentId = useDocumentId();
  const session = useSession();

  return {
    ...useTRPC().document.document.queryOptions({
      id: documentId,
    }),
    enabled: !!session,
  };
}

export function useDiscussionsQueryOptions() {
  const documentId = useDocumentId();

  return useTRPC().comment.discussions.queryOptions({
    documentId,
  });
}

export function useDocumentVersionsQueryOptions() {
  const documentId = useDocumentId();

  return useTRPC().version.documentVersions.queryOptions({
    documentId,
  });
}

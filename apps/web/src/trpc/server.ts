import { cookies, headers } from 'next/headers';

import type { AppRouter } from '@/server/api/root';
import { auth } from '@/components/auth/rsc/auth';
import { cache } from 'react';
import { createCaller } from '@/server/api/root';
import { createHydrationHelpers } from '@trpc/react-query/rsc';
import { createQueryClient } from '@/trpc/query-client';
import { createTRPCContext } from '@/server/api/trpc';

/**
 * This wraps the `createTRPCContext` helper and provides the required context
 * for the tRPC API when handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set('x-trpc-source', 'rsc');
  const { session, user } = await auth();

  return createTRPCContext({
    cookies:
      process.env.NODE_ENV === 'production'
        ? undefined
        : (await cookies()).getAll(),
    headers: heads,
    session,
    user,
  });
});

const getQueryClient = cache(createQueryClient);
const caller = createCaller(createContext);

export const { HydrateClient, trpc } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient
);
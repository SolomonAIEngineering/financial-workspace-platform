import { createSafeActionClient } from 'next-safe-action';

import { getOrThrowCurrentUser } from '@/lib/auth';

// Create the base client
export const actionClient = createSafeActionClient();

// Create the auth client by extending the base client with middleware
export const authActionClient = actionClient.use(async ({ next }) => {
  const user = await getOrThrowCurrentUser();

  return next({ ctx: { user } });
});

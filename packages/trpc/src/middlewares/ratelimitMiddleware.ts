import { RatelimitKey, getUserRatelimit } from '../ratelimit/ratelimit';

import { TRPCError } from '@trpc/server';
import { TrpcContext } from '../context';
import { t } from '../trpc';

export const ratelimitGuard = async (ctx: TrpcContext, key?: RatelimitKey) => {
  if (!process.env.UPSTASH_REDIS_REST_TOKEN) return;

  const { message, success } = await getUserRatelimit({
    key,
    ip: ctx.headers['x-forwarded-for'] as string | null,
    user: ctx.user,
  });

  if (!success) {
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message,
    });
  }
};

export const ratelimitMiddleware = (key?: RatelimitKey) =>
  t.middleware(async ({ ctx, next }) => {
    await ratelimitGuard(ctx, key);

    return next({ ctx });
  });

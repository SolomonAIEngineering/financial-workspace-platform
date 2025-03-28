import { TRPCError } from '@trpc/server';
import { UserRole } from '@solomonai/prisma';
import { t } from '../trpc';

export const authorizationMiddleware = ({ role }: { role: UserRole }) =>
  t.middleware(async ({ ctx, next }) => {
    if (role === UserRole.ADMIN && !ctx.user?.isAdmin) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Access denied',
      });
    }
    if (role === UserRole.SUPERADMIN && !ctx.user?.isSuperAdmin) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Access denied',
      });
    }

    return next({ ctx });
  });

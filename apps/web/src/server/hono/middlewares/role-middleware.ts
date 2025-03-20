import type { ProtectedContext } from './auth-middleware';
import type { UserRole } from '@solomonai/prisma/client';
import { createMiddleware } from 'hono/factory';

export function roleMiddleware(role?: UserRole) {
  return createMiddleware<ProtectedContext>(async (c, next) => {
    if (role) {
      const user = c.get('user');

      if (role === 'SUPERADMIN' && !user.isSuperAdmin) {
        return c.json({ error: 'Unauthorized' }, 403);
      }
      if (role === 'ADMIN' && !user.isAdmin) {
        return c.json({ error: 'Unauthorized' }, 403);
      }
    }

    await next();
  });
}

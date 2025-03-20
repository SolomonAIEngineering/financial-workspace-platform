import type { RatelimitKey } from '@/server/ratelimit';
import type { UserRole } from '@solomonai/prisma/client';

import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';

import { CookieNames } from '@/lib/storage/cookies';
import { type AuthUser, getAuthUser } from '@/server/auth/getAuthUser';
import { type AuthSession, verifyRequestOrigin } from '@/server/auth/lib';
import { lucia } from '@/server/auth/lucia';

import { ratelimitMiddleware } from './ratelimit-middleware';
import { roleMiddleware } from './role-middleware';

export type BaseRequest = {
  cookies: Record<string, string>;
  // headers: Headers;
};

export type ProtectedContext = {
  Variables: {
    session: AuthSession;
    user: AuthUser;
    userId: string;
  } & BaseRequest;
};

export type PublicContext = {
  Variables: {
    session: AuthSession | null;
    user: AuthUser | null;
    userId: string | null;
  } & BaseRequest;
};

const authMiddleware = createMiddleware<PublicContext>(async (c, next) => {
  const sessionId = getCookie(c, lucia.sessionCookieName);
  const devUser = getCookie(c, CookieNames.devUser);

  const baseRequest: BaseRequest = {
    cookies: getCookie(c),
    // headers: c.req.raw.headers,
  };

  c.set('cookies', baseRequest.cookies);
  // c.set('headers', baseRequest.headers);
  c.set('session', null);
  c.set('user', null);
  c.set('userId', null);

  if (sessionId) {
    const { session, user } = await lucia.validateSession(sessionId);

    if (session && user) {
      c.set('session', session);
      c.set('user', getAuthUser(user, devUser));
      c.set('userId', user.id);
    }
  }

  await next();
});

export const publicMiddlewares = ({
  ratelimitKey,
}: { ratelimitKey?: RatelimitKey } = {}) =>
  [authMiddleware, ratelimitMiddleware(ratelimitKey)] as const;

export const protectedMiddlewares = ({
  ratelimitKey,
  role,
}: { ratelimitKey?: RatelimitKey; role?: UserRole } = {}) =>
  [
    authMiddleware,
    createMiddleware<ProtectedContext>(async (c, next) => {
      // Check session and user
      const session = c.get('session');
      const user = c.get('user');

      if (!session || !user) {
        return c.redirect('/login');
      }
      // CSRF protection for non-GET requests
      if (c.req.method !== 'GET') {
        const originHeader = c.req.header('Origin');
        const hostHeader = c.req.header('Host');

        if (
          !originHeader ||
          !hostHeader ||
          !verifyRequestOrigin(originHeader, [hostHeader])
        ) {
          return c.redirect('/login');
        }
      }

      await next();
    }),
    ratelimitMiddleware(ratelimitKey),
    roleMiddleware(role),
  ] as const;

import { cache } from 'react';

import type { AuthSession } from '@/server/auth/lib';

import { cookies } from 'next/headers';

import { CookieNames } from '@/lib/storage/cookies';
import { type AuthUser, getAuthUser } from '@/server/auth/getAuthUser';
import { lucia } from '@/server/auth/lucia';

export const auth = cache(
  async (): Promise<{
    session: AuthSession | null;
    user: AuthUser | null;
  }> => {
    const c = await cookies();

    const sessionId = c.get(lucia.sessionCookieName)?.value ?? null;
    const devUser = c.get(CookieNames.devUser)?.value;

    if (!sessionId) {
      return { session: null, user: null };
    }

    const { session, user } = await lucia.validateSession(sessionId);

    // next.js throws when you attempt to set cookie when rendering page
    try {
      if (session?.fresh) {
        const sessionCookie = lucia.createSessionCookie(session.id);
        c.set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
      if (!session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        c.set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
    } catch {
      // console.error('Failed to set session cookie');
    }

    return {
      session,
      user: getAuthUser(user, devUser),
    };
  }
);

export const isAuth = async () => {
  const { session } = await auth();

  return !!session;
};

export const isNotAuth = async () => {
  const { session } = await auth();

  return !session;
};

export const authOnly = async <T extends (...args: any) => any>(
  callback: T
) => {
  if (await isAuth()) {
    return callback();
  }
};
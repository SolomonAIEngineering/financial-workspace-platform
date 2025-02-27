import type { NextRequest } from 'next/server';

import { CookieNames } from '@/lib/storage/cookies';

import type { AuthSession } from './lib';

import { type AuthUser, getAuthUser } from './getAuthUser';
import { lucia } from './lucia';

export const getRequestAuth = async (
  request: NextRequest
): Promise<{
  session: AuthSession | null;
  user: AuthUser | null;
}> => {
  const sessionId = request.cookies.get(lucia.sessionCookieName)?.value ?? null;
  const devUser = request.cookies.get(CookieNames.devUser)?.value;

  if (!sessionId) {
    return { session: null, user: null };
  }

  const { session, user } = await lucia.validateSession(sessionId);

  // if (session?.fresh) {
  //   const sessionCookie = lucia.createSessionCookie(session.id);
  //   response.cookies.set(
  //     sessionCookie.name,
  //     sessionCookie.value,
  //     sessionCookie.attributes
  //   );
  // }
  // if (!session) {
  //   const sessionCookie = lucia.createBlankSessionCookie();
  //   response.cookies.set(
  //     sessionCookie.name,
  //     sessionCookie.value,
  //     sessionCookie.attributes
  //   );
  // }

  return {
    session,
    user: getAuthUser(user, devUser),
  };
};

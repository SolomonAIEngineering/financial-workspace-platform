/** Authentication utilities for the application */

import type { AuthSession } from '@/server/auth/lib';
import type { AuthUser } from '@/server/auth/getAuthUser';
import { CookieNames } from '@/lib/storage/cookies';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { getAuthUser } from '@/server/auth/getAuthUser';
import { lucia } from '@/server/auth/lucia';
import { redirect } from 'next/navigation';

/**
 * Get the current authentication state
 *
 * @returns Object containing session and user information
 */
export const getAuth = cache(
  async (): Promise<{
    session: AuthSession | null;
    user: AuthUser | null;
  }> => {
    const cookieStore = await cookies();

    const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;
    const devUser = cookieStore.get(CookieNames.devUser)?.value;

    if (!sessionId) {
      return { session: null, user: null };
    }

    const { session, user } = await lucia.validateSession(sessionId);

    // Handle session refresh and cookie management
    try {
      if (session?.fresh) {
        const sessionCookie = lucia.createSessionCookie(session.id);
        cookieStore.set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
      if (!session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookieStore.set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
    } catch (error) {
      console.error('Failed to set session cookie', error);
    }

    return {
      session,
      user: getAuthUser(user, devUser),
    };
  }
);

/**
 * Get the current user or throw an error if not authenticated
 *
 * @returns The current user object
 */
export async function getOrThrowCurrentUser() {
  const { user } = await getAuth();

  if (!user) {
    throw new Error('Not authenticated');
  }

  return {
    id: user.id,
    email: user.email || '',
    full_name: user.username,
    isAdmin: user.isAdmin,
    isSuperAdmin: user.isSuperAdmin,
  };
}

/**
 * Check if the current user is authenticated
 *
 * @returns Boolean indicating authentication state
 */
export async function isAuthenticated() {
  const { session } = await getAuth();

  return !!session;
}

/**
 * Redirect to login if user is not authenticated
 *
 * @param redirectTo Path to redirect to after login
 */
export async function requireAuth(redirectTo = '/login') {
  const isAuthed = await isAuthenticated();

  if (!isAuthed) {
    const searchParams = new URLSearchParams();
    searchParams.set('next', redirectTo);
    redirect(`/login?${searchParams.toString()}`);
  }
}

/**
 * Get user roles and permissions
 *
 * @returns User role information
 */
export async function getUserRoles() {
  const { user } = await getAuth();

  if (!user) {
    return { isAdmin: false, isSuperAdmin: false };
  }

  return {
    isAdmin: user.isAdmin,
    isSuperAdmin: user.isSuperAdmin,
  };
}

/** Sign out the current user */
export async function signOut() {
  const { session } = await getAuth();

  if (session) {
    await lucia.invalidateSession(session.id);
    const cookieStore = await cookies();
    const sessionCookie = lucia.createBlankSessionCookie();
    cookieStore.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
  }
}
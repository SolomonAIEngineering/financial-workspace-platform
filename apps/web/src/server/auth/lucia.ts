import type { User as PrismaUser, Session } from '@solomonai/prisma/client';

import { NodePostgresAdapter } from '@lucia-auth/adapter-postgresql';
import { type User, Lucia, TimeSpan } from 'lucia';

import { env } from '@/env';
import { pool } from '@/server/db';

import type { AuthUser } from './getAuthUser';

import { githubProvider } from './providers/github';
import { googleProvider } from './providers/google';

class CustomNodePostgresAdapter extends NodePostgresAdapter {
  override async getSessionAndUser(
    sessionId: string
  ): ReturnType<
    (typeof NodePostgresAdapter)['prototype']['getSessionAndUser']
  > {
    const [session, user] = await super.getSessionAndUser(sessionId);

    if (session) {
      session.expiresAt = new Date(session.expiresAt);
    }

    return [session, user];
  }
}

const adapter = new CustomNodePostgresAdapter(pool as any, {
  session: 'Session',
  user: 'User',
});

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      domain:
        env.NEXT_PUBLIC_ENVIRONMENT === 'development'
          ? undefined
          : '.platejs.org',
      sameSite: env.NEXT_PUBLIC_ENVIRONMENT === 'development' ? 'lax' : 'none',
      // set to `true` when using HTTPS
      secure: env.NEXT_PUBLIC_ENVIRONMENT !== 'development',
    },
    expires: false, // session cookies have very long lifespan (2 years)
    name: 'session',
  },
  sessionExpiresIn: new TimeSpan(30, 'd'),
  getSessionAttributes: (attributes) => {
    return {
      ipAddress: attributes.ip_address,
      userAgent: attributes.user_agent,
    };
  },
  getUserAttributes: (attributes) => {
    return {
      id: attributes.id,
      email: attributes.email,
      role: attributes.role,
      username: attributes.username,
    };
  },
});

export const authProviders = {
  github: githubProvider,
  google: googleProvider,
} as const;

export type AuthProviderConfig = {
  name: string;
  pkce?: boolean;
};

export type AuthProviders = keyof typeof authProviders;

export type AuthResponse =
  | { session: null; user: null }
  | { session: Session; user: AuthUser };

export type LuciaUser = User;

declare module 'lucia' {
  interface Register {
    DatabaseSessionAttributes: DatabaseSessionAttributes;
    DatabaseUserAttributes: DatabaseUserAttributes;
    Lucia: typeof lucia;
  }
}
interface DatabaseSessionAttributes
  extends Pick<Session, 'ip_address' | 'user_agent'> { }
interface DatabaseUserAttributes extends PrismaUser { }

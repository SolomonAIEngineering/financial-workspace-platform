'use server';

import { AuthUser, getAuthUser } from './getAuthUser';
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';
import { User, prisma } from '@solomonai/prisma';

import { AuthSession } from './lib';
import { CookieNames } from '@solomonai/lib/storage/cookies';
import { lucia } from './lucia';

export interface GetServerSessionOptions {
    req: NextApiRequest | GetServerSidePropsContext['req'];
    res: NextApiResponse | GetServerSidePropsContext['res'];
}

export const getSession = async ({ req, res }: GetServerSessionOptions): Promise<{
    session: AuthSession | null;
    user: AuthUser | null;
    platformUser: User | null;
}> => {
    const sessionId = req.cookies[lucia.sessionCookieName] ?? null;
    const devUser = req.cookies[CookieNames.devUser];

    if (!sessionId) {
        return { session: null, user: null, platformUser: null };
    }

    const { session, user } = await lucia.validateSession(sessionId);

    if (!session || !user?.email) {
        return { user: null, session: null, platformUser: null };
    }

    const dbUser = await prisma.user.findFirstOrThrow({
        where: {
            email: user.email,
        },
    });

    return { user: getAuthUser(user, devUser), session, platformUser: dbUser };
};

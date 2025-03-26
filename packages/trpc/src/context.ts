import { GetServerSidePropsContext, NextApiRequest } from 'next';

import type { ApiRequestMetadata } from '@solomonai/lib/universal/extract-request-metadata';
import { AuthSession } from './auth/lib';
import { AuthUser } from './auth/getAuthUser';
import type { CreateNextContextOptions } from './adapters/next';
import { IncomingHttpHeaders } from 'http';
import { User } from '@solomonai/prisma';
import { extractNextApiRequestMetadata } from '@solomonai/lib/universal/extract-request-metadata';
import { getSession } from './auth/getSession';
import { z } from 'zod';

type CreateTrpcContext = CreateNextContextOptions & {
    requestSource: 'apiV1' | 'apiV2' | 'app';
};

const trpcContextSchema = z.object({
    headers: z.custom<IncomingHttpHeaders>(),
    cookies: z.custom<Partial<{
        [key: string]: string;
    }>>(),
    session: z.custom<AuthSession | null>(),
    user: z.custom<AuthUser | null>(),
    teamId: z.number().optional(),
    req: z.custom<NextApiRequest | GetServerSidePropsContext['req']>(),
    metadata: z.custom<ApiRequestMetadata>(),
    platformUser: z.custom<User | null>(),
});

type TrpcContextReturn = z.infer<typeof trpcContextSchema>;

export const createTrpcContext = async ({
    req,
    res,
    requestSource,
}: Omit<CreateTrpcContext, 'info'>): Promise<TrpcContextReturn> => {
    const { session, user, platformUser } = await getSession({ req, res });

    const metadata: ApiRequestMetadata = {
        requestMetadata: extractNextApiRequestMetadata(req),
        source: requestSource,
        auth: null,
    };

    const teamId = z.coerce
        .number()
        .optional()
        .catch(() => undefined)
        .parse(req.headers['x-team-id']);

    if (!session) {
        return {
            headers: req.headers,
            cookies: req.cookies,
            session: null,
            user: null,
            teamId,
            req,
            metadata,
            platformUser,
        };
    }

    if (!user) {
        return {
            headers: req.headers,
            cookies: req.cookies,
            session: null,
            user: null,
            teamId,
            req,
            metadata,
            platformUser,
        };
    }

    return {
        headers: req.headers,
        cookies: req.cookies,
        session,
        user,
        teamId,
        req,
        metadata,
        platformUser,
    };
};

export type TrpcContext = Awaited<ReturnType<typeof createTrpcContext>>;

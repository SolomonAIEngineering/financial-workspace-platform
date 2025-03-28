import type { AppLayoutResponse } from '../schema';
import { CookieNames } from '@solomonai/lib/storage/cookies';
import { devMiddleware } from '../../../middlewares/devMiddleware';
import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';

/**
 * Protected procedure to get application layout data.
 * 
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Retrieves user information including profile and organization details
 * 3. Retrieves all teams the user is a member of
 * 4. Returns formatted user and team information for the layout
 * 
 * @returns {AppLayoutResponse} User and team information for the app layout
 */
export const app = protectedProcedure
    .use(devMiddleware(CookieNames.devWaitAppLayout))
    .query(async ({ ctx }): Promise<AppLayoutResponse> => {
        const userId = ctx.session?.userId;
        const authUser = ctx.user!;

        // Get user information
        const { ...currentUser } = await prisma.user.findUniqueOrThrow({
            select: {
                name: true,
                profileImageUrl: true,
                teamId: true,
                bankConnections: true,
                organizationName: true,
                organizationUnit: true,
                username: true,
            },
            where: {
                id: userId,
            },
        });

        // Get all teams the user is a member of
        const userTeams = await prisma.usersOnTeam.findMany({
            where: {
                userId,
            },
            include: {
                team: true,
            },
        });

        // Format the response
        return {
            currentUser: {
                ...currentUser,
                firstName: currentUser.name?.split(' ')[0] ?? 'You',
                lastName: currentUser.name?.split(' ')[1] ?? '',
                ...authUser,
                teams: userTeams.map(({ team, role }) => ({
                    id: team.id,
                    name: team.name,
                    slug: team.slug,
                    logoUrl: team.logoUrl,
                    role,
                })),
            },
        };
    }); 
import { CookieNames } from '@solomonai/lib/storage/cookies';
import { createRouter } from '../trpc';
import { devMiddleware } from '../middlewares/devMiddleware';
import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../middlewares/procedures';

export const layoutRouter = createRouter({
  app: protectedProcedure
    .use(devMiddleware(CookieNames.devWaitAppLayout))
    .query(async ({ ctx }) => {
      const userId = ctx.session?.userId;

      const authUser = ctx.user!;

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
    }),
});

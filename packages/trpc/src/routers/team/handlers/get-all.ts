import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'

/**
 * Protected procedure to retrieve all teams for the current user.
 *
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Retrieves all teams the user is a member of with user details
 *
 * @returns An array of team objects with user information
 */
export const getAll = protectedProcedure.query(async ({ ctx }) => {
  const userId = ctx.session?.userId

  const teams = await prisma.team.findMany({
    where: {
      usersOnTeam: {
        some: {
          userId,
        },
      },
    },
    include: {
      usersOnTeam: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImageUrl: true,
            },
          },
        },
      },
    },
  })

  return teams
})

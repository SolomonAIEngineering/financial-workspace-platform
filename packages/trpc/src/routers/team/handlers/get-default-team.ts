import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'

/**
 * Protected procedure to retrieve the default team for the current user.
 *
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Retrieves the user's default team (if any)
 *
 * @returns The default team object or null if no default team exists
 */
export const getDefaultTeam = protectedProcedure.query(async ({ ctx }) => {
  const userId = ctx.session?.userId

  const team = await prisma.team.findFirst({
    where: {
      usersOnTeam: {
        some: {
          userId,
        },
      },
      isDefault: true,
    },
  })

  return team
})

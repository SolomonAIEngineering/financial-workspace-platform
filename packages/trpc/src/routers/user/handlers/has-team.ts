import { prisma } from '@solomonai/prisma'
import { protectedProcedure } from '../../../middlewares/procedures'

/**
 * Check if the user has at least one team
 *
 * This procedure checks if the authenticated user is a member of at least one
 * team. It can be used to determine if a user needs to create or join a
 * team.
 *
 * @example
 *   ```tsx
 *   const { hasTeam } = api.user.hasTeam.useQuery();
 *
 *   if (!hasTeam) {
 *     // Show team creation or join UI
 *   }
 *   ```;
 *
 * @returns A boolean indicating whether the user has at least one team
 */
export const hasTeam = protectedProcedure.query(async ({ ctx }) => {
  const userId = ctx.session?.userId

  // Count the number of teams the user is a member of
  const teamsCount = await prisma.usersOnTeam.count({
    where: { userId },
  })

  return { hasTeam: teamsCount > 0 }
})

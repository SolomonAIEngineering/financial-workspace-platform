import { protectedProcedure } from '../../../middlewares/procedures'
import { prisma } from '@solomonai/prisma'

/**
 * Get team members (users with the same teamName)
 * 
 * This procedure:
 * 1. Verifies the user is authenticated
 * 2. Gets the current user's team information
 * 3. Returns all users in the same team excluding the current user
 * 
 * @returns Array of team members
 */
export const getTeamMembers = protectedProcedure.query(async ({ ctx }) => {
  const currentUser = await prisma.user.findUnique({
    select: { organizationName: true, teamName: true },
    where: { id: ctx.userId },
  })

  if (!currentUser?.teamName) {
    return []
  }

  const teamMembers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      jobTitle: true,
      lastName: true,
      name: true,
      profileImageUrl: true,
    },
    where: {
      id: { not: ctx.userId }, // Exclude current user
      organizationName: currentUser.organizationName,
      teamName: currentUser.teamName,
    },
  })

  return teamMembers
})

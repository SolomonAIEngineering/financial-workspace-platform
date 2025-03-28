import { prisma } from '@solomonai/prisma'
import { TRPCError } from '@trpc/server'
import { protectedProcedure } from '../../../middlewares/procedures'

/**
 * Protected procedure to get team members for all the user's teams.
 *
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Fetches all teams the user belongs to
 * 3. Gets all members from those teams
 * 4. Returns formatted member information
 *
 * @returns An array of team member objects
 *
 * @throws {TRPCError} INTERNAL_SERVER_ERROR - If there's an error fetching team members
 */
export const getMembers = protectedProcedure.query(async ({ ctx }) => {
  try {
    // Fetch teams the user belongs to
    const userTeams = await prisma.usersOnTeam.findMany({
      where: { userId: ctx.session?.userId },
      select: { teamId: true },
    })

    if (!userTeams.length) {
      return []
    }

    const teamIds = userTeams.map((team) => team.teamId)

    // Get all members from the user's teams
    const teamMembers = await prisma.usersOnTeam.findMany({
      where: {
        teamId: { in: teamIds },
      },
      select: {
        id: true,
        role: true,
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            email: true,
          },
        },
      },
    })

    // Transform to expected format
    return teamMembers.map((member) => ({
      id: member.user.id,
      name:
        member.user.name ||
        `${member.user.firstName || ''} ${member.user.lastName || ''}`.trim() ||
        member.user.email ||
        'Unknown User',
      avatar: member.user.profileImageUrl,
      role: member.role,
    }))
  } catch (error) {
    console.error('Failed to fetch team members:', error)
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch team members',
    })
  }
})

import { protectedProcedure, teamMemberProcedure } from '../../../middlewares/procedures'

import { TRPCError } from '@trpc/server'
import { prisma } from '@solomonai/prisma/server'
import { teamIdSchema } from '../schema'

/**
 * Protected procedure to get all invites for a team.
 *
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Checks if the user has access to the team
 * 3. Returns all invites for the team with inviter details
 *
 * @input {TeamIdInput} - Team ID
 * @returns An array of team invite objects with inviter details
 *
 * @throws {TRPCError} FORBIDDEN - If the user does not have access to the team
 */
export const getInvites = teamMemberProcedure
  .input(teamIdSchema)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session?.userId
    const { teamId } = input

    // Check if user has permission to view invites
    const userTeam = await prisma.usersOnTeam.findFirst({
      where: {
        teamId,
        userId,
      },
    })

    if (!userTeam) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to view invites for this team',
      })
    }

    const invites = await prisma.userInvite.findMany({
      where: {
        teamId,
      },
      include: {
        inviter: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImageUrl: true,
          },
        },
      },
    })

    return invites
  })

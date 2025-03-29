import { protectedProcedure, teamMemberProcedure } from '../../../middlewares/procedures'

import { TRPCError } from '@trpc/server'
import { prisma } from '@solomonai/prisma'
import { teamIdSchema } from '../schema'

/**
 * Protected procedure to retrieve a team by ID.
 *
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Verifies the user has access to the requested team
 * 3. Returns the team data with user information
 *
 * @input {TeamIdInput} - Team ID
 * @returns The team object with user information
 *
 * @throws {TRPCError} NOT_FOUND - If the team does not exist or user doesn't have access
 */
export const getById = teamMemberProcedure
  .input(teamIdSchema)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session?.userId
    const { teamId } = input

    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
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

    if (!team) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Team not found',
      })
    }

    return team
  })

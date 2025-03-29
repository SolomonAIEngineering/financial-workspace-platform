import { prisma } from '@solomonai/prisma'
import { TeamRole } from '@solomonai/prisma/client'
import { isTeamOwner } from '@solomonai/trpc/src/middlewares/teamAuthorizationMiddleware'
import { TRPCError } from '@trpc/server'
import { protectedProcedure } from '../../../middlewares/procedures'
import { addUserSchema } from '../schema'

/**
 * Protected procedure to add a user to a team.
 *
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Checks if the current user has permission to add users to the team
 * 3. Verifies the user is not already a member of the team
 * 4. Adds the user to the team with the specified role
 *
 * @input {AddUserInput} - Team ID, user ID, and optional role
 * @returns The newly created user membership
 *
 * @throws {TRPCError} FORBIDDEN - If the user does not have permission to add users
 * @throws {TRPCError} BAD_REQUEST - If the user is already a member of the team
 * @throws {TRPCError} INTERNAL_SERVER_ERROR - If there's an error adding the user
 */
export const addUser = protectedProcedure
  .input(addUserSchema)
  .use(isTeamOwner)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId
    const { teamId, userId: newUserId, role = TeamRole.MEMBER } = input

    try {
      // Check if the current user has permission to add a user
      const currentUserTeam = await prisma.usersOnTeam.findFirst({
        where: {
          userId: userId,
          teamId,
          role: {
            in: [TeamRole.OWNER, TeamRole.MEMBER],
          },
        },
      })

      if (!currentUserTeam) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to add users to this team',
        })
      }

      // Check if the user is already a member of the team
      const existingMembership = await prisma.usersOnTeam.findFirst({
        where: {
          userId: newUserId,
          teamId,
        },
      })

      if (existingMembership) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User is already a member of this team',
        })
      }

      // Add the user to the team
      const membership = await prisma.usersOnTeam.create({
        data: {
          userId: newUserId,
          teamId,
          role,
        },
        include: {
          user: true,
          team: true,
        },
      })

      return membership
    } catch (error) {
      console.error('Failed to add user to team:', error)
      if (error instanceof TRPCError) {
        throw error
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to add user to team',
      })
    }
  })

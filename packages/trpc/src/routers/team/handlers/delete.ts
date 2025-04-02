import { TRPCError } from '@trpc/server'
import { prisma } from '@solomonai/prisma/server'
import { teamIdSchema } from '../schema'
import { teamOwnerProcedure } from '../../../middlewares/procedures'

/**
 * Team owner procedure to delete a team.
 *
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Verifies the user has OWNER permission on the team via teamOwnerProcedure
 * 3. Checks if the team exists
 * 4. Deletes the team
 *
 * @input {TeamIdInput} - Team ID
 * @returns Success status
 *
 * @throws {TRPCError} NOT_FOUND - If the team does not exist
 * @throws {TRPCError} FORBIDDEN - If the user does not have permission to delete the team
 * @throws {TRPCError} INTERNAL_SERVER_ERROR - If there's an error deleting the team
 */
export const deleteTeam = teamOwnerProcedure
  .input(teamIdSchema)
  .mutation(async ({ ctx, input }) => {
    // With teamOwnerProcedure, we know the user is already authenticated and is an owner
    const { teamId } = input

    // Check if the team exists
    const teamExists = await prisma.team.findUnique({
      where: { id: teamId },
    })

    if (!teamExists) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Team not found',
      })
    }

    try {
      // Delete the team
      const deletedTeam = await prisma.team.delete({
        where: { id: teamId },
      })

      if (!deletedTeam) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete team',
        })
      }

      return { success: true }
    } catch (error) {
      console.error('Failed to delete team:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete team',
      })
    }
  })

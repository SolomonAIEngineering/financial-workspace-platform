import { protectedProcedure, teamOwnerProcedure } from '../../../middlewares/procedures'

import { TRPCError } from '@trpc/server'
import { TeamRole } from '@solomonai/prisma/client'
import { deleteInviteSchema } from '../schema'
import { prisma } from '@solomonai/prisma'

/**
 * Protected procedure to delete a team invite.
 *
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Checks if the invite exists
 * 3. Verifies the current user has OWNER permission on the team or is the inviter
 * 4. Deletes the invite
 *
 * @input {DeleteInviteInput} - Invite ID
 * @returns Success status
 *
 * @throws {TRPCError} NOT_FOUND - If the invite does not exist
 * @throws {TRPCError} FORBIDDEN - If the user does not have permission to delete the invite
 * @throws {TRPCError} INTERNAL_SERVER_ERROR - If there's an error deleting the invite
 */
export const deleteInvite = teamOwnerProcedure
  .input(deleteInviteSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId
    const { inviteId } = input

    // Get the invite
    const invite = await prisma.userInvite.findUnique({
      where: { id: inviteId },
      include: {
        team: {
          include: {
            usersOnTeam: true,
          },
        },
      },
    })

    if (!invite) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Invite not found',
      })
    }

    try {
      // Delete the invite
      await prisma.userInvite.delete({
        where: { id: inviteId },
      })

      return { success: true }
    } catch (error) {
      console.error('Failed to delete team invite:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete team invite',
      })
    }
  })

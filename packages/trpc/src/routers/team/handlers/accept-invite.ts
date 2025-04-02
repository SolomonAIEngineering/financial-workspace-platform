import { TRPCError } from '@trpc/server'
import { acceptInviteSchema } from '../schema'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'

/**
 * Protected procedure to accept a team invite.
 *
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Checks if the user exists
 * 3. Validates the invite code and that it matches the user's email
 * 4. Verifies the user is not already a member of the team
 * 5. Adds the user to the team and deletes the invite
 *
 * @input {AcceptInviteInput} - Invite code
 * @returns Success status and team ID
 *
 * @throws {TRPCError} NOT_FOUND - If the user or invite does not exist
 * @throws {TRPCError} BAD_REQUEST - If the user is already a member of the team
 * @throws {TRPCError} INTERNAL_SERVER_ERROR - If there's an error accepting the invite
 */
export const acceptInvite = protectedProcedure
  .input(acceptInviteSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId
    const { code } = input

    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    })

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      })
    }

    // Get the invite
    const invite = await prisma.userInvite.findFirst({
      where: {
        code,
        email: user.email,
      },
    })

    if (!invite || !invite.teamId) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Invalid invite code',
      })
    }

    // Check if user is already a member of the team
    const existingMember = await prisma.usersOnTeam.findFirst({
      where: {
        teamId: invite.teamId,
        userId,
      },
    })

    if (existingMember) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'You are already a member of this team',
      })
    }

    try {
      // Add the user to the team
      const userOnTeam = await prisma.usersOnTeam.create({
        data: {
          teamId: invite.teamId,
          userId: userId as string,
          role: invite.role || 'MEMBER',
        },
      })

      // Also connect the user to the team
      await prisma.team.update({
        where: { id: invite.teamId },
        data: {
          users: {
            connect: {
              id: userId,
            },
          },
        },
      })

      // Delete the invite
      await prisma.userInvite.delete({
        where: { id: invite.id },
      })

      return {
        success: true,
        teamId: invite.teamId,
      }
    } catch (error) {
      console.error('Failed to accept team invite:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to accept team invite',
      })
    }
  })

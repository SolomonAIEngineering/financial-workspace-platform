import { protectedProcedure, teamOwnerProcedure } from '../../../middlewares/procedures'

import { TRPCError } from '@trpc/server'
import { TeamRole } from '@solomonai/prisma/client'
import { createInviteSchema } from '../schema'
import { prisma } from '@solomonai/prisma/server'

/**
 * Protected procedure to create a team invite.
 *
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Checks if the team exists
 * 3. Verifies the current user has OWNER permission on the team
 * 4. Checks if the invited user is already a team member
 * 5. Checks if there's already an invite for this email
 * 6. Creates a new team invite
 *
 * @input {CreateInviteInput} - Team ID, email to invite, and role
 * @returns The created invite object
 *
 * @throws {TRPCError} NOT_FOUND - If the team does not exist
 * @throws {TRPCError} FORBIDDEN - If the user does not have permission
 * @throws {TRPCError} BAD_REQUEST - If the user is already a member or has a pending invite
 * @throws {TRPCError} INTERNAL_SERVER_ERROR - If there's an error creating the invite
 */
export const createInvite = teamOwnerProcedure
  .input(createInviteSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId
    const { teamId, email, role } = input

    // Check if the user is already a member of the team
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (existingUser) {
      const existingMember = await prisma.usersOnTeam.findFirst({
        where: {
          teamId,
          userId: existingUser.id,
        },
      })

      if (existingMember) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User is already a member of this team',
        })
      }
    }

    // Check if there's already an invite for this email
    const existingInvite = await prisma.userInvite.findFirst({
      where: {
        teamId,
        email,
      },
    })

    if (existingInvite) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'An invite has already been sent to this email',
      })
    }

    try {
      // Generate a unique invite code
      const code = Math.random().toString(36).substring(2, 15)

      // Create the invite
      const invite = await prisma.userInvite.create({
        data: {
          teamId,
          email,
          code,
          invitedBy: userId,
          role,
        },
      })

      // TODO: Send an email to the invited user (implement separately)

      return invite
    } catch (error) {
      console.error('Failed to create team invite:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create team invite',
      })
    }
  })

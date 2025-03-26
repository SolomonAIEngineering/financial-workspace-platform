import { prisma } from '@solomonai/prisma';
import { TRPCError } from '@trpc/server';
import { TeamRole } from '@solomonai/prisma/client';
import { protectedProcedure } from '../../../middlewares/procedures';
import { updateUserRoleSchema } from '../schema';

/**
 * Protected procedure to update a user's role in a team.
 * 
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Checks if the user to be updated exists
 * 3. Verifies the current user has OWNER permission on the team
 * 4. Prevents downgrading the last owner
 * 5. Updates the user's role
 * 
 * @input {UpdateUserRoleInput} - Team ID, user ID to update, and new role
 * @returns The updated user membership
 * 
 * @throws {TRPCError} NOT_FOUND - If the user does not exist
 * @throws {TRPCError} FORBIDDEN - If the user does not have permission or tries to downgrade the last owner
 * @throws {TRPCError} INTERNAL_SERVER_ERROR - If there's an error updating the role
 */
export const updateUserRole = protectedProcedure
  .input(updateUserRoleSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId;
    const { teamId, userId: userToUpdateId, role } = input;

    // Check if the user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userToUpdateId },
    });

    if (!userExists) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    // Check if current user has permission to update roles
    const userTeam = await prisma.usersOnTeam.findFirst({
      where: {
        teamId,
        userId: userId,
        role: TeamRole.OWNER, // Only owners can update roles
      },
    });

    if (!userTeam) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to update roles in this team',
      });
    }

    // Prevent downgrading the last owner
    if (userToUpdateId === userId && role !== TeamRole.OWNER) {
      const ownersCount = await prisma.usersOnTeam.count({
        where: {
          teamId,
          role: TeamRole.OWNER,
        },
      });

      if (ownersCount <= 1) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot downgrade the last owner of the team',
        });
      }
    }

    try {
      // Update the user's role
      const updatedUserTeam = await prisma.usersOnTeam.update({
        where: {
          userId_teamId: {
            userId: userToUpdateId,
            teamId,
          },
        },
        data: {
          role,
        },
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
      });

      return updatedUserTeam;
    } catch (error) {
      console.error('Failed to update user role:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update user role',
      });
    }
  });

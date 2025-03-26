import { prisma } from '@solomonai/prisma';
import { TRPCError } from '@trpc/server';
import { TeamRole } from '@solomonai/prisma/client';
import { protectedProcedure } from '../../../middlewares/procedures';
import { removeUserSchema } from '../schema';

/**
 * Protected procedure to remove a user from a team.
 * 
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Checks if the user to be removed exists
 * 3. Checks if the team exists
 * 4. Verifies the current user has OWNER permission on the team
 * 5. Prevents removing the last owner
 * 6. Removes the user from the team
 * 
 * @input {RemoveUserInput} - Team ID and user ID to remove
 * @returns Success status
 * 
 * @throws {TRPCError} NOT_FOUND - If the user or team does not exist
 * @throws {TRPCError} FORBIDDEN - If the user does not have permission or tries to remove the last owner
 * @throws {TRPCError} INTERNAL_SERVER_ERROR - If there's an error removing the user
 */
export const removeUser = protectedProcedure
  .input(removeUserSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId;
    const { teamId, userId: userToRemoveId } = input;

    // Check if the user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userToRemoveId },
    });

    if (!userExists) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    // Check if the team exists
    const teamExists = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!teamExists) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Team not found',
      });
    }

    // Check if current user has permission to remove users from the team
    const userTeam = await prisma.usersOnTeam.findFirst({
      where: {
        teamId,
        userId: userId,
        role: TeamRole.OWNER, // Only owners can remove users
      },
    });

    if (!userTeam) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to remove users from this team',
      });
    }

    // Prevent removing the last owner
    if (userToRemoveId === userId) {
      const ownersCount = await prisma.usersOnTeam.count({
        where: {
          teamId,
          role: TeamRole.OWNER,
        },
      });

      if (ownersCount <= 1) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot remove the last owner from the team',
        });
      }
    }

    try {
      // Remove the user from the team
      await prisma.usersOnTeam.delete({
        where: {
          userId_teamId: {
            userId: userToRemoveId,
            teamId,
          },
        },
      });

      // Also disconnect the user from the team
      await prisma.team.update({
        where: { id: teamId },
        data: {
          users: {
            disconnect: {
              id: userToRemoveId,
            },
          },
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to remove user from team:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to remove user from team',
      });
    }
  });

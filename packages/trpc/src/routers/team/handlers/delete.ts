import { TRPCError } from '@trpc/server';
import { TeamRole } from '@solomonai/prisma/client';
import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';
import { teamIdSchema } from '../schema';

/**
 * Protected procedure to delete a team.
 * 
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Checks if the team exists
 * 3. Verifies the user has OWNER permission on the team
 * 4. Deletes the team
 * 
 * @input {TeamIdInput} - Team ID
 * @returns Success status
 * 
 * @throws {TRPCError} NOT_FOUND - If the team does not exist
 * @throws {TRPCError} FORBIDDEN - If the user does not have permission to delete the team
 * @throws {TRPCError} INTERNAL_SERVER_ERROR - If there's an error deleting the team
 */
export const deleteTeam = protectedProcedure
  .input(teamIdSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId;
    const { id } = input;

    // Check if the team exists
    const teamExists = await prisma.team.findUnique({
      where: { id },
    });

    if (!teamExists) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Team not found',
      });
    }

    // Check if user has permission to delete the team
    const userTeam = await prisma.usersOnTeam.findFirst({
      where: {
        teamId: id,
        userId,
        role: TeamRole.OWNER, // Only owners can delete teams
      },
    });

    if (!userTeam) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to delete this team',
      });
    }

    try {
      // Delete the team
      await prisma.team.delete({
        where: { id },
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to delete team:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete team',
      });
    }
  });

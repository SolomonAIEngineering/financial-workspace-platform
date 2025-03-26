import { prisma } from '@solomonai/prisma';
import { TRPCError } from '@trpc/server';
import { TeamRole } from '@solomonai/prisma/client';
import { protectedProcedure } from '../../../middlewares/procedures';
import { updateTeamSchema } from '../schema';

/**
 * Protected procedure to update a team.
 * 
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Checks if the team exists
 * 3. Verifies the user has OWNER permission on the team
 * 4. Updates the team with the provided data
 * 
 * @input {UpdateTeamInput} - Team ID and update data
 * @returns The updated team object
 * 
 * @throws {TRPCError} NOT_FOUND - If the team does not exist
 * @throws {TRPCError} FORBIDDEN - If the user does not have permission to update the team
 * @throws {TRPCError} INTERNAL_SERVER_ERROR - If there's an error updating the team
 */
export const update = protectedProcedure
  .input(updateTeamSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId;
    const { id, data } = input;

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

    // Check if user has permission to update the team
    const userTeam = await prisma.usersOnTeam.findFirst({
      where: {
        teamId: id,
        userId,
        role: TeamRole.OWNER, // Only admins or superadmins can update team details
      },
    });

    if (!userTeam) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to update this team',
      });
    }

    try {
      const updatedTeam = await prisma.team.update({
        where: { id },
        data,
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
      });

      return updatedTeam;
    } catch (error) {
      console.error('Failed to update team:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update team',
      });
    }
  });

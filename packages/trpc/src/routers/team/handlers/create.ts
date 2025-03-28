import { Prisma, prisma } from '@solomonai/prisma'
import { TeamRole } from '@solomonai/prisma/client'
import { TRPCError } from '@trpc/server'
import { resourceProcedure } from '../../../middlewares/procedures'
import { LimitableResourceEnum } from '../../../middlewares/tierLimitsMiddleware'
import { teamCreateSchema } from '../schema'

/**
 * Resource-limited procedure to create a new team.
 *
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Checks if the user has exceeded their team creation limits based on their plan
 * 3. Validates that no team with the same name exists
 * 4. Creates a new team and adds the user as an OWNER
 *
 * @input {TeamCreateInput} - Team creation data
 * @returns The newly created team object
 *
 * @throws {TRPCError} BAD_REQUEST - If a team with the same name already exists
 * @throws {TRPCError} FORBIDDEN - If the user has reached their team limit
 * @throws {TRPCError} INTERNAL_SERVER_ERROR - If there's an error creating the team
 */
export const create = resourceProcedure({
  resource: LimitableResourceEnum.Teams,
  errorMessage: 'You have reached the maximum number of teams allowed on your plan',
})
  .input(teamCreateSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId

    try {
      // make sure no team with the same name exists
      const existingTeam = await prisma.team.findFirst({
        where: {
          name: input.name,
        },
      })

      if (existingTeam) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Team with this name already exists',
        })
      }

      // Create the team - normalize input data
      const teamData: Prisma.TeamCreateInput = {
        ...input,
        // Ensure slug is not undefined by providing a default if needed
        slug:
          input.slug ||
          input.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') ||
          `team-${Date.now()}`,
        // Create the user-team relationship with OWNER role
        usersOnTeam: {
          create: {
            userId: userId as string,
            role: TeamRole.OWNER,
          },
        },
        // Add the user to the team
        users: {
          connect: {
            id: userId,
          },
        },
      }

      const team = await prisma.team.create({
        data: teamData,
        include: {
          usersOnTeam: true,
        },
      })

      return team
    } catch (error) {
      console.error('Failed to create team:', error)
      if (error instanceof TRPCError) {
        throw error
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create team',
      })
    }
  })

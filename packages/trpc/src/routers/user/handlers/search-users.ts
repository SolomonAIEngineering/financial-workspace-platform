import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'
import { searchUsersSchema } from '../schema'

/**
 * Search for users by name, organization, or team
 * 
 * This procedure:
 * 1. Verifies the user is authenticated
 * 2. Searches for users based on the provided query
 * 3. Returns matching users up to the specified limit
 * 
 * @input query - Search term to match against user fields
 * @input limit - Maximum number of results to return (default: 10)
 * @returns Array of matching users
 */
export const searchUsers = protectedProcedure
  .input(searchUsersSchema)
  .query(async ({ input }) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        jobTitle: true,
        lastName: true,
        name: true,
        organizationName: true,
        profileImageUrl: true,
        teamName: true,
      },
      take: input.limit,
      where: {
        OR: [
          { name: { contains: input.query, mode: 'insensitive' } },
          { firstName: { contains: input.query, mode: 'insensitive' } },
          { lastName: { contains: input.query, mode: 'insensitive' } },
          {
            organizationName: { contains: input.query, mode: 'insensitive' },
          },
          { teamName: { contains: input.query, mode: 'insensitive' } },
        ],
      },
    })

    return users
  })

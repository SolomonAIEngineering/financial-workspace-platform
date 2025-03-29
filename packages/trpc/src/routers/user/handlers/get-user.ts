import { protectedProcedure } from '../../../middlewares/procedures'
import { prisma } from '@solomonai/prisma'
import { userIdSchema } from '../schema'

/**
 * Get public profile information for a specific user
 * 
 * This procedure retrieves limited public profile information for the specified user.
 * Only returns non-sensitive data suitable for public display.
 * 
 * @input id - ID of the user to retrieve information for
 * @returns Public user profile with team information
 */
export const getUser = protectedProcedure
  .input(userIdSchema)
  .query(async ({ input }) => {
    // Return limited public profile information for other users
    const user = await prisma.user.findUnique({
      select: {
        email: true,
        firstName: true,
        lastName: true,
        name: true,
        profileImageUrl: true,
        teamName: true,
        team: {
          select: {
            id: true,
            name: true,
            email: true,
            baseCurrency: true,
            createdAt: true,
          },
        },
      },
      where: { id: input.id },
    })

    return user
  })

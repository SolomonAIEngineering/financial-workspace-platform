import { protectedProcedure } from '../../../middlewares/procedures'
import { prisma } from '@solomonai/prisma'
import { socialProfilesSchema } from '../schema'

/**
 * Update social profiles
 * 
 * This procedure:
 * 1. Verifies the user is authenticated
 * 2. Validates the update data against the social profiles schema
 * 3. Updates the user's social profile links
 * 
 * @input The social profiles data to update
 * @returns The updated user object
 */
export const updateSocialProfiles = protectedProcedure
  .input(socialProfilesSchema)
  .mutation(async ({ ctx, input }) => {
    const updatedUser = await prisma.user.update({
      data: input,
      where: { id: ctx.userId },
    })

    return updatedUser
  })

import { protectedProcedure } from '../../../middlewares/procedures'
import { prisma } from '@solomonai/prisma'
import { professionalProfileSchema } from '../schema'

/**
 * Update the professional profile for the authenticated user
 * 
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Validates the update data against the professional profile schema
 * 3. Updates the user's professional profile information
 * 
 * @input The professional profile data to update
 * @returns The updated user object
 */
export const updateProfessionalProfile = protectedProcedure
  .input(professionalProfileSchema)
  .mutation(async ({ ctx, input }) => {
    const updatedUser = await prisma.user.update({
      data: input,
      where: { id: ctx.userId },
    })

    return updatedUser
  })

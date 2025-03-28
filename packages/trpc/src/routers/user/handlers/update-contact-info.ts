import { contactInfoSchema } from '../schema'
import { prisma } from '@solomonai/prisma'
import { protectedProcedure } from '../../../middlewares/procedures'

/**
 * Update user contact information
 * 
 * This procedure:
 * 1. Verifies the user is authenticated
 * 2. Validates the update data against the contact info schema
 * 3. Updates the user's contact information
 * 
 * @input The contact information data to update
 * @returns The updated user object
 */
export const updateContactInfo = protectedProcedure
  .input(contactInfoSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId
    const updatedUser = await prisma.user.update({
      data: input,
      where: { id: userId },
    })

    return updatedUser
  })

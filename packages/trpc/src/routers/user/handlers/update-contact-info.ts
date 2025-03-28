import { protectedProcedure } from '../../../middlewares/procedures'
import { prisma } from '@solomonai/prisma'
import { contactInfoSchema } from '../schema'

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
    const updatedUser = await prisma.user.update({
      data: input,
      where: { id: ctx.userId },
    })

    return updatedUser
  })

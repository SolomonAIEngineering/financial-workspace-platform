import { protectedProcedure } from '../../../middlewares/procedures'
import { prisma } from '@solomonai/prisma'
import { organizationProfileSchema } from '../schema'

/**
 * Update organization-related information
 * 
 * This procedure:
 * 1. Verifies the user is authenticated
 * 2. Validates the update data against the organization profile schema
 * 3. Updates the user's organization information
 * 
 * @input The organization profile data to update
 * @returns The updated user object
 */
export const updateOrganizationInfo = protectedProcedure
  .input(organizationProfileSchema)
  .mutation(async ({ ctx, input }) => {
    const updatedUser = await prisma.user.update({
      data: input,
      where: { id: ctx.userId },
    })

    return updatedUser
  })

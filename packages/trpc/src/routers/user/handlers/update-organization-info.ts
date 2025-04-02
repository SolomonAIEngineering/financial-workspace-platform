import { organizationProfileSchema } from '../schema'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'

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
    const userId = ctx.session?.userId
    const updatedUser = await prisma.user.update({
      data: input,
      where: { id: userId },
    })

    return updatedUser
  })

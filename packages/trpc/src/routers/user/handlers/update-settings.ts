import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'
import { settingsUpdateSchema } from '../schema'

/**
 * Update basic user settings and profile information
 * 
 * This procedure:
 * 1. Verifies the user is authenticated
 * 2. Validates the update data against the settings schema
 * 3. Updates the user's settings and profile information
 * 
 * @input The settings data to update
 * @returns The updated user object
 */
export const updateSettings = protectedProcedure
  .input(settingsUpdateSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId
    const updatedUser = await prisma.user.update({
      data: input,
      where: { id: userId },
    })

    return updatedUser
  })

import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'
import { userPreferencesSchema } from '../schema'

/**
 * Update user preferences (notifications, display, etc.)
 * 
 * This procedure:
 * 1. Verifies the user is authenticated
 * 2. Validates the update data against the preferences schema
 * 3. Updates the user's preference settings
 * 
 * @input The preferences data to update
 * @returns The updated user object
 */
export const updatePreferences = protectedProcedure
  .input(userPreferencesSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId
    // Serialize the preferences objects while converting to Prisma-compatible JSON
    const displayPrefs = input.displayPreferences
      ? structuredClone(input.displayPreferences)
      : undefined
    const notificationPrefs = input.notificationPreferences
      ? structuredClone(input.notificationPreferences)
      : undefined
    const documentPrefs = input.documentPreferences
      ? structuredClone(input.documentPreferences)
      : undefined

    const updatedUser = await prisma.user.update({
      data: {
        displayPreferences: displayPrefs,
        documentPreferences: documentPrefs,
        notificationPreferences: notificationPrefs,
      },
      where: { id: userId },
    })

    return updatedUser
  })

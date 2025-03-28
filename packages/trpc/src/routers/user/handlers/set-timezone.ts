import { protectedProcedure } from '../../../middlewares/procedures'
import { prisma } from '@solomonai/prisma'
import { timezoneSchema } from '../schema'

/**
 * Set user timezone preference
 * 
 * This procedure:
 * 1. Verifies the user is authenticated
 * 2. Updates the user's timezone preference
 * 
 * @input timezone - Timezone string (e.g., 'America/New_York')
 * @returns Object containing the updated timezone and success status
 */
export const setTimezone = protectedProcedure
  .input(timezoneSchema)
  .mutation(async ({ ctx, input }) => {
    const updatedUser = await prisma.user.update({
      data: {
        timezone: input.timezone,
      },
      where: { id: ctx.userId },
    })

    return { success: true, timezone: updatedUser.timezone }
  })

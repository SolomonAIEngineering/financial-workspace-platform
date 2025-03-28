import { protectedProcedure } from '../../../middlewares/procedures'
import { prisma } from '@solomonai/prisma'
import { languageSchema } from '../schema'

/**
 * Set user language preference
 * 
 * This procedure:
 * 1. Verifies the user is authenticated
 * 2. Updates the user's language preference
 * 
 * @input language - Language code (e.g., 'en', 'fr', 'es')
 * @returns Object containing the updated language and success status
 */
export const setLanguage = protectedProcedure
  .input(languageSchema)
  .mutation(async ({ ctx, input }) => {
    const updatedUser = await prisma.user.update({
      data: {
        language: input.language,
      },
      where: { id: ctx.userId },
    })

    return { language: updatedUser.language, success: true }
  })

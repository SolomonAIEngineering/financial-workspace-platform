import { languageSchema } from '../schema'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'

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
    const userId = ctx.session?.userId
    const updatedUser = await prisma.user.update({
      data: {
        language: input.language,
      },
      where: { id: userId },
    })

    return { language: updatedUser.language, success: true }
  })

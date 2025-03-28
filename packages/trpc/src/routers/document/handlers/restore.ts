import { prisma } from '@solomonai/prisma'
import { protectedProcedure } from '../../../middlewares/procedures'
import { restoreDocumentSchema } from '../schema'

/**
 * Protected procedure to restore an archived document.
 *
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Updates the document to set isArchived to false
 *
 * @input {RestoreDocumentInput} - Document ID to restore
 * @returns void
 *
 * @throws {TRPCError} NOT_FOUND - If the document does not exist or user doesn't have access
 */
export const restore = protectedProcedure
  .input(restoreDocumentSchema)
  .mutation(async ({ ctx, input }) => {
    await prisma.document.update({
      data: {
        isArchived: false,
      },
      where: {
        id: input.id,
        userId: ctx.session?.userId,
      },
    })
  })

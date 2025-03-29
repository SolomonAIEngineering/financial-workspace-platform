import { prisma } from '@solomonai/prisma'
import { TRPCError } from '@trpc/server'
import { protectedProcedure } from '../../../middlewares/procedures'
import { togglePinSchema } from '../schema'

/**
 * Protected procedure to toggle a document's pinned status.
 *
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Fetches the current pinned status of the document
 * 3. Updates the document to toggle the pinned status
 *
 * @input {TogglePinInput} - Document ID to toggle pin status
 * @returns Object containing the new pinned status
 *
 * @throws {TRPCError} NOT_FOUND - If the document does not exist or user doesn't have access
 */
export const togglePin = protectedProcedure
  .input(togglePinSchema)
  .mutation(async ({ ctx, input }) => {
    const document = await prisma.document.findUnique({
      select: { pinned: true },
      where: {
        id: input.id,
        userId: ctx.session?.userId,
      },
    })

    if (!document) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Document not found',
      })
    }

    await prisma.document.update({
      data: {
        pinned: !document.pinned,
      },
      where: {
        id: input.id,
        userId: ctx.session?.userId,
      },
    })

    return { pinned: !document.pinned }
  })

import { prisma } from '@solomonai/prisma'
import { TRPCError } from '@trpc/server'
import { protectedProcedure } from '../../../middlewares/procedures'
import { removeTagSchema } from '../schema'

export const removeTagHandler = protectedProcedure
  .input(removeTagSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: input.id, userId: userId },
    })

    if (!existingTransaction) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Transaction not found',
      })
    }

    // Get current tags and remove the specified tag
    const currentTags = existingTransaction.tags || []
    const updatedTags = currentTags.filter((tag) => tag !== input.tag)

    // Update transaction tags
    const updatedTransaction = await prisma.transaction.update({
      where: { id: input.id },
      data: {
        tags: updatedTags,
      },
    })

    return updatedTransaction
  })

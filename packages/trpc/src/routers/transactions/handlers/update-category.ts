import { TRPCError } from '@trpc/server'
import { categoryUpdateSchema } from '../schema'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'

/**
 * Updates the category of a single transaction.
 * This handler verifies that the transaction belongs to the authenticated user
 * before updating its category.
 *
 * @param ctx - The context object containing the user's session information
 * @param input - The input object containing:
 *   - id: Transaction ID to update
 *   - category: The new category to assign
 *   - subCategory: Optional subcategory to assign
 *   - customCategory: Optional custom category to assign
 * @returns The updated transaction
 * @throws {TRPCError} With code 'NOT_FOUND' if the transaction doesn't exist or doesn't belong to the user
 */
export const updateTransactionCategoryHandler = protectedProcedure
  .input(categoryUpdateSchema)
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

    // Update transaction category
    const updatedTransaction = await prisma.transaction.update({
      where: { id: input.id },
      data: {
        category: input.category,
        subCategory: input.subCategory,
        customCategory: input.customCategory,
      },
    })

    if (!updatedTransaction) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update transaction category',
      })
    }

    return updatedTransaction
  })

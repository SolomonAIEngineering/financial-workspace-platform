import { transactionResponseSchema, updateTransactionSchema } from '../schema'

import { prisma } from '@solomonai/prisma'
import { TRPCError } from '@trpc/server'
import { protectedProcedure } from '../../../middlewares/procedures'

/**
 * Protected procedure to update a transaction's metadata and categorization.
 *
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Validates that the transaction exists and belongs to the user
 * 3. Updates the specified fields on the transaction
 * 4. Returns the updated transaction
 *
 * @input {object} updateTransactionSchema - The transaction update data
 *   - transactionId: ID of the transaction to update
 *   - category: Optional new transaction category
 *   - customCategory: Optional new custom category
 *   - excludeFromBudget: Optional flag to exclude from budget
 *   - notes: Optional notes about the transaction
 *   - tags: Optional array of tags to apply
 *
 * @output {transactionResponseSchema} - The updated transaction
 *
 * @throws {TRPCError} NOT_FOUND - If the transaction doesn't exist or doesn't belong to the user
 * @throws {TRPCError} INTERNAL_SERVER_ERROR - If there's an error updating the transaction
 *
 * @returns The updated transaction object
 */
export const updateTransaction = protectedProcedure
  .input(updateTransactionSchema)
  .output(transactionResponseSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      // Get the authenticated user ID
      const userId = ctx.session?.userId

      // Ensure the transaction belongs to the user
      const transaction = await prisma.transaction.findFirst({
        where: {
          id: input.transactionId,
          userId,
        },
      })

      if (!transaction) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transaction not found',
        })
      }

      // Update the transaction
      const updatedTransaction = await prisma.transaction.update({
        data: {
          category: input.category,
          customCategory: input.customCategory,
          excludeFromBudget: input.excludeFromBudget,
          notes: input.notes,
          tags: input.tags,
        },
        where: {
          id: input.transactionId,
        },
        include: {
          bankAccount: {
            select: {
              displayName: true,
              mask: true,
              name: true,
            },
          },
        },
      })

      // Validate the response against our schema
      return transactionResponseSchema.parse(updatedTransaction)
    } catch (error) {
      console.error('Error updating transaction:', error)

      throw new TRPCError({
        cause: error,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update transaction',
      })
    }
  })

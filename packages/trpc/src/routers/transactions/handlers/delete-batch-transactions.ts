import { prisma } from '@solomonai/prisma'
import { TRPCError } from '@trpc/server'
import { protectedProcedure } from '../../../middlewares/procedures'
import { deleteBatchTransactionsSchema } from '../schema'

/**
 * Deletes multiple transactions in a single request.
 * This handler verifies that all transactions belong to the authenticated user
 * before deleting them.
 *
 * @param ctx - The context object containing the user's session information
 * @param input - The input object containing:
 *   - ids: Array of transaction IDs to delete
 * @returns Object containing count of deleted transactions and success status
 * @throws {TRPCError} With code 'FORBIDDEN' if any transactions don't belong to the user
 */
export const deleteBatchTransactionsHandler = protectedProcedure
  .input(deleteBatchTransactionsSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      const { ids } = input

      // Verify all transactions belong to user
      const existingTransactions = await prisma.transaction.findMany({
        where: {
          id: { in: ids },
          userId: ctx.session?.userId,
        },
        select: { id: true },
      })

      const existingIds = existingTransactions.map((t) => t.id)

      if (existingIds.length !== ids.length) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'One or more transactions not found or unauthorized',
        })
      }

      // Delete transactions
      const deletedTransactions = await prisma.transaction.deleteMany({
        where: {
          id: { in: existingIds },
        },
      })

      if (!deletedTransactions) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete transactions',
        })
      }

      return {
        count: deletedTransactions.count,
        success: true,
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      console.error('Error in deleteBatchTransactions:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete transactions',
        cause: error,
      })
    }
  })

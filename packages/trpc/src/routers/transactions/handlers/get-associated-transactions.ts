import { prisma } from '@solomonai/prisma'
import { TRPCError } from '@trpc/server'
import { protectedProcedure } from '../../../middlewares/procedures'
import { getAssociatedTransactionsSchema } from '../schema'

/**
 * Gets all transactions associated with a recurring transaction.
 * This handler verifies that the transaction belongs to the authenticated user
 * before fetching associated transactions.
 *
 * @param ctx - The context object containing the user's session information
 * @param input - The input object containing:
 *   - id: Transaction ID to find associated transactions for
 * @returns Array of associated transactions with their bank account, category, and tag details
 * @throws {TRPCError} With code 'NOT_FOUND' if the transaction doesn't exist or doesn't belong to the user
 */
export const getAssociatedTransactionsHandler = protectedProcedure
  .input(getAssociatedTransactionsSchema)
  .query(async ({ ctx, input }) => {
    try {
      // First find the original transaction and check ownership
      const transaction = await prisma.transaction.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          userId: true,
          recurringTransactionId: true,
        },
      })

      if (!transaction || transaction.userId !== ctx.session?.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transaction not found',
        })
      }

      // If there's no recurring transaction ID, return empty array
      if (!transaction.recurringTransactionId) {
        return []
      }

      // Get all associated transactions with their relationships
      const associatedTransactions = await prisma.transaction.findMany({
        where: {
          userId: ctx.session?.userId,
          recurringTransactionId: transaction.recurringTransactionId,
        },
        select: {
          id: true,
          name: true,
          amount: true,
          date: true,
          status: true,
          pending: true,
          notes: true,
          category: true,
          bankAccount: {
            select: {
              name: true,
              plaidAccountId: true,
              type: true,
              subtype: true,
            },
          },
          transactionCategory: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          transactionTags: {
            select: {
              tag: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      })

      return associatedTransactions
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      console.error('Error in getAssociatedTransactions:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch associated transactions',
        cause: error,
      })
    }
  })

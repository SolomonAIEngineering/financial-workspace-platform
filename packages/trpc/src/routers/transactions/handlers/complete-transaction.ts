import { prisma } from '@solomonai/prisma'
import { TRPCError } from '@trpc/server'
import { protectedProcedure } from '../../../middlewares/procedures'
import { completeTransactionSchema } from '../schema'

/**
 * Marks a transaction as completed.
 * This handler verifies that the transaction belongs to the authenticated user
 * before updating its status.
 *
 * @param ctx - The context object containing the user's session information
 * @param input - The input object containing:
 *   - id: Transaction ID to complete
 * @returns The updated transaction
 * @throws {TRPCError} With code 'NOT_FOUND' if the transaction doesn't exist or doesn't belong to the user
 */
export const completeTransactionHandler = protectedProcedure
  .input(completeTransactionSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      // Check if transaction exists and belongs to user
      const existingTransaction = await prisma.transaction.findUnique({
        where: { id: input.id, userId: ctx.session?.userId },
        select: {
          id: true,
          userId: true,
        },
      })

      if (!existingTransaction) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transaction not found',
        })
      }

      // Update transaction status to completed
      const now = new Date()
      const updatedTransaction = await prisma.transaction.update({
        where: { id: input.id },
        data: {
          status: 'completed',
          pending: false,
          lastModifiedAt: now,
        },
        select: {
          id: true,
          name: true,
          amount: true,
          date: true,
          status: true,
          pending: true,
          lastModifiedAt: true,
        },
      })

      return updatedTransaction
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      console.error('Error in completeTransaction:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to complete transaction',
        cause: error,
      })
    }
  })

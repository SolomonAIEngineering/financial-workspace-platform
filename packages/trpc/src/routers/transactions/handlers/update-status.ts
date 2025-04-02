import { TRPCError } from '@trpc/server'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'
import { updateStatusSchema } from '../schema'

/**
 * Updates the status of a transaction.
 * This handler verifies that the transaction belongs to the authenticated user
 * before updating its status.
 *
 * @param ctx - The context object containing the user's session information
 * @param input - The input object containing:
 *   - id: Transaction ID to update
 *   - status: The new status to set for the transaction
 * @returns The updated transaction
 * @throws {TRPCError} With code 'NOT_FOUND' if the transaction doesn't exist or doesn't belong to the user
 */
export const updateStatusHandler = protectedProcedure
  .input(updateStatusSchema)
  .mutation(async ({ ctx, input }) => {
    try {
      // Check if transaction exists and belongs to user
      const existingTransaction = await prisma.transaction.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          userId: true,
        },
      })

      if (
        !existingTransaction ||
        existingTransaction.userId !== ctx.session?.userId
      ) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transaction not found',
        })
      }

      // Update transaction with new status
      const now = new Date()
      const updatedTransaction = await prisma.transaction.update({
        where: { id: input.id },
        data: {
          status: input.status,
          lastModifiedAt: now,
        },
        select: {
          id: true,
          name: true,
          amount: true,
          date: true,
          status: true,
          lastModifiedAt: true,
        },
      })

      if (!updatedTransaction) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update transaction status',
        })
      }

      return updatedTransaction
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      console.error('Error in updateStatus:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update transaction status',
        cause: error,
      })
    }
  })

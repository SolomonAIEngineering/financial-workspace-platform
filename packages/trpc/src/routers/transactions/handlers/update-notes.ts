import { TRPCError } from '@trpc/server'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'
import { updateNotesSchema } from '../schema'

/**
 * Updates the notes for a transaction.
 * This handler verifies that the transaction belongs to the authenticated user
 * before updating its notes.
 *
 * @param ctx - The context object containing the user's session information
 * @param input - The input object containing:
 *   - id: Transaction ID to update
 *   - notes: The new notes to set for the transaction
 * @returns The updated transaction
 * @throws {TRPCError} With code 'NOT_FOUND' if the transaction doesn't exist or doesn't belong to the user
 */
export const updateNotesHandler = protectedProcedure
  .input(updateNotesSchema)
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

      // Update transaction with new notes
      const now = new Date()
      const updatedTransaction = await prisma.transaction.update({
        where: { id: input.id },
        data: {
          notes: input.notes,
          lastModifiedAt: now,
        },
        select: {
          id: true,
          name: true,
          amount: true,
          date: true,
          notes: true,
          lastModifiedAt: true,
        },
      })

      if (!updatedTransaction) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update transaction notes',
        })
      }

      return updatedTransaction
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      console.error('Error in updateNotes:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update transaction notes',
        cause: error,
      })
    }
  })

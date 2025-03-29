import { prisma } from '@solomonai/prisma'
import { TRPCError } from '@trpc/server'
import { protectedProcedure } from '../../../middlewares/procedures'
import { updateTransactionSchema } from '../schema'

export const updateTransactionHandler = protectedProcedure
  .input(updateTransactionSchema)
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

      if (!existingTransaction) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transaction not found',
        })
      }

      if (existingTransaction.userId !== ctx.session?.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to modify this transaction',
        })
      }

      const now = new Date()
      // Execute in a transaction for atomicity
      return await prisma.$transaction(async (tx) => {
        try {
          const updatedTransaction = await tx.transaction.update({
            where: { id: input.id },
            data: {
              ...Object.fromEntries(
                Object.entries(input).filter(([_, value]) => value !== null),
              ),
            },
          })

          return {
            ...updatedTransaction,
            updated: true,
            timestamp: now,
          }
        } catch (txError) {
          console.error(
            `[updateTransaction] Error during transaction update:`,
            txError,
          )
          throw txError // Re-throw to be caught by the outer try/catch
        }
      })
    } catch (error) {
      if (error instanceof TRPCError) {
        console.error(`[updateTransaction] TRPC Error:`, {
          code: error.code,
          message: error.message,
        })
        throw error
      }

      console.error(`[updateTransaction] Unexpected error for ${input.id}:`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        data: Object.keys(input),
      })

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update transaction',
        cause: error,
      })
    }
  })

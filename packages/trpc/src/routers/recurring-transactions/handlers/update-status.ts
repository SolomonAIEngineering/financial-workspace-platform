import { TRPCError } from '@trpc/server'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'
import { statusSchema } from '../schemas'
import { z } from 'zod'

/**
 * Updates the status for a recurring transaction.
 * 
 * @remarks
 * This procedure updates the status of a recurring transaction (e.g., 'ACTIVE', 'PAUSED', 'CANCELLED').
 * It performs ownership verification to ensure the recurring transaction belongs to the authenticated user.
 * 
 * @param input - The input parameters
 * @param input.id - The unique identifier of the recurring transaction
 * @param input.status - The new status value to set
 * 
 * @returns An object containing the updated status after the change
 * 
 * @throws {TRPCError}
 *   - With code 'NOT_FOUND' if the recurring transaction doesn't exist
 *   - With code 'FORBIDDEN' if the user doesn't own the recurring transaction
 *   - Authentication errors (handled by protectedProcedure)
 */
export const updateStatus = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      status: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    // Fetch the recurring transaction with its bank account to check ownership
    const recurringTransaction = await prisma.recurringTransaction.findUnique({
      where: { id: input.id },
      include: {
        bankAccount: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!recurringTransaction) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Recurring transaction not found',
      })
    }

    // Verify user owns the recurring transaction
    if (recurringTransaction.bankAccount.userId !== ctx.session?.userId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You do not have permission to modify this recurring transaction',
      })
    }

    // Update the recurring transaction with the new status
    const updatedRecurringTransaction = await prisma.recurringTransaction.update({
      where: { id: input.id },
      data: {
        status: input.status,
      },
    })

    return { status: updatedRecurringTransaction.status }
  })

import { TRPCError } from '@trpc/server'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'
import { z } from 'zod'

/**
 * Deletes an existing recurring transaction by its ID.
 * 
 * @remarks
 * This procedure removes a recurring transaction after performing these operations:
 * - Verifies the recurring transaction exists and belongs to the authenticated user
 * - If the transaction affects available balance, updates the bank account's scheduled flows:
 *   - For outflows (negative amount): decreases scheduled outflows
 *   - For inflows (positive amount): decreases scheduled inflows
 * - Permanently deletes the recurring transaction record
 * 
 * @param input - The deletion parameters
 * @param input.id - ID of the recurring transaction to delete
 * 
 * @returns Object with a success indicator { success: true }
 * 
 * @throws {TRPCError}
 *   - With code 'NOT_FOUND' if the recurring transaction doesn't exist or doesn't belong to the user
 *   - Authentication errors (handled by protectedProcedure)
 */
export const deleteRecurringTransaction = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    // Fetch the recurring transaction with its bank account to check ownership
    const existingRecurringTransaction =
      await prisma.recurringTransaction.findUnique({
        where: { id: input.id },
        include: {
          bankAccount: {
            select: {
              userId: true,
              id: true,
            },
          },
        },
      })

    if (
      !existingRecurringTransaction ||
      existingRecurringTransaction.bankAccount.userId !== ctx.session?.userId
    ) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Recurring transaction not found',
      })
    }

    // If this recurring transaction affects available balance, update bank account scheduled flows
    if (existingRecurringTransaction.affectAvailableBalance) {
      if (existingRecurringTransaction.amount < 0) {
        // If outflow (negative amount), decrease scheduled outflows
        await prisma.bankAccount.update({
          where: { id: existingRecurringTransaction.bankAccountId },
          data: {
            scheduledOutflows: {
              decrement: Math.abs(existingRecurringTransaction.amount),
            },
          },
        })
      } else if (existingRecurringTransaction.amount > 0) {
        // If inflow (positive amount), decrease scheduled inflows
        await prisma.bankAccount.update({
          where: { id: existingRecurringTransaction.bankAccountId },
          data: {
            scheduledInflows: {
              decrement: existingRecurringTransaction.amount,
            },
          },
        })
      }
    }

    // Delete the recurring transaction
    await prisma.recurringTransaction.delete({
      where: { id: input.id },
    })

    return { success: true }
  })

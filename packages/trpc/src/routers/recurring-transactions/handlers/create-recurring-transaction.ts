import { TRPCError } from '@trpc/server'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'
import { recurringTransactionSchema } from '../schemas'

/**
 * Creates a new recurring transaction with the provided details.
 * 
 * @remarks
 * This procedure creates a recurring transaction associated with a user's bank account.
 * It performs several validations and operations:
 * - Verifies the specified bank account belongs to the authenticated user
 * - If a target account is provided, verifies it belongs to the user
 * - Calculates the next scheduled date based on frequency, interval, and start date
 * - If the start date is in the past, calculates the appropriate next occurrence
 * - Updates bank account balance projections if affectAvailableBalance is true
 * 
 * @param input - The recurring transaction data
 * @param input.bankAccountId - ID of the source bank account
 * @param input.targetAccountId - Optional ID of the target bank account
 * @param input.title - Title of the recurring transaction
 * @param input.amount - Amount of the transaction (positive for income, negative for expenses)
 * @param input.frequency - Frequency pattern (WEEKLY, BIWEEKLY, MONTHLY, etc.)
 * @param input.interval - Number of frequency units between occurrences
 * @param input.startDate - The first date this transaction should occur
 * @param input.affectAvailableBalance - Whether this should affect available balance calculations
 * @param input.tags - Optional array of tags for categorization
 * 
 * @returns The newly created recurring transaction object
 * 
 * @throws {TRPCError}
 *   - With code 'FORBIDDEN' if bank account or target account is not found or unauthorized
 *   - Authentication errors (handled by protectedProcedure)
 */
export const createRecurringTransaction = protectedProcedure
  .input(recurringTransactionSchema)
  .mutation(async ({ ctx, input }) => {
    // Verify bank account belongs to user
    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id: input.bankAccountId },
    })

    if (!bankAccount || bankAccount.userId !== ctx.session?.userId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Bank account not found or unauthorized',
      })
    }

    // If targetAccountId is provided, verify it belongs to user
    if (input.targetAccountId) {
      const targetAccount = await prisma.bankAccount.findUnique({
        where: { id: input.targetAccountId },
      })

      if (!targetAccount || targetAccount.userId !== ctx.session?.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Target account not found or unauthorized',
        })
      }
    }

    // Calculate next scheduled date based on frequency and start date
    const startDate = new Date(input.startDate)
    let nextScheduledDate = new Date(startDate)

    // If start date is in the past, calculate the next occurrence
    if (nextScheduledDate < new Date()) {
      const today = new Date()

      switch (input.frequency) {
        case 'WEEKLY':
          // Find next occurrence by adding weeks
          while (nextScheduledDate < today) {
            nextScheduledDate.setDate(
              nextScheduledDate.getDate() + 7 * input.interval,
            )
          }
          break
        case 'BIWEEKLY':
          // Find next occurrence by adding 2 weeks
          while (nextScheduledDate < today) {
            nextScheduledDate.setDate(
              nextScheduledDate.getDate() + 14 * input.interval,
            )
          }
          break
        case 'MONTHLY':
          // Find next occurrence by adding months
          while (nextScheduledDate < today) {
            nextScheduledDate.setMonth(
              nextScheduledDate.getMonth() + 1 * input.interval,
            )
          }
          break
        case 'SEMI_MONTHLY':
          // For semi-monthly (typically 1st and 15th), find next occurrence
          while (nextScheduledDate < today) {
            // If day is 1-14, move to 15th
            if (nextScheduledDate.getDate() < 15) {
              nextScheduledDate.setDate(15)
            }
            // If day is 15-31, move to 1st of next month
            else {
              nextScheduledDate.setMonth(nextScheduledDate.getMonth() + 1)
              nextScheduledDate.setDate(1)
            }
          }
          break
        case 'ANNUALLY':
          // Find next occurrence by adding years
          while (nextScheduledDate < today) {
            nextScheduledDate.setFullYear(
              nextScheduledDate.getFullYear() + 1 * input.interval,
            )
          }
          break
        default:
          // For IRREGULAR or UNKNOWN, just use the next day
          nextScheduledDate = new Date()
          nextScheduledDate.setDate(nextScheduledDate.getDate() + 1)
          break
      }
    }

    // Get current account balance to store as reference
    const initialAccountBalance = bankAccount.currentBalance

    // Create recurring transaction
    const recurringTransaction = await prisma.recurringTransaction.create({
      data: {
        ...input,
        tags: input.tags || [],
        nextScheduledDate,
        initialAccountBalance,
        executionCount: 0,
        totalExecuted: 0,
      },
    })

    // If affectAvailableBalance is true, update bank account scheduled flows
    if (input.affectAvailableBalance) {
      // For outgoing transactions (negative amount), update scheduled outflows
      if (input.amount < 0) {
        await prisma.bankAccount.update({
          where: { id: input.bankAccountId },
          data: {
            scheduledOutflows: {
              increment: Math.abs(input.amount),
            },
          },
        })
      }
      // For incoming transactions (positive amount), update scheduled inflows
      else if (input.amount > 0) {
        await prisma.bankAccount.update({
          where: { id: input.bankAccountId },
          data: {
            scheduledInflows: {
              increment: input.amount,
            },
          },
        })
      }
    }

    return recurringTransaction
  })

import { TRPCError } from '@trpc/server'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'
import { recurringTransactionSchema } from '../schemas'
import { z } from 'zod'

/**
 * Updates an existing recurring transaction with the provided data.
 * 
 * @remarks
 * This procedure updates a recurring transaction and performs several validations and operations:
 * - Verifies the recurring transaction exists and belongs to the authenticated user
 * - If updating bank account, verifies the new account belongs to the user
 * - If updating target account, verifies it belongs to the user
 * - If amount changes and affectAvailableBalance is true, updates the bank account's scheduled flows
 *   - Handles transitions between inflows/outflows and adjusts balances accordingly
 * - If frequency-related fields change, recalculates the next scheduled date
 * - Tracks the user who made the modification
 * 
 * @param input - The update parameters
 * @param input.id - ID of the recurring transaction to update
 * @param input.data - Partial data for updating the recurring transaction
 * @param input.data.bankAccountId - Optional new source bank account ID
 * @param input.data.targetAccountId - Optional new target bank account ID
 * @param input.data.amount - Optional new transaction amount
 * @param input.data.frequency - Optional new frequency pattern
 * @param input.data.interval - Optional new interval between occurrences
 * @param input.data.startDate - Optional new start date
 * @param input.data.dayOfMonth - Optional new day of month for monthly transactions
 * @param input.data.dayOfWeek - Optional new day of week for weekly transactions
 * 
 * @returns The updated recurring transaction object
 * 
 * @throws {TRPCError}
 *   - With code 'NOT_FOUND' if the recurring transaction doesn't exist or doesn't belong to the user
 *   - With code 'FORBIDDEN' if specified bank accounts are not found or unauthorized
 *   - Authentication errors (handled by protectedProcedure)
 */
export const updateRecurringTransaction = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      data: recurringTransactionSchema.partial(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    // Fetch the recurring transaction with its bank account to check ownership
    const existingRecurringTransaction =
      await prisma.recurringTransaction.findUnique({
        where: { id: input.id },
        include: {
          bankAccount: {
            select: {
              userId: true,
              currentBalance: true,
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

    // If updating bank account, verify new account belongs to user
    if (input.data.bankAccountId) {
      const bankAccount = await prisma.bankAccount.findUnique({
        where: { id: input.data.bankAccountId },
      })

      if (!bankAccount || bankAccount.userId !== ctx.session?.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Bank account not found or unauthorized',
        })
      }
    }

    // If updating targetAccountId, verify it belongs to user
    if (input.data.targetAccountId) {
      const targetAccount = await prisma.bankAccount.findUnique({
        where: { id: input.data.targetAccountId },
      })

      if (!targetAccount || targetAccount.userId !== ctx.session?.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Target account not found or unauthorized',
        })
      }
    }

    // If amount is changed and affectAvailableBalance is true, update bank account scheduled flows
    if (
      input.data.amount !== undefined &&
      existingRecurringTransaction.affectAvailableBalance
    ) {
      const oldAmount = existingRecurringTransaction.amount
      const newAmount = input.data.amount

      // If both old and new amounts are outflows (negative)
      if (oldAmount < 0 && newAmount < 0) {
        const difference = Math.abs(newAmount) - Math.abs(oldAmount)

        // If new outflow is larger, increment scheduled outflows
        if (difference > 0) {
          await prisma.bankAccount.update({
            where: { id: existingRecurringTransaction.bankAccountId },
            data: {
              scheduledOutflows: {
                increment: difference,
              },
            },
          })
        }
        // If new outflow is smaller, decrement scheduled outflows
        else if (difference < 0) {
          await prisma.bankAccount.update({
            where: { id: existingRecurringTransaction.bankAccountId },
            data: {
              scheduledOutflows: {
                decrement: Math.abs(difference),
              },
            },
          })
        }
      }
      // If both old and new amounts are inflows (positive)
      else if (oldAmount > 0 && newAmount > 0) {
        const difference = newAmount - oldAmount

        // If new inflow is larger, increment scheduled inflows
        if (difference > 0) {
          await prisma.bankAccount.update({
            where: { id: existingRecurringTransaction.bankAccountId },
            data: {
              scheduledInflows: {
                increment: difference,
              },
            },
          })
        }
        // If new inflow is smaller, decrement scheduled inflows
        else if (difference < 0) {
          await prisma.bankAccount.update({
            where: { id: existingRecurringTransaction.bankAccountId },
            data: {
              scheduledInflows: {
                decrement: Math.abs(difference),
              },
            },
          })
        }
      }
      // If changing from outflow to inflow
      else if (oldAmount < 0 && newAmount > 0) {
        await prisma.bankAccount.update({
          where: { id: existingRecurringTransaction.bankAccountId },
          data: {
            scheduledOutflows: {
              decrement: Math.abs(oldAmount),
            },
            scheduledInflows: {
              increment: newAmount,
            },
          },
        })
      }
      // If changing from inflow to outflow
      else if (oldAmount > 0 && newAmount < 0) {
        await prisma.bankAccount.update({
          where: { id: existingRecurringTransaction.bankAccountId },
          data: {
            scheduledInflows: {
              decrement: oldAmount,
            },
            scheduledOutflows: {
              increment: Math.abs(newAmount),
            },
          },
        })
      }
    }

    // If frequency or dates are changed, recalculate the next scheduled date
    let nextScheduledDate = existingRecurringTransaction.nextScheduledDate

    if (
      input.data.frequency ||
      input.data.startDate ||
      input.data.interval ||
      input.data.dayOfMonth ||
      input.data.dayOfWeek
    ) {
      const frequency =
        input.data.frequency || existingRecurringTransaction.frequency
      const interval =
        input.data.interval || existingRecurringTransaction.interval
      const startDate = input.data.startDate
        ? new Date(input.data.startDate)
        : existingRecurringTransaction.startDate

      // Create a new date to calculate from
      nextScheduledDate = new Date(startDate)
      const today = new Date()

      // Calculate next occurrence based on frequency
      if (nextScheduledDate < today) {
        switch (frequency) {
          case 'WEEKLY':
            while (nextScheduledDate < today) {
              nextScheduledDate.setDate(
                nextScheduledDate.getDate() + 7 * interval,
              )
            }
            break
          case 'BIWEEKLY':
            while (nextScheduledDate < today) {
              nextScheduledDate.setDate(
                nextScheduledDate.getDate() + 14 * interval,
              )
            }
            break
          case 'MONTHLY':
            while (nextScheduledDate < today) {
              nextScheduledDate.setMonth(
                nextScheduledDate.getMonth() + interval,
              )
            }
            break
          case 'SEMI_MONTHLY':
            while (nextScheduledDate < today) {
              if (nextScheduledDate.getDate() < 15) {
                nextScheduledDate.setDate(15)
              } else {
                nextScheduledDate.setMonth(nextScheduledDate.getMonth() + 1)
                nextScheduledDate.setDate(1)
              }
            }
            break
          case 'ANNUALLY':
            while (nextScheduledDate < today) {
              nextScheduledDate.setFullYear(
                nextScheduledDate.getFullYear() + interval,
              )
            }
            break
          default:
            nextScheduledDate = new Date()
            nextScheduledDate.setDate(nextScheduledDate.getDate() + 1)
            break
        }
      }
    }

    // Update the recurring transaction
    const updatedRecurringTransaction =
      await prisma.recurringTransaction.update({
        where: { id: input.id },
        data: {
          ...input.data,
          nextScheduledDate,
          lastModifiedBy: ctx.session?.userId,
        },
      })

    return updatedRecurringTransaction
  })
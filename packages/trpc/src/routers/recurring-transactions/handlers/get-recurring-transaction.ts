import { TRPCError } from '@trpc/server'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'
import { z } from 'zod'

/**
 * Retrieves a single recurring transaction by its unique ID.
 * 
 * @remarks
 * This procedure fetches a specific recurring transaction along with its related data,
 * including bank account details, target account details, and the most recent transactions.
 * Security checks ensure the transaction belongs to the authenticated user.
 * 
 * @param input - Input parameters
 * @param input.id - The unique identifier of the recurring transaction to retrieve
 * 
 * @returns The recurring transaction object with its related entities:
 *   - bankAccount: Associated bank account details (id, name, plaidAccountId, type, subtype, userId)
 *   - targetAccount: Associated target account details (id, name, plaidAccountId, type, subtype)
 *   - transactions: Most recent 10 transactions associated with this recurring transaction
 * 
 * @throws {TRPCError} 
 *   - With code 'NOT_FOUND' if the transaction doesn't exist or doesn't belong to the user
 *   - Authentication errors (handled by protectedProcedure)
 */
export const getRecurringTransactions = protectedProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ ctx, input }) => {
    const recurringTransaction = await prisma.recurringTransaction.findUnique(
      {
        where: { id: input.id },
        include: {
          bankAccount: {
            select: {
              id: true,
              name: true,
              plaidAccountId: true,
              type: true,
              subtype: true,
              userId: true,
            },
          },
          targetAccount: {
            select: {
              id: true,
              name: true,
              plaidAccountId: true,
              type: true,
              subtype: true,
            },
          },
          transactions: {
            orderBy: { date: 'desc' },
            take: 10,
          },
        },
      },
    )

    if (
      !recurringTransaction ||
      recurringTransaction.bankAccount.userId !== ctx.session?.userId
    ) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Recurring transaction not found',
      })
    }

    return recurringTransaction
  })
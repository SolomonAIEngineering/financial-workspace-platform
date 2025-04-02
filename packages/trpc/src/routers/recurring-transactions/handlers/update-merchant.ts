import { TRPCError } from '@trpc/server'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'
import { z } from 'zod'

/**
 * Updates the merchant information for a recurring transaction.
 * 
 * @remarks
 * This procedure updates the merchant name and optionally the merchant ID for a recurring transaction.
 * It ensures the recurring transaction belongs to the authenticated user before making any changes.
 * The lastModifiedBy field is automatically updated with the current user's ID.
 * 
 * @param input - The input parameters
 * @param input.id - The unique identifier of the recurring transaction
 * @param input.merchantName - The new merchant name to set
 * @param input.merchantId - Optional new merchant ID to set
 * 
 * @returns The updated recurring transaction with the new merchant information
 * 
 * @throws {TRPCError}
 *   - With code 'NOT_FOUND' if the transaction doesn't exist or doesn't belong to the user
 *   - Authentication errors (handled by protectedProcedure)
 */
export const updateMerchant = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      merchantName: z.string(),
      merchantId: z.string().optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    // Fetch the recurring transaction to check ownership
    const recurringTransaction = await prisma.recurringTransaction.findUnique(
      {
        where: { id: input.id },
        include: {
          bankAccount: {
            select: {
              userId: true,
            },
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

    // Update recurring transaction with new merchant details
    const updatedRecurringTransaction =
      await prisma.recurringTransaction.update({
        where: { id: input.id },
        data: {
          merchantName: input.merchantName,
          merchantId: input.merchantId,
          lastModifiedBy: ctx.session?.userId,
        },
      })

    return updatedRecurringTransaction
  })

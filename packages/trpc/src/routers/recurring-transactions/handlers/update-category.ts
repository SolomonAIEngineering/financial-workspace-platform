import { TRPCError } from '@trpc/server'
import { prisma } from '@solomonai/prisma'
import { protectedProcedure } from '../../../middlewares/procedures'
import { z } from 'zod'

/**
 * Updates the category for a recurring transaction.
 * 
 * @remarks
 * This procedure updates the category for a recurring transaction to a new valid category.
 * It performs two validations:
 * - Verifies the recurring transaction belongs to the authenticated user
 * - Confirms the provided category slug corresponds to an existing category
 * The lastModifiedBy field is automatically updated with the current user's ID.
 * 
 * @param input - The input parameters
 * @param input.id - The unique identifier of the recurring transaction
 * @param input.categorySlug - The slug (ID) of the custom transaction category to apply
 * 
 * @returns The updated recurring transaction with the new category
 * 
 * @throws {TRPCError}
 *   - With code 'NOT_FOUND' if the transaction doesn't exist or doesn't belong to the user
 *   - With code 'NOT_FOUND' if the specified category doesn't exist
 *   - Authentication errors (handled by protectedProcedure)
 */
export const updateCategory = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      categorySlug: z.string(),
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

    // Verify the category exists
    const category = await prisma.customTransactionCategory.findUnique({
      where: { id: input.categorySlug },
    })

    if (!category) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Category not found',
      })
    }

    // Update recurring transaction with new category
    const updatedRecurringTransaction =
      await prisma.recurringTransaction.update({
        where: { id: input.id },
        data: {
          categorySlug: input.categorySlug,
          lastModifiedBy: ctx.session?.userId,
        },
      })

    return updatedRecurringTransaction
  })
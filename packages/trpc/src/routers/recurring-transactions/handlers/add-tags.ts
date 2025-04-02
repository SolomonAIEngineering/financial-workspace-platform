import { TRPCError } from '@trpc/server'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'
import { z } from 'zod'

/**
 * Adds tags to an existing recurring transaction.
 * 
 * @remarks
 * This procedure adds one or more tags to a recurring transaction while preserving existing tags.
 * It ensures the recurring transaction belongs to the authenticated user before making any changes.
 * Duplicate tags are automatically removed through a Set operation.
 * 
 * @param input - The input parameters
 * @param input.id - The unique identifier of the recurring transaction
 * @param input.tags - Array of tag strings to add to the recurring transaction
 * 
 * @returns The updated recurring transaction with the new tags added
 * 
 * @throws {TRPCError}
 *   - With code 'NOT_FOUND' if the transaction doesn't exist or doesn't belong to the user
 *   - Authentication errors (handled by protectedProcedure)
 */
export const addTags = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      tags: z.array(z.string()),
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

    // Merge existing tags with new tags (remove duplicates)
    const updatedTags = [
      ...new Set([...recurringTransaction.tags, ...input.tags]),
    ]

    // Update recurring transaction with new tags
    const updatedRecurringTransaction =
      await prisma.recurringTransaction.update({
        where: { id: input.id },
        data: {
          tags: updatedTags,
          lastModifiedBy: ctx.session?.userId,
        },
      })

    return updatedRecurringTransaction
  })

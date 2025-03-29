import { TRPCError } from '@trpc/server'
import { prisma } from '@solomonai/prisma'
import { protectedProcedure } from '../../../middlewares/procedures'
import { tagSchema } from '../schemas'
import { z } from 'zod'

/**
 * Completely replaces all tags for a recurring transaction.
 * 
 * @remarks
 * Unlike addTags which appends tags, this procedure completely replaces the existing tags with a new set.
 * It performs ownership verification to ensure the recurring transaction belongs to the authenticated user.
 * 
 * @param input - The input parameters
 * @param input.id - The unique identifier of the recurring transaction
 * @param input.tags - New array of tag strings that will replace all existing tags
 * 
 * @returns An object containing the updated tags array after replacement
 * 
 * @throws {TRPCError}
 *   - With code 'NOT_FOUND' if the recurring transaction doesn't exist
 *   - With code 'FORBIDDEN' if the user doesn't own the recurring transaction
 *   - Authentication errors (handled by protectedProcedure)
 */
export const updateTags = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      tags: z.array(z.string()),
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

    // Update the recurring transaction with the new tags (replaces all existing tags)
    const updatedRecurringTransaction = await prisma.recurringTransaction.update({
      where: { id: input.id },
      data: {
        tags: input.tags,
      },
    })

    return { tags: updatedRecurringTransaction.tags }
  })

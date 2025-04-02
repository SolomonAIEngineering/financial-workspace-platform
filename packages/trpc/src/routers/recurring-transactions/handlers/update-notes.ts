import { TRPCError } from '@trpc/server'
import { notesSchema } from '../schemas'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'
import { z } from 'zod'

/**
 * Updates the notes field for a recurring transaction.
 * 
 * @remarks
 * This procedure updates the notes for a recurring transaction with new text.
 * It ensures the recurring transaction belongs to the authenticated user before making any changes.
 * The lastModifiedBy field is automatically updated with the current user's ID.
 * 
 * @param input - The input parameters
 * @param input.id - The unique identifier of the recurring transaction
 * @param input.notes - The new notes content to set
 * 
 * @returns The updated recurring transaction with the new notes
 * 
 * @throws {TRPCError}
 *   - With code 'NOT_FOUND' if the transaction doesn't exist or doesn't belong to the user
 *   - Authentication errors (handled by protectedProcedure)
 */
export const updateNotes = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      notes: z.string(),
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

    // Update recurring transaction with notes
    const updatedRecurringTransaction =
      await prisma.recurringTransaction.update({
        where: { id: input.id },
        data: {
          notes: input.notes,
          lastModifiedBy: ctx.session?.userId,
        },
      })

    return updatedRecurringTransaction
  })

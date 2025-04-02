import { TRPCError } from '@trpc/server'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'
import { z } from 'zod'

/**
 * Assigns a recurring transaction to a user
 */
export const assignRecurringTransaction = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      assignedToUserId: z.string(),
      notifyUser: z.boolean().default(false),
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

    // TODO: Verify the assignedToUserId has appropriate permissions
    // This would typically involve checking team memberships or permissions

    // Update recurring transaction with assignment
    // Note: We would need to add assignedToUserId field to the RecurringTransaction model
    const updatedRecurringTransaction =
      await prisma.recurringTransaction.update({
        where: { id: input.id },
        data: {
          // assignedToUserId: input.assignedToUserId,
          lastModifiedBy: ctx.session?.userId,
        },
      })

    // TODO: If notifyUser is true, send notification to assigned user
    if (input.notifyUser) {
      // Implement notification logic here
    }

    return updatedRecurringTransaction
  })

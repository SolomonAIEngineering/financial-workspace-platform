import { TRPCError } from '@trpc/server';
import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';
import { z } from 'zod';

export const bulkUpdateAssignedToHandler = protectedProcedure
  .input(
    z.object({
      transactionIds: z.array(z.string()).min(1).max(500),
      assignedTo: z.string().nullable(),
      notifyUsers: z.boolean().default(false),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId;
    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    const { transactionIds, assignedTo, notifyUsers } = input;

    // Verify all transactions exist and belong to the user
    const transactions = await prisma.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId,
      },
    });

    if (transactions.length !== transactionIds.length) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'One or more transactions not found or not owned by user',
      });
    }

    // Apply the update to each transaction
    const results = await Promise.all(
      transactions.map(async (transaction) => {
        try {
          // Update the transaction
          const updated = await prisma.transaction.update({
            where: { id: transaction.id },
            data: { assigneeId: assignedTo },
          });

          return {
            id: transaction.id,
            success: true,
            transaction: updated,
          };
        } catch (error) {
          console.error(`Error updating assignment for transaction ${transaction.id}:`, error);
          return {
            id: transaction.id,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    // TODO: Send notifications to assigned users if notifyUsers is true
    if (notifyUsers && assignedTo) {
      // Implement notification logic here
    }

    return {
      results,
      successCount: results.filter((r) => r.success).length,
      failureCount: results.filter((r) => !r.success).length,
    };
  });

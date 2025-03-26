import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';
import { updateBatchTransactionsSchema } from '../schema';

export const updateBatchTransactionsHandler = protectedProcedure
  .input(updateBatchTransactionsSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId as string;

    const results = await Promise.all(
      input.transactions.map(async (txInput) => {
        try {
          // Verify transaction belongs to user
          const existingTransaction = await prisma.transaction.findUnique({
            where: { id: txInput.id },
          });

          if (!existingTransaction) {
            return {
              id: txInput.id,
              success: false,
              error: 'Transaction not found',
            };
          }

          // Update transaction
          const updated = await prisma.transaction.update({
            where: { id: txInput.id },
            data: {
              ...txInput.data,
              // Convert date string to Date object if provided
              ...(txInput.data.date
                ? { date: new Date(txInput.data.date) }
                : {}),
            },
          });

          return {
            id: txInput.id,
            success: true,
            transaction: updated,
          };
        } catch (error) {
          console.error(`Error updating transaction ${txInput.id}:`, error);
          return {
            id: txInput.id,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    return {
      results,
      successCount: results.filter((r) => r.success).length,
      failureCount: results.filter((r) => !r.success).length,
    };
  });

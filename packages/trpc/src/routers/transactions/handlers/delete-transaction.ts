import { prisma } from '@solomonai/prisma';
import { TRPCError } from '@trpc/server';
import { protectedProcedure } from '../../../middlewares/procedures';
import { z } from 'zod';

export const deleteTransactionHandler = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: input.id },
    });

    if (!existingTransaction || existingTransaction.userId !== ctx.session?.userId) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Transaction not found',
      });
    }

    // Delete transaction
    await prisma.transaction.delete({
      where: { id: input.id },
    });

    return { success: true };
  });

import { TRPCError } from '@trpc/server';
import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';
import { z } from 'zod';

export const updatePaymentMethodHandler = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      paymentMethod: z.string(),
      paymentProcessor: z.string().optional(),
      cardType: z.string().optional(),
      cardLastFour: z.string().optional(),
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

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: input.id },
    });

    if (!existingTransaction || existingTransaction.userId !== userId) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Transaction not found',
      });
    }

    // Update transaction payment method details
    const updatedTransaction = await prisma.transaction.update({
      where: { id: input.id },
      data: {
        paymentMethod: input.paymentMethod,
        paymentProcessor: input.paymentProcessor,
        cardType: input.cardType,
        cardLastFour: input.cardLastFour,
      },
    });

    return updatedTransaction;
  });

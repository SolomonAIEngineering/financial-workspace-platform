import { TRPCError } from '@trpc/server';
import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';
import { updatePaymentMethodSchema } from '../schema';
import { z } from 'zod';

export const updatePaymentMethodHandler = protectedProcedure
  .input(updatePaymentMethodSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId;

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: input.id, userId: userId },
    });

    if (!existingTransaction) {
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
        paymentChannel: input.paymentChannel,
        cardType: input.cardType,
        cardLastFour: input.cardLastFour,
      },
    });

    if (!updatedTransaction) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update transaction payment method',
      });
    }

    return updatedTransaction;
  });

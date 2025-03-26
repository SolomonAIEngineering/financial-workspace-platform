import { TRPCError } from '@trpc/server';
import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';
import { transactionWithIdSchema } from '../schema';
import { z } from 'zod';

export const getTransactionHandler = protectedProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ ctx, input }) => {
    const transaction = await prisma.transaction.findUnique({
      where: { id: input.id },
      include: {
        bankAccount: {
          select: {
            name: true,
            plaidAccountId: true,
            type: true,
            subtype: true,
          },
        },
        transactionCategory: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        transactionTags: {
          select: {
            tag: true,
          },
        },
        customAttachments: {
          select: {
            id: true,
            createdAt: true,
          },
        },
        recurringTransaction: true,
      },
    });

    if (!transaction || transaction.userId !== ctx.session?.userId) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Transaction not found',
      });
    }

    return transaction;
  });

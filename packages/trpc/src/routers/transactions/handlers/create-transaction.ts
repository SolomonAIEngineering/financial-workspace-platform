import { TRPCError } from '@trpc/server';
import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';
import { transactionSchema } from '../schema';

export const createTransactionHandler = protectedProcedure
  .input(transactionSchema)
  .mutation(async ({ ctx, input }) => {
    // Verify bank account belongs to user
    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id: input.bankAccountId },
    });

    if (!bankAccount || bankAccount.userId !== ctx.session?.userId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Bank account not found or unauthorized',
      });
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        ...input,
        userId: ctx.session?.userId,
        isManual: true,
        tags: input.tags || [],
      },
    });

    return transaction;
  });

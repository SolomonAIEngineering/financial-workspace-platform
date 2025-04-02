import { TRPCError } from '@trpc/server'
import { getTransactionSchema } from '../schema'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'

export const getTransactionHandler = protectedProcedure
  .input(getTransactionSchema)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session?.userId as string

    // get the transaction uniquely by id and userId
    const transaction = await prisma.transaction.findUnique({
      where: { id: input.id, userId: userId },
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
    })

    if (!transaction) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Transaction not found',
      })
    }

    return transaction
  })

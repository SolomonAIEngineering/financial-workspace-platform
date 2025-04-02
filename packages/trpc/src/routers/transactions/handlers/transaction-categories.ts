import {
  bulkCategorizationSchema,
  categorizeByMerchantSchema,
  categoryUpdateSchema,
  getTransactionsByCategorySchema,
} from '../schema'

import { TRPCError } from '@trpc/server'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'

export const updateTransactionCategoryHandler = protectedProcedure
  .input(categoryUpdateSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: input.id, userId: userId },
    })

    if (!existingTransaction) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Transaction not found',
      })
    }

    // Update transaction category
    const updatedTransaction = await prisma.transaction.update({
      where: { id: input.id },
      data: {
        category: input.category,
        subCategory: input.subCategory,
        customCategory: input.customCategory,
      },
    })

    if (!updatedTransaction) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update transaction category',
      })
    }

    return updatedTransaction
  })

export const bulkUpdateTransactionCategoriesHandler = protectedProcedure
  .input(bulkCategorizationSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId

    const { transactionIds, category, subCategory, customCategory } = input

    // Verify all transactions exist and belong to the user
    const transactions = await prisma.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId,
      },
    })

    if (transactions.length !== transactionIds.length) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'One or more transactions not found or not owned by user',
      })
    }

    // Apply the update to all transactions at once
    const updateResult = await prisma.transaction.updateMany({
      where: {
        id: { in: transactionIds },
        userId,
      },
      data: {
        category,
        subCategory,
        customCategory,
      },
    })

    if (!updateResult) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update transaction categories',
      })
    }
    return {
      success: true,
      updatedCount: updateResult.count,
      totalTransactions: transactionIds.length,
    }
  })

export const categorizeByMerchantHandler = protectedProcedure
  .input(categorizeByMerchantSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId
    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      })
    }

    const { merchantName, category, subCategory, applyToFuture } = input

    // Find all transactions with this merchant name
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        merchantName: {
          contains: merchantName,
          mode: 'insensitive',
        },
      },
    })

    // Update all matching transactions at once
    const updateResult = await prisma.transaction.updateMany({
      where: {
        userId,
        merchantName: {
          contains: merchantName,
          mode: 'insensitive',
        },
      },
      data: {
        category,
        subCategory,
      },
    })

    // If applyToFuture is true, save this categorization rule for future transactions
    if (applyToFuture) {
      // TODO: This would ideally create a rule in a MerchantCategoryRule table
      // For this example, we'll just log that this would happen
      console.info(
        `Created rule: Categorize all transactions from ${merchantName} as ${category}`,
      )
    }

    return {
      success: true,
      updatedCount: updateResult.count,
      affectedTransactionsCount: transactions.length,
    }
  })

export const getTransactionsByCategoryHandler = protectedProcedure
  .input(getTransactionsByCategorySchema)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session?.userId

    const { category, page, limit } = input
    const skip = (page - 1) * limit

    // Find transactions by category
    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId,
          category,
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
        include: {
          bankAccount: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.transaction.count({
        where: {
          userId,
          category,
        },
      }),
    ])

    return {
      transactions,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    }
  })

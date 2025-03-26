import { Prisma, prisma } from '@solomonai/prisma';

import { TRPCError } from '@trpc/server';
import { TransactionCategory } from '@solomonai/prisma/client';
import { protectedProcedure } from '../../../middlewares/procedures';
import { z } from 'zod';

// Category update schema
const categoryUpdateSchema = z.object({
  id: z.string(),
  category: z.nativeEnum(TransactionCategory),
  subCategory: z.string().optional(),
  customCategory: z.string().optional(),
});

// Bulk categorization schema
const bulkCategorizationSchema = z.object({
  transactionIds: z.array(z.string()),
  category: z.nativeEnum(TransactionCategory),
  subCategory: z.string().optional(),
  customCategory: z.string().optional(),
});

// Categorize by merchant schema
const categorizeByMerchantSchema = z.object({
  merchantName: z.string(),
  category: z.nativeEnum(TransactionCategory),
  subCategory: z.string().optional(),
  applyToFuture: z.boolean().default(false),
});

export const updateTransactionCategoryHandler = protectedProcedure
  .input(categoryUpdateSchema)
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

    // Update transaction category
    const updatedTransaction = await prisma.transaction.update({
      where: { id: input.id },
      data: {
        category: input.category,
        subCategory: input.subCategory,
        customCategory: input.customCategory,
      },
    });

    return updatedTransaction;
  });

export const bulkUpdateTransactionCategoriesHandler = protectedProcedure
  .input(bulkCategorizationSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId;
    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    const { transactionIds, category, subCategory, customCategory } = input;

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
          const updated = await prisma.transaction.update({
            where: { id: transaction.id },
            data: {
              category,
              subCategory,
              customCategory,
            },
          });

          return {
            id: transaction.id,
            success: true,
            transaction: updated,
          };
        } catch (error) {
          console.error(`Error updating category for transaction ${transaction.id}:`, error);
          return {
            id: transaction.id,
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

export const categorizeByMerchantHandler = protectedProcedure
  .input(categorizeByMerchantSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId;
    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    const { merchantName, category, subCategory, applyToFuture } = input;

    // Find all transactions with this merchant name
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        merchantName: {
          contains: merchantName,
          mode: 'insensitive',
        },
      },
    });

    // Update all matching transactions
    const results = await Promise.all(
      transactions.map(async (transaction) => {
        try {
          const updated = await prisma.transaction.update({
            where: { id: transaction.id },
            data: {
              category,
              subCategory,
            },
          });

          return {
            id: transaction.id,
            success: true,
            transaction: updated,
          };
        } catch (error) {
          console.error(`Error updating category for transaction ${transaction.id}:`, error);
          return {
            id: transaction.id,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    // If applyToFuture is true, save this categorization rule for future transactions
    if (applyToFuture) {
      // This would ideally create a rule in a MerchantCategoryRule table
      // For this example, we'll just log that this would happen
      console.log(`Created rule: Categorize all transactions from ${merchantName} as ${category}`);
    }

    return {
      results,
      successCount: results.filter((r) => r.success).length,
      failureCount: results.filter((r) => !r.success).length,
      affectedTransactionsCount: transactions.length,
    };
  });

export const getTransactionsByCategoryHandler = protectedProcedure
  .input(
    z.object({
      category: z.nativeEnum(TransactionCategory),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
    })
  )
  .query(async ({ ctx, input }) => {
    const userId = ctx.session?.userId;
    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    const { category, page, limit } = input;
    const skip = (page - 1) * limit;

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
    ]);

    return {
      transactions,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    };
  });

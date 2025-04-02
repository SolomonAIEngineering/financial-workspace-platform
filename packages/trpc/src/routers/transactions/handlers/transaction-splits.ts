import { TRPCError } from '@trpc/server'
import { TransactionCategory } from '@solomonai/prisma/client'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'
import { z } from 'zod'

// Split transaction part schema
const splitTransactionPartSchema = z.object({
  amount: z.number(),
  category: z.nativeEnum(TransactionCategory).optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  customCategory: z.string().optional(),
  cashFlowCategory: z.string().optional(),
  cashFlowType: z.string().optional(),
  budgetCategory: z.string().optional(),
  businessPurpose: z.string().optional(),
  notes: z.string().optional(),
})

export const splitTransactionHandler = protectedProcedure
  .input(
    z.object({
      transactionId: z.string(),
      parts: z.array(splitTransactionPartSchema).min(2),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId
    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      })
    }

    // Check if transaction exists and belongs to user
    const originalTransaction = await prisma.transaction.findUnique({
      where: { id: input.transactionId },
    })

    if (!originalTransaction || originalTransaction.userId !== userId) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Transaction not found',
      })
    }

    // Validate total amount of splits matches original transaction amount
    const totalSplitAmount = input.parts.reduce(
      (sum, part) => sum + part.amount,
      0,
    )
    if (Math.abs(totalSplitAmount - originalTransaction.amount) > 0.01) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message:
          'Total amount of split parts must equal original transaction amount',
      })
    }

    // Create a transaction for each split part
    // We'll use a transaction to ensure all operations succeed or fail together
    const splitTransactions = await prisma.$transaction(async (tx) => {
      // Mark the original transaction as split
      const updatedOriginal = await tx.transaction.update({
        where: { id: input.transactionId },
        data: {
          isSplit: true,
          splitTotal: originalTransaction.amount,
          splitCount: input.parts.length,
          lastModifiedAt: new Date(),
          isModified: true,
        },
      })

      // Create split transactions
      const splits = await Promise.all(
        input.parts.map(async (part, index) => {
          return tx.transaction.create({
            data: {
              // User and account relationships
              userId,
              bankAccountId: originalTransaction.bankAccountId,
              teamId: originalTransaction.teamId,

              // Base transaction details
              amount: part.amount,
              date: originalTransaction.date,
              name: `${originalTransaction.name} (Split ${index + 1})`,
              merchantName: originalTransaction.merchantName,
              isoCurrencyCode: originalTransaction.isoCurrencyCode,

              // Split-specific categorization
              description: part.description || originalTransaction.description,
              category: part.category || originalTransaction.category,
              subCategory: originalTransaction.subCategory,
              customCategory:
                part.customCategory || originalTransaction.customCategory,
              categoryIconUrl: originalTransaction.categoryIconUrl,
              categorySlug: originalTransaction.categorySlug,

              // Merchant information
              merchantId: originalTransaction.merchantId,
              merchantLogoUrl: originalTransaction.merchantLogoUrl,
              merchantCategory: originalTransaction.merchantCategory,

              // Payment details
              paymentChannel: originalTransaction.paymentChannel,
              paymentMethod: originalTransaction.paymentMethod,
              paymentProcessor: originalTransaction.paymentProcessor,
              transactionType: originalTransaction.transactionType,
              transactionMethod: originalTransaction.transactionMethod,
              pending: originalTransaction.pending,

              // Categorization for financial planning
              cashFlowCategory:
                part.cashFlowCategory || originalTransaction.cashFlowCategory,
              cashFlowType:
                part.cashFlowType || originalTransaction.cashFlowType,
              budgetCategory:
                part.budgetCategory || originalTransaction.budgetCategory,
              businessPurpose:
                part.businessPurpose || originalTransaction.businessPurpose,

              // Tags and notes
              tags: part.tags || originalTransaction.tags,
              notes: part.notes || originalTransaction.notes,

              // Split relationship
              parentTransactionId: input.transactionId,

              // Metadata
              isModified: true,
              isManual: false,
              createdAt: new Date(),
              updatedAt: new Date(),
              lastModifiedAt: new Date(),
              searchableText: `${originalTransaction.name} ${part.description || originalTransaction.description} split`,
            },
          })
        }),
      )

      return { originalTransaction: updatedOriginal, splitTransactions: splits }
    })

    return splitTransactions
  })

// Define the return schema for split transactions
const splitTransactionResultSchema = z.object({
  originalTransaction: z.any(),
  splitTransactions: z.array(z.any()),
})

export const getSplitTransactionsHandler = protectedProcedure
  .input(z.object({ transactionId: z.string() }))
  .output(splitTransactionResultSchema)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session?.userId
    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      })
    }

    // Check if transaction exists and belongs to user with enhanced query
    const transaction = await prisma.transaction.findUnique({
      where: { id: input.transactionId },
      include: {
        bankAccount: {
          select: {
            name: true,
            displayName: true,
            type: true,
            subtype: true,
          },
        },
        transactionCategory: true,
      },
    })

    if (!transaction || transaction.userId !== userId) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Transaction not found',
      })
    }

    // If this is a parent transaction, get all its splits
    if (transaction.isSplit) {
      const splitTransactions = await prisma.transaction.findMany({
        where: {
          parentTransactionId: input.transactionId,
        },
        include: {
          bankAccount: {
            select: {
              name: true,
              displayName: true,
              type: true,
              subtype: true,
            },
          },
          transactionCategory: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return {
        originalTransaction: transaction,
        splitTransactions,
      }
    }

    // If this is a split part, get its parent and siblings
    if (transaction.parentTransactionId) {
      const parentTransaction = await prisma.transaction.findUnique({
        where: { id: transaction.parentTransactionId },
        include: {
          bankAccount: {
            select: {
              name: true,
              displayName: true,
              type: true,
              subtype: true,
            },
          },
          transactionCategory: true,
        },
      })

      const siblingTransactions = await prisma.transaction.findMany({
        where: {
          parentTransactionId: transaction.parentTransactionId,
          id: { not: transaction.id }, // Exclude this transaction
        },
        include: {
          bankAccount: {
            select: {
              name: true,
              displayName: true,
              type: true,
              subtype: true,
            },
          },
          transactionCategory: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return {
        originalTransaction: parentTransaction,
        splitTransactions: [transaction, ...siblingTransactions],
      }
    }

    // If not a split transaction
    return {
      originalTransaction: transaction,
      splitTransactions: [],
    }
  })

// Define the return schema for recombining split transactions
const recombineResultSchema = z.object({
  success: z.boolean(),
  recombinedTransaction: z.any(),
})

export const recombineSplitTransactionHandler = protectedProcedure
  .input(z.object({ transactionId: z.string() }))
  .output(recombineResultSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId
    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      })
    }

    // Check if transaction exists, is marked as split, and belongs to user
    const parentTransaction = await prisma.transaction.findUnique({
      where: { id: input.transactionId },
      include: {
        bankAccount: true,
      },
    })

    if (!parentTransaction || parentTransaction.userId !== userId) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Transaction not found',
      })
    }

    if (!parentTransaction.isSplit) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Transaction is not split',
      })
    }

    // Find all split parts
    const splitParts = await prisma.transaction.findMany({
      where: {
        parentTransactionId: input.transactionId,
      },
    })

    // Use a transaction to ensure all operations succeed or fail together
    const updatedTransaction = await prisma.$transaction(async (tx) => {
      // Delete all split parts
      await Promise.all(
        splitParts.map(async (part) => {
          return tx.transaction.delete({
            where: { id: part.id },
          })
        }),
      )

      // Update parent transaction to no longer be split
      return tx.transaction.update({
        where: { id: input.transactionId },
        data: {
          isSplit: false,
          splitTotal: null,
          splitCount: null,
          lastModifiedAt: new Date(),
          isModified: true,
        },
        include: {
          bankAccount: {
            select: {
              name: true,
              displayName: true,
              type: true,
              subtype: true,
            },
          },
        },
      })
    })

    return { success: true, recombinedTransaction: updatedTransaction }
  })

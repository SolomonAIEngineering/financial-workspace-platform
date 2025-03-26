import { Prisma, prisma } from '@solomonai/prisma';

import { TRPCError } from '@trpc/server';
import { TransactionCategory } from '@solomonai/prisma/client';
import { protectedProcedure } from '../../../middlewares/procedures';
import { z } from 'zod';

// Define schemas for the batch transaction handler

// Transaction input schema
const transactionSchema = z.object({
  bankAccountId: z.string(),
  amount: z.number(),
  date: z.string().datetime(),
  name: z.string(),
  merchantName: z.string().optional(),
  description: z.string().optional(),
  pending: z.boolean().default(false),
  category: z.nativeEnum(TransactionCategory).optional(),
  paymentMethod: z.string().optional(),
  tags: z.array(z.string()).optional(),

  // Tax & Financial Information
  taxDeductible: z.boolean().optional(),
  taxExempt: z.boolean().optional(),
  taxAmount: z.number().optional(),
  taxRate: z.number().optional(),
  taxCategory: z.string().optional(),
  vatAmount: z.number().optional(),
  vatRate: z.number().optional(),

  // Additional financial flags
  excludeFromBudget: z.boolean().optional(),
  reimbursable: z.boolean().optional(),
  plannedExpense: z.boolean().optional(),
  discretionary: z.boolean().optional(),

  // Business information
  businessPurpose: z.string().optional(),
  costCenter: z.string().optional(),
  projectCode: z.string().optional(),
  cashFlowCategory: z.string().optional(),
  cashFlowType: z.string().optional(),
});

// Failed batch information schema
const failedBatchSchema = z.object({
  batchIndex: z.number(),
  startIndex: z.number(),
  endIndex: z.number(),
  error: z.string()
});

// Result schema with detailed status information
const batchResultSchema = z.object({
  transactions: z.array(z.any()),  // Using any since we don't know the exact Prisma return type
  status: z.enum(['SUCCESS', 'PARTIAL_SUCCESS']),
  totalProcessed: z.number(),
  totalRequested: z.number(),
  failedBatches: z.array(failedBatchSchema).optional()
});

export const createBatchTransactionsHandler = protectedProcedure
  .input(
    z.object({
      transactions: z.array(transactionSchema),
      batchSize: z.number().int().positive().default(50).optional(),
    })
  )
  .output(batchResultSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId;
    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    // Get all unique bank account IDs from input
    const bankAccountIds = [
      ...new Set(input.transactions.map((tx) => tx.bankAccountId)),
    ];

    // Ensure all bank accounts exist and belong to the user
    const bankAccounts = await prisma.bankAccount.findMany({
      where: {
        id: { in: bankAccountIds },
        userId,
      },
    });

    if (bankAccounts.length !== bankAccountIds.length) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'One or more bank accounts not found or not owned by user',
      });
    }

    // Process transactions in smaller batches to prevent DB overload
    const BATCH_SIZE = input.batchSize || 50; // Use provided batch size or default to 50
    const allTransactions = input.transactions;
    const totalTransactions = allTransactions.length;
    const createdTransactions = [];
    const failedBatches = [];

    // Process transactions in batches
    for (let i = 0; i < totalTransactions; i += BATCH_SIZE) {
      const batchIndex = Math.floor(i / BATCH_SIZE);
      const batchTransactions = allTransactions.slice(i, i + BATCH_SIZE);

      try {
        // Create this batch of transactions in a transaction
        const batchResults = await prisma.$transaction(
          batchTransactions.map((tx) =>
            prisma.transaction.create({
              data: {
                ...tx,
                userId,
                date: new Date(tx.date),
              },
            })
          )
        );

        createdTransactions.push(...batchResults);
        console.log(`Successfully processed batch ${batchIndex + 1} (${batchResults.length} transactions)`);
      } catch (error) {
        // Log the error and continue with next batch
        console.error(`Error processing batch ${batchIndex + 1}:`, error);
        failedBatches.push({
          batchIndex,
          startIndex: i,
          endIndex: Math.min(i + BATCH_SIZE - 1, totalTransactions - 1),
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // If all batches failed, throw an error
    if (createdTransactions.length === 0 && failedBatches.length > 0) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `All transaction batches failed to process. First error: ${failedBatches[0].error}`,
      });
    }

    return {
      transactions: createdTransactions,
      status: failedBatches.length > 0 ? 'PARTIAL_SUCCESS' : 'SUCCESS',
      totalProcessed: createdTransactions.length,
      totalRequested: totalTransactions,
      failedBatches: failedBatches.length > 0 ? failedBatches : undefined
    };
  });

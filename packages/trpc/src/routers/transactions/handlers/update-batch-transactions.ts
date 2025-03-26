import { TRPCError } from '@trpc/server';
import { Prisma, prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';
import { z } from 'zod';
import { TransactionCategory } from '@solomonai/prisma/client';

// Transaction schema
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

export const updateBatchTransactionsHandler = protectedProcedure
  .input(
    z.object({
      transactions: z.array(
        z.object({
          id: z.string(),
          data: transactionSchema.partial(),
        })
      ),
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

    const results = await Promise.all(
      input.transactions.map(async (txInput) => {
        try {
          // Verify transaction belongs to user
          const existingTransaction = await prisma.transaction.findUnique({
            where: { id: txInput.id },
          });

          if (!existingTransaction || existingTransaction.userId !== userId) {
            return {
              id: txInput.id,
              success: false,
              error: 'Transaction not found or not owned by user',
            };
          }

          // Update transaction
          const updated = await prisma.transaction.update({
            where: { id: txInput.id },
            data: {
              ...txInput.data,
              // Convert date string to Date object if provided
              ...(txInput.data.date
                ? { date: new Date(txInput.data.date) }
                : {}),
            },
          });

          return {
            id: txInput.id,
            success: true,
            transaction: updated,
          };
        } catch (error) {
          console.error(`Error updating transaction ${txInput.id}:`, error);
          return {
            id: txInput.id,
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

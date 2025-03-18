import { EnrichmentService } from '../../utils/transaction-enrichment';
import { Transaction } from '@/server/types/index';
import { prisma } from '@/server/db';
import { schemaTask } from '@trigger.dev/sdk/v3';
import { z } from 'zod';

// Define a simplified transaction schema for input
const transactionInputSchema = z.object({
  id: z.string(),
  name: z.string(),
  // Include optional fields for better AI analysis
  description: z.string().nullable().optional(),
  amount: z.number().optional(),
  date: z.string().or(z.date()).nullable().optional(),
  merchantName: z.string().nullable().optional(),
  pending: z.boolean().optional(),
  category: z.string().nullable().optional(),
  subCategory: z.string().nullable().optional(),
  categoryIconUrl: z.string().nullable().optional(),
  customCategory: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  paymentChannel: z.string().nullable().optional(),
  paymentMethod: z.string().nullable().optional(),
  originalDescription: z.string().nullable().optional(),
  originalCategory: z.string().nullable().optional(),
  originalMerchantName: z.string().nullable().optional(),
  excludeFromBudget: z.boolean().optional(),
  isRecurring: z.boolean().optional(),
  recurrenceId: z.string().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  notes: z.string().nullable().optional(),
  parentTransactionId: z.string().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

type TransactionInput = z.infer<typeof transactionInputSchema>;

export const enrichTransactions = schemaTask({
  id: 'enrich-transactions',
  schema: z.object({
    transactions: z.array(transactionInputSchema),
  }),
  maxDuration: 300,
  queue: {
    concurrencyLimit: 10,
  },
  run: async ({ transactions }) => {
    const enrichmentService = new EnrichmentService();

    // Convert input transactions to the Transaction type expected by the enrichment service
    const transactionsForEnrichment: Transaction[] = transactions.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description || null,
      amount: t.amount || 0,
      date: t.date ? new Date(t.date) : new Date(),
      merchantName: t.merchantName || null,
      // Fill in required fields with default values
      userId: '',
      bankAccountId: '',
      bankConnectionId: '',
      plaidTransactionId: '',
      pending: false,
      category: null,
      subCategory: null,
      categoryIconUrl: null,
      customCategory: null,
      location: null,
      paymentChannel: null,
      paymentMethod: null,
      originalDescription: null,
      originalCategory: null,
      originalMerchantName: null,
      excludeFromBudget: false,
      isRecurring: false,
      recurrenceId: null,
      tags: [],
      notes: null,
      parentTransactionId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isoCurrencyCode: null,
    }));

    const data = await enrichmentService.batchEnrichTransactions(
      transactionsForEnrichment
    );

    // Update the transactions with enriched data
    await prisma.transaction.updateMany({
      where: {
        id: {
          in: data.map((t) => t.id),
        },
      },
      data: {
        categorySlug: data.map((t) => t.category_slug).join(','),
      },
    });

    return {
      enrichmentCompleted: true,
      transactionsProcessed: data.length,
      categories: data.map((t) => t.category_slug).filter(Boolean),
    };
  },
});

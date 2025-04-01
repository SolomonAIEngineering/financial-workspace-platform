import { Task, schemaTask } from '@trigger.dev/sdk/v3';

import { EnrichmentService } from '../../utils/transaction-enrichment';
import { Transaction } from '@solomonai/prisma';
import { logger } from '@trigger.dev/sdk/v3';
import { prisma } from '@solomonai/prisma';
import { z } from 'zod';

/**
 * Schema defining the transaction data structure for enrichment
 * This serves as the single source of truth for transaction input types
 */
const transactionInputSchema = z.object({
  id: z.string().describe('Unique identifier for the transaction'),
  name: z.string().describe('Transaction name or description from the bank'),
  description: z.string().nullable().optional().describe('Additional transaction details'),
  amount: z.number().optional().describe('Transaction amount'),
  date: z.string().or(z.date()).nullable().optional().describe('Transaction date'),
  merchantName: z.string().nullable().optional().describe('Name of the merchant'),
  pending: z.boolean().optional().describe('Whether the transaction is pending'),
  category: z.string().nullable().optional().describe('Primary transaction category'),
  subCategory: z.string().nullable().optional().describe('Sub-category of the transaction'),
  categoryIconUrl: z.string().nullable().optional().describe('URL to category icon'),
  customCategory: z.string().nullable().optional().describe('User-defined category'),
  location: z.string().nullable().optional().describe('Transaction location'),
  paymentChannel: z.string().nullable().optional().describe('Channel used for payment'),
  paymentMethod: z.string().nullable().optional().describe('Method used for payment'),
  originalDescription: z.string().nullable().optional().describe('Original description from bank'),
  originalCategory: z.string().nullable().optional().describe('Original category from bank'),
  originalMerchantName: z.string().nullable().optional().describe('Original merchant name from bank'),
  excludeFromBudget: z.boolean().optional().describe('Whether to exclude from budget calculations'),
  isRecurring: z.boolean().optional().describe('Whether this is a recurring transaction'),
  recurrenceId: z.string().nullable().optional().describe('ID linking recurring transactions'),
  tags: z.array(z.string()).nullable().optional().describe('User-defined tags'),
  notes: z.string().nullable().optional().describe('User notes about the transaction'),
  parentTransactionId: z.string().nullable().optional().describe('Parent transaction ID'),
  createdAt: z.string().or(z.date()).nullable().optional().describe('Creation timestamp'),
  updatedAt: z.string().or(z.date()).nullable().optional().describe('Last update timestamp'),
});

/**
 * Type definition inferred from the Zod schema
 */
type TransactionInput = z.infer<typeof transactionInputSchema>;

/**
 * Schema for input parameters to the enrichment task
 */
const enrichTransactionsInputSchema = z.object({
  transactions: z.array(transactionInputSchema).describe('Array of transactions to enrich'),
});

/**
 * Schema for output results from the enrichment task
 */
const enrichTransactionsOutputSchema = z.object({
  enrichmentCompleted: z.boolean().describe('Whether the enrichment process completed successfully'),
  transactionsProcessed: z.number().describe('Number of transactions that were processed'),
  categories: z.array(z.string()).describe('List of unique categories assigned to transactions'),
  errors: z.array(z.string()).optional().describe('Any errors encountered during processing'),
});

/**
 * Input parameters for the enrichment task derived from the schema
 */
type EnrichTransactionsInput = z.infer<typeof enrichTransactionsInputSchema>;

/**
 * Output results from the enrichment task derived from the schema
 */
type EnrichTransactionsOutput = z.infer<typeof enrichTransactionsOutputSchema>;

/**
 * Type definitions derived from Zod schemas
 */
type EnrichmentResult = { id: string; category_slug: string | null };

/**
 * Converts transaction input data to the format expected by the enrichment service
 * 
 * @param transactions - Array of transaction inputs
 * @returns Array of properly formatted Transaction objects
 */
function mapToEnrichmentFormat(transactions: TransactionInput[]): Transaction[] {
  return transactions.map((t) => ({
    // Required fields
    id: t.id,
    name: t.name,
    userId: '',
    bankAccountId: '',
    bankConnectionId: '',
    plaidTransactionId: '',

    // Fields with default values
    amount: t.amount ?? 0,
    date: t.date ? new Date(t.date) : new Date(),
    pending: t.pending ?? false,
    excludeFromBudget: t.excludeFromBudget ?? false,
    isRecurring: t.isRecurring ?? false,
    createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
    updatedAt: t.updatedAt ? new Date(t.updatedAt) : new Date(),

    // Optional fields with null defaults
    description: t.description ?? null,
    merchantName: t.merchantName ?? null,
    category: t.category ?? null,
    subCategory: t.subCategory ?? null,
    categoryIconUrl: t.categoryIconUrl ?? null,
    customCategory: t.customCategory ?? null,
    location: t.location ?? null,
    paymentChannel: t.paymentChannel ?? null,
    paymentMethod: t.paymentMethod ?? null,
    originalDescription: t.originalDescription ?? null,
    originalCategory: t.originalCategory ?? null,
    originalMerchantName: t.originalMerchantName ?? null,
    recurrenceId: t.recurrenceId ?? null,
    tags: t.tags ?? [],
    notes: t.notes ?? null,
    parentTransactionId: t.parentTransactionId ?? null,
    isoCurrencyCode: null,
  })) as unknown as Transaction[];
}

/**
 * Updates transactions in the database with enriched data
 * 
 * @param enrichmentResults - Results from the enrichment service
 * @returns Number of transactions successfully updated
 */
async function updateTransactionsWithEnrichedData(
  enrichmentResults: EnrichmentResult[]
): Promise<number> {
  if (enrichmentResults.length === 0) {
    return 0;
  }

  // Group transactions by category for more efficient updates
  const transactionsByCategory = new Map<string, string[]>();

  enrichmentResults.forEach(({ id, category_slug }) => {
    if (!category_slug) return;

    const existingIds = transactionsByCategory.get(category_slug) || [];
    existingIds.push(id);
    transactionsByCategory.set(category_slug, existingIds);
  });

  // Perform one update per category in batches
  const updatePromises = Array.from(transactionsByCategory.entries()).map(
    ([categorySlug, transactionIds]) =>
      prisma.transaction.updateMany({
        where: { id: { in: transactionIds } },
        data: { categorySlug }
      })
  );

  try {
    const results = await Promise.all(updatePromises);
    // Sum all the counts from the returned BatchPayload objects
    return results.reduce((total, result) => total + result.count, 0);
  } catch (error) {
    logger.error('Failed to update transactions with enriched data', { error });
    return 0;
  }
}

/**
 * Task for enriching transaction data with additional metadata
 */
export const enrichTransactions: Task<
  'enrich-transactions',
  EnrichTransactionsInput,
  EnrichTransactionsOutput
> = schemaTask({
  id: 'enrich-transactions',
  schema: enrichTransactionsInputSchema,
  maxDuration: 300,
  queue: {
    concurrencyLimit: 10,
  },
  run: async ({ transactions }) => {
    const errors: string[] = [];
    let enrichmentResults: EnrichmentResult[] = [];

    try {
      // Initialize the enrichment service
      const enrichmentService = new EnrichmentService();

      // Convert input transactions to the format expected by the enrichment service
      const transactionsForEnrichment = mapToEnrichmentFormat(transactions);

      // Log transaction processing
      logger.info(`Processing ${transactionsForEnrichment.length} transactions for enrichment`);

      // Send to enrichment service
      enrichmentResults = await enrichmentService.batchEnrichTransactions(
        transactionsForEnrichment
      );

      // Update transactions with enriched data
      await updateTransactionsWithEnrichedData(enrichmentResults);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(`Enrichment process failed: ${errorMessage}`);
      logger.error('Transaction enrichment failed', { error });
    }

    // Extract categories, ensuring we filter out any null values
    const categories = enrichmentResults
      .map((result) => result.category_slug)
      .filter((category): category is string => Boolean(category));

    // Return results
    return {
      enrichmentCompleted: errors.length === 0,
      transactionsProcessed: enrichmentResults.length,
      categories,
      errors: errors.length > 0 ? errors : undefined,
    };
  },
});

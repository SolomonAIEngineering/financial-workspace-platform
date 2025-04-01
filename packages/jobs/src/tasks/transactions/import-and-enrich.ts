import {
  ENRICHMENT_BATCH_SIZE,
  IMPORT_BATCH_SIZE,
  ImportAndEnrichInput,
  ImportAndEnrichOutput,
  TransactionForEnrichment,
  importAndEnrichInputSchema,
  importAndEnrichOutputSchema,
  transactionForEnrichmentSchema
} from './schema';
import { Prisma, Transaction } from '@solomonai/prisma/client';
import { Task, logger, schemaTask } from '@trigger.dev/sdk/v3';

import { EnrichmentService } from '../../utils/transaction-enrichment';
import Papa from 'papaparse';
import { getFileContent } from '@solomonai/lib/clients';
import { mapTransactions } from '@solomonai/import/mappings';
import { prisma } from '@solomonai/prisma';
import { processBatch } from '../../utils/process-batch';
import { revalidateCache } from '../../utils/revalidate-cache';
import { transform } from '@solomonai/import/transform';
import { z } from 'zod';

// Validation schema for imported transactions
const importedTransactionSchema = z.object({
  internal_id: z.string(),
  id: z.string().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),
  amount: z.union([z.string(), z.number()]),
  date: z.union([z.string(), z.instanceof(Date)]),
  merchant_name: z.string().nullable().optional(),
  bank_account_id: z.string(),
  currency: z.string(),
  category_slug: z.string().nullable().optional(),
  method: z.string().nullable().optional(),
  status: z.string().optional()
});

// Validation schema for enriched transactions
const enrichedTransactionSchema = z.object({
  id: z.string(),
  category_slug: z.string().nullable().optional(),
  is_recurring: z.boolean().optional(),
  confidence: z.number().nullable().optional(),
  merchant_category: z.string().nullable().optional(),
  business_purpose: z.string().nullable().optional(),
  need_want_category: z.string().nullable().optional(),
  cash_flow_type: z.string().nullable().optional(),
  tax_deductible: z.boolean().optional().default(false)
});

// Use Zod's infer to derive types from schemas
type ImportedTransaction = z.infer<typeof importedTransactionSchema>;
type EnrichedTransaction = z.infer<typeof enrichedTransactionSchema>;
type FormattedTransaction = Prisma.TransactionCreateManyInput;

/**
 * Validates an array of transactions to ensure they contain the required fields.
 *
 * @param transactions - Array of transaction objects to validate
 * @returns Object containing arrays of valid and invalid transactions
 */
const validateTransactions = (transactions: unknown[]): {
  validTransactions: ImportedTransaction[];
  invalidTransactions: unknown[];
} => {
  const validTransactions: ImportedTransaction[] = [];
  const invalidTransactions: unknown[] = [];

  transactions.forEach((transaction) => {
    try {
      // Use schema validation instead of manual field checking
      const validatedTransaction = importedTransactionSchema.parse(transaction);
      validTransactions.push(validatedTransaction);
    } catch (error) {
      invalidTransactions.push(transaction);
    }
  });

  return { validTransactions, invalidTransactions };
};

/**
 * Safely converts a string or number to a number
 * 
 * @param value - The value to convert
 * @param defaultValue - The default value if conversion fails
 * @returns A valid number or the default value
 */
function safeNumberConversion(value: string | number | undefined | null, defaultValue = 0): number {
  if (value === undefined || value === null) return defaultValue;

  const num = typeof value === 'string' ? Number(value) : value;
  return isNaN(num) ? defaultValue : num;
}

/**
 * Safely creates a Date object
 * 
 * @param value - The date value to convert
 * @param defaultValue - The default date to use if conversion fails
 * @returns A valid Date object
 */
function safeDate(value: string | Date | undefined | null, defaultValue = new Date()): Date {
  if (!value) return defaultValue;

  if (value instanceof Date) return value;

  const date = new Date(value);
  return isNaN(date.getTime()) ? defaultValue : date;
}

/**
 * Processes CSV data and extracts transactions
 * 
 * @param fileUrl - URL or key for the CSV file
 * @param mappings - Column mappings for CSV data
 * @param currency - Currency code for transactions
 * @param teamId - Team ID for the transactions
 * @param bankAccountId - Bank account ID for the transactions
 * @param inverted - Whether amounts should be inverted
 * @returns Array of valid transactions
 */
async function processCsvImport(
  fileUrl: string,
  mappings: ImportAndEnrichInput['mappings'],
  currency: string,
  teamId: string,
  bankAccountId: string,
  inverted: boolean
): Promise<ImportedTransaction[]> {
  const content = await getFileContent(fileUrl);

  if (!content) {
    throw new Error('CSV file content is empty or could not be retrieved');
  }

  return new Promise((resolve, reject) => {
    let allTransactions: ImportedTransaction[] = [];

    Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      worker: false,
      complete: () => resolve(allTransactions),
      error: reject,
      chunk: async (
        chunk: {
          data: Record<string, string>[];
          errors: Array<{ message: string }>;
        },
        parser: Papa.Parser
      ) => {
        parser.pause();

        const { data } = chunk;

        if (!data?.length) {
          parser.resume();
          return;
        }

        try {
          // Map raw CSV data to transaction format
          const mappedTransactions = mapTransactions(
            data,
            mappings,
            currency,
            teamId,
            bankAccountId
          );

          // Transform and validate transactions
          const transactions = mappedTransactions.map((transaction) =>
            transform({
              transaction,
              inverted,
              timezone: 'UTC',
              dateAdjustment: 0,
            })
          );

          const { validTransactions, invalidTransactions } = validateTransactions(transactions);

          if (invalidTransactions.length > 0) {
            logger.warn('Invalid transactions found in CSV chunk', {
              invalidCount: invalidTransactions.length,
              sampleInvalid: invalidTransactions.slice(0, 3)
            });
          }

          // Add valid transactions to the collection
          allTransactions = [...allTransactions, ...validTransactions];
        } catch (error) {
          logger.error('Error processing CSV chunk', { error });
        }

        parser.resume();
      },
    });
  });
}

/**
 * Processes image-extracted table data and extracts transactions
 * 
 * @param tableData - Table data extracted from an image
 * @param mappings - Column mappings for table data
 * @param currency - Currency code for transactions
 * @param teamId - Team ID for the transactions
 * @param bankAccountId - Bank account ID for the transactions
 * @param inverted - Whether amounts should be inverted
 * @returns Array of valid transactions
 */
function processImageImport(
  tableData: Record<string, string>[],
  mappings: ImportAndEnrichInput['mappings'],
  currency: string,
  teamId: string,
  bankAccountId: string,
  inverted: boolean
): ImportedTransaction[] {
  // Map table data to transaction format
  const mappedTransactions = mapTransactions(
    tableData,
    mappings,
    currency,
    teamId,
    bankAccountId
  );

  // Transform transactions
  const transactions = mappedTransactions.map((transaction) =>
    transform({
      transaction,
      inverted,
      timezone: 'UTC',
      dateAdjustment: 0,
    })
  );

  // Validate transactions
  const { validTransactions, invalidTransactions } = validateTransactions(transactions);

  if (invalidTransactions.length > 0) {
    logger.warn('Invalid transactions found in image data', {
      invalidCount: invalidTransactions.length,
      sampleInvalid: invalidTransactions.slice(0, 3)
    });
  }

  return validTransactions;
}

/**
 * Saves transactions directly to the database without enrichment
 * 
 * @param transactions - Array of transactions to save
 * @param teamId - Team ID for the transactions
 * @returns Number of transactions saved
 */
async function saveTransactionsDirectly(
  transactions: ImportedTransaction[],
  teamId: string
): Promise<number> {
  let savedCount = 0;

  await processBatch(
    transactions,
    IMPORT_BATCH_SIZE,
    async (batch) => {
      const formattedBatch: FormattedTransaction[] = batch.map((tx) => ({
        id: tx.internal_id,
        userId: teamId,
        bankAccountId: tx.bank_account_id,
        amount: safeNumberConversion(tx.amount),
        date: safeDate(tx.date),
        name: tx.name,
        description: tx.description ?? tx.name ?? null,
        status: tx.status ?? 'posted',
        currency: tx.currency,
        categorySlug: tx.category_slug ?? null,
        method: tx.method ?? 'other',
        isManual: true,
      }));

      try {
        const result = await prisma.transaction.createMany({
          data: formattedBatch,
          skipDuplicates: true,
        });
        savedCount += result.count;
      } catch (error) {
        logger.error('Failed to save transactions batch', { error, batchSize: batch.length });
        throw error;
      }

      return batch;
    }
  );

  return savedCount;
}

/**
 * Prepares transactions for enrichment by mapping them to the required format
 * 
 * @param transactions - Array of transactions to prepare
 * @param bankAccountId - Bank account ID for the transactions
 * @param currency - Currency code for transactions
 * @returns Array of transactions ready for enrichment
 */
function prepareTransactionsForEnrichment(
  transactions: ImportedTransaction[],
  bankAccountId: string,
  currency: string
): TransactionForEnrichment[] {
  // Map transactions to format needed for enrichment
  const transactionsForEnrichment = transactions.map((t) => ({
    id: t.id ?? t.internal_id,
    name: t.name ?? t.description ?? '',
    description: t.description ?? null,
    amount: safeNumberConversion(t.amount),
    date: safeDate(t.date),
    merchantName: t.merchant_name ?? null,
    // Fill in the minimum required fields for the enrichment service
    userId: '',
    bankAccountId: bankAccountId,
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
    isoCurrencyCode: currency,
  }));

  // Validate transactions against schema
  return transactionsForEnrichment.map(tx => {
    try {
      return transactionForEnrichmentSchema.parse(tx);
    } catch (error) {
      logger.warn('Invalid transaction for enrichment', {
        tx: { id: tx.id, name: tx.name },
        error
      });
      // Instead of returning the invalid transaction, return a safe default
      return transactionForEnrichmentSchema.parse({
        ...tx,
        id: tx.id ?? `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: tx.name ?? 'Unknown Transaction',
        amount: safeNumberConversion(tx.amount),
        date: safeDate(tx.date),
        userId: '',
        bankAccountId: bankAccountId,
        isoCurrencyCode: currency,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  });
}

/**
 * Enriches transactions using AI
 * 
 * @param transactionsForEnrichment - Array of transactions to enrich
 * @param enrichmentService - EnrichmentService instance
 * @returns Array of enriched transactions
 */
async function enrichTransactions(
  transactionsForEnrichment: TransactionForEnrichment[],
  enrichmentService: EnrichmentService
): Promise<EnrichedTransaction[]> {
  return await processBatch(
    transactionsForEnrichment,
    ENRICHMENT_BATCH_SIZE,
    async (batch) => {
      try {
        // The enrichment service expects Transaction type, but our TransactionForEnrichment
        // should be compatible with what the service needs
        const enrichedBatch = await enrichmentService.batchEnrichTransactions(
          batch as unknown as Transaction[]
        );

        // Validate the enriched data
        return enrichedBatch.map(tx => {
          // Convert the transaction data to our enriched transaction schema
          try {
            return enrichedTransactionSchema.parse({
              id: tx.id ?? '',
              category_slug: tx.category_slug ?? null,
              is_recurring: tx.is_recurring ?? false,
              confidence: tx.confidence ?? null,
              merchant_category: tx.merchant_category ?? null,
              business_purpose: tx.business_purpose ?? null,
              need_want_category: tx.need_want_category ?? null,
              cash_flow_type: tx.cash_flow_type ?? null,
              tax_deductible: tx.tax_deductible ?? false,
            });
          } catch (error) {
            logger.warn('Invalid enriched transaction data', {
              txId: tx.id,
              error
            });
            // Return a valid default
            return enrichedTransactionSchema.parse({
              id: tx.id ?? '',
              category_slug: null,
              is_recurring: false
            });
          }
        });
      } catch (error) {
        logger.error('Failed to enrich transactions batch', {
          error,
          batchSize: batch.length
        });
        throw error;
      }
    }
  );
}

/**
 * Saves enriched transactions to the database
 * 
 * @param enrichedTransactions - Array of enriched transactions
 * @param originalTransactions - Array of original transactions
 * @param teamId - Team ID for the transactions
 * @returns Number of transactions saved
 */
async function saveEnrichedTransactions(
  enrichedTransactions: EnrichedTransaction[],
  originalTransactions: ImportedTransaction[],
  teamId: string
): Promise<number> {
  let savedCount = 0;

  await processBatch(
    enrichedTransactions,
    IMPORT_BATCH_SIZE,
    async (enrichedBatch) => {
      // For each enriched transaction, find the original and merge the enrichment data
      const batchItems = enrichedBatch
        .map((enriched) => {
          // Only proceed if we have a valid ID
          if (!enriched.id) {
            logger.warn('Enriched transaction missing ID', { enriched });
            return null;
          }

          const original = originalTransactions.find(
            (t) => (t.id && t.id === enriched.id) || t.internal_id === enriched.id
          );

          if (!original) {
            logger.warn('Original transaction not found for enriched data', {
              enrichedId: enriched.id
            });
            return null;
          }

          return {
            id: original.internal_id,
            userId: teamId,
            bankAccountId: original.bank_account_id,
            amount: safeNumberConversion(original.amount),
            date: safeDate(original.date),
            name: original.name,
            description: original.description ?? original.name ?? null,
            status: original.status ?? 'posted',
            currency: original.currency,
            categorySlug: enriched.category_slug ?? null,
            method: original.method ?? 'other',
            isManual: true,
            isRecurring: enriched.is_recurring ?? false,
            confidenceScore: enriched.confidence ?? null,
            merchantCategory: enriched.merchant_category ?? null,
            businessPurpose: enriched.business_purpose ?? null,
            needsWantsCategory: enriched.need_want_category ?? null,
            cashFlowType: enriched.cash_flow_type ?? null,
            taxDeductible: enriched.tax_deductible ?? false,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      const mergedBatch: FormattedTransaction[] = batchItems;

      try {
        if (mergedBatch.length > 0) {
          const result = await prisma.transaction.createMany({
            data: mergedBatch,
            skipDuplicates: true,
          });
          savedCount += result.count;
        }
      } catch (error) {
        logger.error('Failed to save enriched transactions batch', {
          error,
          batchSize: mergedBatch.length
        });
        throw error;
      }

      return mergedBatch;
    }
  );

  return savedCount;
}

/**
 * Task that imports transactions from a CSV file or image-extracted table,
 * optionally enriches them with AI, and stores them in the database.
 *
 * This task performs a multi-step process:
 *
 * 1. Import transactions from the specified source (CSV file or table data)
 * 2. Optionally enrich the transactions with AI to add categorization and other
 *    metadata
 * 3. Store the processed transactions in the database
 * 4. Revalidate caches to ensure data consistency
 */
export const importAndEnrichTransactions: Task<
  'import-and-enrich-transactions',
  ImportAndEnrichInput,
  ImportAndEnrichOutput
> = schemaTask({
  id: 'import-and-enrich-transactions',
  schema: importAndEnrichInputSchema,
  maxDuration: 600, // Longer duration for combined job
  queue: {
    concurrencyLimit: 5, // Reduced concurrency for AI processing
  },
  /**
   * Main execution function for the import and enrich task.
   *
   * @param params - Task parameters defined by the schema
   * @returns Object containing information about the import and enrichment
   *   process
   */
  run: async ({
    teamId,
    filePath,
    importType,
    bankAccountId,
    currency,
    mappings,
    inverted,
    table,
    shouldEnrich = true, // Provide default value to ensure it's always defined
  }) => {
    const enrichmentService = new EnrichmentService();
    let importedTransactions: ImportedTransaction[] = [];

    // Step 1: Import transactions
    return await logger.trace('import-and-enrich', async (span) => {
      try {
        span.setAttribute('import-type', importType);
        span.setAttribute('team-id', teamId);

        // Import process
        logger.info('Starting transaction import', { importType });

        // Process imports based on type
        switch (importType) {
          case 'csv': {
            if (!filePath || filePath.length === 0) {
              throw new Error('File path is required for CSV import');
            }

            // Process CSV file
            importedTransactions = await processCsvImport(
              filePath[0],
              mappings,
              currency,
              teamId,
              bankAccountId,
              inverted
            );
            break;
          }

          case 'image': {
            if (!table || table.length === 0) {
              throw new Error('Table data is required for image import');
            }

            // Process image-extracted table
            importedTransactions = processImageImport(
              table,
              mappings,
              currency,
              teamId,
              bankAccountId,
              inverted
            );
            break;
          }

          default: {
            throw new Error(`Unsupported import type: ${importType}`);
          }
        }

        logger.info('Import completed', {
          transactionsCount: importedTransactions.length,
        });

        // Save directly if enrichment is not required
        if (!shouldEnrich) {
          const savedCount = await saveTransactionsDirectly(importedTransactions, teamId);

          // Revalidate cache
          await revalidateCache({ tag: 'transactions', id: teamId });

          return {
            success: true,
            importedCount: importedTransactions.length,
            enriched: false,
          };
        }

        // Step 2: Enrich transactions
        if (importedTransactions.length > 0) {
          logger.info('Starting transaction enrichment', {
            count: importedTransactions.length,
          });

          // Prepare transactions for enrichment
          const preparedTransactions = prepareTransactionsForEnrichment(
            importedTransactions,
            bankAccountId,
            currency
          );

          // Enrich transactions
          const enrichedTransactions = await enrichTransactions(
            preparedTransactions,
            enrichmentService
          );

          logger.info('Enrichment completed', {
            enrichedCount: enrichedTransactions.length,
          });

          // Step 3: Save enriched transactions
          const savedCount = await saveEnrichedTransactions(
            enrichedTransactions,
            importedTransactions,
            teamId
          );

          logger.info('Enriched transactions saved', {
            count: savedCount,
          });
        }

        // Final step: Revalidate cache
        await revalidateCache({ tag: 'transactions', id: teamId });

        // Return result that matches the output schema
        return {
          success: true,
          importedCount: importedTransactions.length,
          enriched: true,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        logger.error('Import and enrichment failed', { error: errorMessage });
        span.setAttribute('error', errorMessage);
        throw error;
      }
    });
  },
}) as Task<
  'import-and-enrich-transactions',
  ImportAndEnrichInput,
  ImportAndEnrichOutput
>;

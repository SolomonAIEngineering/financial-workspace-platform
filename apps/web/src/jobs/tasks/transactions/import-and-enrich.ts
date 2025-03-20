import { logger, schemaTask } from '@trigger.dev/sdk/v3';

import { EnrichmentService } from '@/jobs/utils/transaction-enrichment';
import Papa from 'papaparse';
import { Prisma } from '@solomonai/prisma/client';
import { getFileContent } from '@/lib/uploadthing';
import { mapTransactions } from '@solomonai/import/mappings';
import { prisma } from '@/server/db';
import { processBatch } from '@/jobs/utils/process-batch';
import { revalidateCache } from '@/jobs/utils/revalidate-cache';
import { transform } from '@solomonai/import/transform';
import { z } from 'zod';

/**
 * The number of transactions to process in each batch for database operations.
 * Using batch processing improves performance when handling large datasets.
 */
const BATCH_SIZE = 500;

/**
 * The number of transactions to process in each batch for AI enrichment.
 * Smaller batch size for AI processing reduces memory usage and potential
 * timeouts.
 */
const ENRICHMENT_BATCH_SIZE = 50;

/**
 * Validates an array of transactions to ensure they contain the required
 * fields.
 *
 * @param transactions - Array of transaction objects to validate
 * @returns Object containing arrays of valid and invalid transactions
 */
const validateTransactions = (transactions: any[]) => {
  const validTransactions: any[] = [];
  const invalidTransactions: any[] = [];

  transactions.forEach((transaction) => {
    // Basic validation: check for required fields
    if (
      transaction &&
      transaction.internal_id &&
      transaction.amount !== undefined
    ) {
      validTransactions.push(transaction);
    } else {
      invalidTransactions.push(transaction);
    }
  });

  return { validTransactions, invalidTransactions };
};

/**
 * Schema for transaction data needed for enrichment processing. Defines the
 * shape of transaction objects that will be sent to the enrichment service.
 */
const transactionForEnrichmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  amount: z.number().optional(),
  date: z.string().or(z.date()).nullable().optional(),
  merchantName: z.string().nullable().optional(),
});

/**
 * Type derived from the transaction enrichment schema. Used for type safety
 * when working with transactions to be enriched.
 */
type TransactionForEnrichment = z.infer<typeof transactionForEnrichmentSchema>;

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
export const importAndEnrichTransactions = schemaTask({
  id: 'import-and-enrich-transactions',
  schema: z.object({
    /** The type of import source (CSV file or image-extracted data) */
    importType: z.enum(['csv', 'image']),
    /** Whether the transaction amounts should be inverted (negative/positive) */
    inverted: z.boolean(),
    /** Array of file paths or URLs to the CSV files (required for CSV import) */
    filePath: z.array(z.string()).optional(),
    /** ID of the bank account to associate with the imported transactions */
    bankAccountId: z.string(),
    /** Currency code for the transaction amounts */
    currency: z.string(),
    /** ID of the team that owns the transactions */
    teamId: z.string(),
    /** Table data extracted from an image (required for image import) */
    table: z.array(z.record(z.string(), z.string())).optional(),
    /** Column mappings for interpreting CSV or table data */
    mappings: z.object({
      /** Column name that contains transaction amounts */
      amount: z.string(),
      /** Column name that contains transaction dates */
      date: z.string(),
      /** Column name that contains transaction descriptions */
      description: z.string(),
    }),
    /** Whether to perform AI enrichment on the transactions (default: true) */
    shouldEnrich: z.boolean().default(true),
  }),
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
    shouldEnrich,
  }) => {
    const enrichmentService = new EnrichmentService();
    let importedTransactions: any[] = [];

    // Step 1: Import transactions
    return await logger.trace('import-and-enrich', async (span) => {
      try {
        span.setAttribute('import-type', importType);
        span.setAttribute('team-id', teamId);

        // Import process
        logger.info('Starting transaction import', { importType });

        switch (importType) {
          case 'csv': {
            if (!filePath) {
              throw new Error('File path is required');
            }

            // Get file content from UploadThing using the file path as a key
            // This assumes filePath contains the UploadThing file key or URL
            const fileUrl = filePath[0]; // Use the first file path as the URL or key
            const content = await getFileContent(fileUrl);

            if (!content) {
              throw new Error('File content is required');
            }

            await new Promise((resolve, reject) => {
              Papa.parse(content, {
                header: true,
                skipEmptyLines: true,
                worker: false,
                complete: resolve,
                error: reject,
                /**
                 * Process each chunk of the CSV file. This allows handling
                 * large files without loading everything into memory.
                 *
                 * @param chunk - Data chunk from the CSV parser
                 * @param parser - Papa Parse instance for controlling parsing
                 *   flow
                 */
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
                    throw new Error('No data in CSV import chunk');
                  }

                  const mappedTransactions = mapTransactions(
                    data,
                    mappings,
                    currency,
                    teamId,
                    bankAccountId
                  );

                  const transactions = mappedTransactions.map((transaction) =>
                    transform({
                      transaction,
                      inverted,
                      timezone: 'UTC', // Default timezone if not provided
                      dateAdjustment: 0, // No adjustment needed
                    })
                  );

                  const { validTransactions, invalidTransactions } =
                    validateTransactions(transactions);

                  if (invalidTransactions.length > 0) {
                    logger.error('Invalid transactions', {
                      invalidTransactions,
                    });
                  }

                  // Store valid transactions for enrichment
                  importedTransactions =
                    importedTransactions.concat(validTransactions);

                  if (!shouldEnrich) {
                    // If not enriching, just insert directly
                    await processBatch(
                      validTransactions,
                      BATCH_SIZE,
                      /**
                       * Process a batch of transactions for database insertion.
                       *
                       * @param batch - Array of transactions to process
                       * @returns The original batch for downstream processing
                       */
                      async (batch) => {
                        const formattedBatch = batch.map((tx) => ({
                          id: tx.internal_id,
                          userId: teamId, // Required field
                          bankAccountId: tx.bank_account_id,
                          amount: Number(tx.amount),
                          date: new Date(tx.date || Date.now()),
                          name: tx.name,
                          description: tx.description || tx.name || null,
                          status: tx.status || 'posted',
                          currency: tx.currency,
                          categorySlug: tx.category_slug,
                          method: tx.method || 'other',
                          isManual: true,
                        }));

                        await prisma.transaction.createMany({
                          data: formattedBatch as unknown as Prisma.TransactionCreateManyInput[],
                          skipDuplicates: true,
                        });
                        return batch;
                      }
                    );
                  }

                  parser.resume();
                },
              });
            });

            break;
          }
          case 'image': {
            if (!table) {
              throw new Error('Table is required');
            }

            const mappedTransactions = mapTransactions(
              table,
              mappings,
              currency,
              teamId,
              bankAccountId
            );

            const transactions = mappedTransactions.map((transaction) =>
              transform({
                transaction,
                inverted,
                timezone: 'UTC', // Default timezone if not provided
                dateAdjustment: 0, // No adjustment needed
              })
            );

            const { validTransactions, invalidTransactions } =
              validateTransactions(transactions);

            if (invalidTransactions.length > 0) {
              logger.error('Invalid transactions', {
                invalidTransactions,
              });
            }

            // Store valid transactions for enrichment
            importedTransactions = validTransactions;

            if (!shouldEnrich) {
              // If not enriching, just insert directly
              await processBatch(
                validTransactions,
                BATCH_SIZE,
                async (batch) => {
                  const formattedBatch = batch.map((tx) => ({
                    id: tx.internal_id,
                    userId: teamId, // Required field
                    bankAccountId: tx.bank_account_id,
                    amount: Number(tx.amount),
                    date: new Date(tx.date || Date.now()),
                    name: tx.name,
                    description: tx.description || tx.name || null,
                    status: tx.status || 'posted',
                    currency: tx.currency,
                    categorySlug: tx.category_slug,
                    method: tx.method || 'other',
                    isManual: true,
                  }));

                  await prisma.transaction.createMany({
                    data: formattedBatch as unknown as Prisma.TransactionCreateManyInput[],
                    skipDuplicates: true,
                  });
                  return batch;
                }
              );
            }

            break;
          }
          default: {
            throw new Error('Invalid import type');
          }
        }

        logger.info('Import completed', {
          transactionsCount: importedTransactions.length,
        });

        // Step 2: Enrich transactions (if enabled)
        if (shouldEnrich && importedTransactions.length > 0) {
          logger.info('Starting transaction enrichment', {
            count: importedTransactions.length,
          });

          // Map transactions to format needed for enrichment
          const transactionsForEnrichment = importedTransactions.map((t) => ({
            id: t.id || t.internal_id,
            name: t.name || t.description,
            description: t.description,
            amount: Number.parseFloat(t.amount) || 0,
            date: t.date,
            merchantName: t.merchant_name,
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

          // Process enrichment in batches
          const enrichedTransactions = await processBatch(
            transactionsForEnrichment,
            ENRICHMENT_BATCH_SIZE,
            /**
             * Process a batch of transactions for AI enrichment. Sends the
             * transactions to the enrichment service and returns enriched
             * data.
             *
             * @param batch - Array of transactions to enrich
             * @returns Array of enriched transactions
             */
            async (batch) => {
              const enrichedBatch =
                await enrichmentService.batchEnrichTransactions(batch);
              return enrichedBatch;
            }
          );

          logger.info('Enrichment completed', {
            enrichedCount: enrichedTransactions.length,
          });

          // Step 3: Save enriched transactions
          await processBatch(
            enrichedTransactions,
            BATCH_SIZE,
            /**
             * Process a batch of enriched transactions for database insertion.
             * Merges the original transaction data with the enrichment data.
             *
             * @param enrichedBatch - Array of enriched transactions to process
             * @returns Array of merged transactions
             */
            async (enrichedBatch) => {
              // For each enriched transaction, find the original and merge the enrichment data
              const mergedBatch = enrichedBatch
                .map((enriched) => {
                  const original = importedTransactions.find(
                    (t) => t.id === enriched.id || t.internal_id === enriched.id
                  );

                  if (!original) return null;

                  return {
                    id: original.internal_id,
                    userId: teamId,
                    bankAccountId: original.bank_account_id,
                    amount: Number(original.amount),
                    date: new Date(original.date || Date.now()),
                    name: original.name,
                    description: original.description || original.name || null,
                    status: original.status || 'posted',
                    currency: original.currency,
                    categorySlug: enriched.category_slug,
                    method: original.method || 'other',
                    isManual: true,
                    isRecurring: enriched.is_recurring || false,
                    confidenceScore: enriched.confidence || null,
                    merchantCategory: enriched.merchant_category || null,
                    businessPurpose: enriched.business_purpose || null,
                    needsWantsCategory: enriched.need_want_category || null,
                    cashFlowType: enriched.cash_flow_type || null,
                    taxDeductible: enriched.tax_deductible || false,
                  };
                })
                .filter(Boolean);

              return prisma.transaction
                .createMany({
                  data: mergedBatch as unknown as Prisma.TransactionCreateManyInput[],
                  skipDuplicates: true,
                })
                .then(() => mergedBatch);
            }
          );

          logger.info('Enriched transactions saved', {
            count: enrichedTransactions.length,
          });
        }

        // Final step: Revalidate cache
        await revalidateCache({ tag: 'transactions', id: teamId });

        return {
          success: true,
          importedCount: importedTransactions.length,
          enriched: shouldEnrich,
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
});

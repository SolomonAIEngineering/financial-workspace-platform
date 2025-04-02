import {
  ATTACHMENT_BATCH_SIZE,
  ATTACHMENT_SIZE_WARNING_THRESHOLD,
  AttachmentExportData,
  ExportRow,
  MAX_ATTACHMENT_SIZE_BYTES,
  ProcessExportInput,
  ProcessExportOutput,
  TRANSACTION_PAGINATION_SIZE,
  TransactionWithRelations,
  exportRowSchema,
  processExportInputSchema
} from './schema';
import { Task, logger, schemaTask } from '@trigger.dev/sdk/v3';

import { TRANSACTION_JOBS } from '../constants';
import { blobToSerializable } from '../../utils/blob';
import { prisma } from '@solomonai/prisma/server';
import { processBatch } from '../../utils/process-batch';

/**
 * Validates a URL for safety and format correctness
 * 
 * @param urlParts - Array of URL path components
 * @returns A properly constructed and validated URL string
 * @throws Error if URL cannot be safely constructed
 */
function constructValidatedUrl(urlParts: string[]): string {
  if (!urlParts || urlParts.length === 0) {
    throw new Error('Invalid URL: Empty path components');
  }

  // Basic validation of URL parts to prevent injection
  const invalidParts = urlParts.filter(part =>
    !part ||
    part.includes('..') ||
    part.includes('//') ||
    part.includes('%')
  );

  if (invalidParts.length > 0) {
    throw new Error('Invalid URL path components detected');
  }

  try {
    // Create URL using the URL constructor for validation
    const baseUrl = urlParts[0].startsWith('http') ? urlParts[0] : `https://${urlParts[0]}`;
    const pathParts = urlParts.slice(1);

    // Ensure the path parts are properly encoded
    const encodedPathParts = pathParts.map(part => encodeURIComponent(part));
    const fullPath = encodedPathParts.join('/');

    // Construct and validate full URL
    const url = new URL(fullPath, baseUrl);
    return url.toString();
  } catch (error) {
    logger.error('Failed to construct valid URL', { urlParts, error });
    throw new Error('Invalid URL construction');
  }
}

/**
 * Fetches transaction data with all related entities needed for export in a paginated manner
 *
 * @param ids - Array of transaction IDs to fetch
 * @returns Array of transactions with related data
 */
async function fetchTransactionsWithRelations(
  ids: string[]
): Promise<TransactionWithRelations[]> {
  return await logger.trace('fetch-transactions', async (fetchSpan) => {
    try {
      // Implement cursor-based pagination for large datasets
      let allTransactions: TransactionWithRelations[] = [];
      let processedCount = 0;

      while (processedCount < ids.length) {
        // Get the next batch of IDs to process
        const batchIds = ids.slice(
          processedCount,
          processedCount + TRANSACTION_PAGINATION_SIZE
        );

        // Fetch this batch
        const batchData = (await prisma.transaction.findMany({
          where: {
            id: { in: batchIds },
          },
          include: {
            transactionCategory: true,
            bankAccount: {
              select: {
                id: true,
                name: true,
              },
            },
            customAttachments: {
              select: {
                id: true,
                name: true,
                path: true,
                type: true,
                size: true,
              },
            },
          },
        })) as unknown as TransactionWithRelations[];

        // Add to results
        allTransactions = [...allTransactions, ...batchData];

        // Update processed count
        processedCount += batchIds.length;

        logger.info(`Fetched batch of ${batchData.length} transactions`, {
          progress: `${processedCount}/${ids.length}`,
          batchSize: batchIds.length,
          remainingCount: ids.length - processedCount
        });
      }

      fetchSpan.setAttribute('fetchedCount', allTransactions.length);
      logger.info(`Fetched ${allTransactions.length} transactions with related data`, {
        expectedCount: ids.length,
      });

      return allTransactions;
    } catch (fetchError) {
      const errorMessage =
        fetchError instanceof Error
          ? fetchError.message
          : 'Unknown database error';
      fetchSpan.setAttribute('error', errorMessage);
      logger.error('Database error during transaction fetch', {
        error: errorMessage,
      });
      throw fetchError;
    }
  });
}

/**
 * Fetches a file from Uploadcare and converts it to a serializable format
 * with size validation and limits
 *
 * @param path - Array of path components that make up the Uploadcare URL
 * @param attachmentId - ID of the attachment for logging purposes
 * @param transactionId - ID of the transaction for logging purposes
 * @param fileName - Name of the file for logging purposes
 * @param fileSize - Known size of the file in bytes
 * @returns Serialized blob data as number[] or null if retrieval fails
 */
async function fetchFileFromUploadcare(
  path: string[],
  attachmentId: string,
  transactionId: string,
  fileName: string | null,
  fileSize: number
): Promise<{ blob: number[] | null; error?: string }> {
  if (!path || path.length === 0) {
    return { blob: null, error: 'Empty file path' };
  }

  // Check for file size limits before fetching
  if (fileSize > MAX_ATTACHMENT_SIZE_BYTES) {
    logger.warn('Attachment exceeds maximum file size limit', {
      attachmentId,
      transactionId,
      fileName,
      fileSize,
      maxSize: MAX_ATTACHMENT_SIZE_BYTES
    });
    return {
      blob: null,
      error: `File size (${Math.round(fileSize / 1024 / 1024)}MB) exceeds the maximum allowed size (${MAX_ATTACHMENT_SIZE_BYTES / 1024 / 1024}MB)`
    };
  }

  if (fileSize > ATTACHMENT_SIZE_WARNING_THRESHOLD) {
    logger.warn('Large attachment detected', {
      attachmentId,
      transactionId,
      fileName,
      fileSize
    });
  }

  try {
    // Construct and validate Uploadcare URL
    const uploadcareURL = constructValidatedUrl(path);

    // Setup timeout for the request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      // Fetch file from Uploadcare with timeout
      const fileResponse = await fetch(uploadcareURL, {
        signal: controller.signal
      });

      if (fileResponse.ok) {
        const blob = await fileResponse.blob();

        // Final size check based on actual downloaded blob
        if (blob.size > MAX_ATTACHMENT_SIZE_BYTES) {
          return {
            blob: null,
            error: `Downloaded file size (${Math.round(blob.size / 1024 / 1024)}MB) exceeds limit`
          };
        }

        // Convert blob to serializable format
        const fileData = await blobToSerializable(blob);
        logger.info('Successfully retrieved file from Uploadcare', {
          attachmentId,
          transactionId,
          fileName,
          fileSize: blob.size,
        });
        return { blob: fileData };
      } else {
        const errorMessage = `HTTP error: ${fileResponse.status} ${fileResponse.statusText}`;
        logger.error('Failed to fetch file from Uploadcare', {
          attachmentId,
          status: fileResponse.status,
          statusText: fileResponse.statusText,
        });
        return { blob: null, error: errorMessage };
      }
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ?
      error.message :
      'Unknown error retrieving file';

    logger.error('Failed to retrieve attachment file', {
      attachmentId,
      transactionId,
      error: errorMessage,
    });

    return { blob: null, error: errorMessage };
  }
}

/**
 * Safely parses a filename into name and extension components
 * 
 * @param originalName - Original filename to parse
 * @returns Parsed filename components with fallbacks
 */
function parseFilename(originalName: string | null): { name: string; ext: string } {
  if (!originalName) {
    return { name: 'file', ext: 'bin' };
  }

  // Handle filenames with multiple dots
  const lastDotIndex = originalName.lastIndexOf('.');

  if (lastDotIndex === -1) {
    // No extension
    return { name: originalName, ext: 'bin' };
  } else if (lastDotIndex === 0) {
    // Hidden file with no name (e.g. ".gitignore")
    return { name: 'file', ext: originalName.slice(1) || 'bin' };
  } else {
    // Normal filename with extension
    return {
      name: originalName.slice(0, lastDotIndex),
      ext: originalName.slice(lastDotIndex + 1)
    };
  }
}

/**
 * Processes a single attachment for export with improved error handling
 *
 * @param transaction - The transaction containing the attachment
 * @param attachment - The attachment to process
 * @param rowId - Index of the transaction row for naming purposes
 * @param attachmentIndex - Index of the attachment for naming purposes
 * @returns Processed attachment data for export
 */
async function processAttachment(
  transaction: TransactionWithRelations,
  attachment: TransactionWithRelations['customAttachments'][0],
  rowId: number,
  attachmentIndex: number
): Promise<AttachmentExportData> {
  try {
    // Safely parse the filename components with fallbacks
    const { name: filename, ext: extension } = parseFilename(attachment.name);

    const name = attachmentIndex > 0
      ? `${filename}-${rowId}_${attachmentIndex}.${extension}`
      : `${filename}-${rowId}.${extension}`;

    // Get file from Uploadcare with size validation
    const { blob, error } = await fetchFileFromUploadcare(
      attachment.path,
      attachment.id,
      transaction.id,
      attachment.name,
      attachment.size
    );

    return {
      id: transaction.id,
      name,
      blob,
      originalName: attachment.name,
      type: attachment.type,
      sizeBytes: attachment.size,
      error: error
    };
  } catch (error) {
    logger.error('Error processing individual attachment', {
      attachmentId: attachment.id,
      transactionId: transaction.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Return partial data with error information instead of failing completely
    return {
      id: transaction.id,
      name: attachment.name || `unknown-${transaction.id}-${attachmentIndex}`,
      blob: null,
      originalName: attachment.name,
      type: attachment.type || 'application/octet-stream',
      sizeBytes: attachment.size,
      error: error instanceof Error ? error.message : 'Unknown attachment processing error'
    };
  }
}

/**
 * Processes all attachments for a batch of transactions
 *
 * @param transactions - Array of transactions with attachments to process
 * @returns Array of processed attachments
 */
async function processAttachments(
  transactions: TransactionWithRelations[]
): Promise<AttachmentExportData[]> {
  return await logger.trace('process-attachments', async (attachSpan) => {
    try {
      const attachmentResults = await processBatch(
        transactions ?? [],
        ATTACHMENT_BATCH_SIZE,
        async (batch) => {
          const batchAttachments = await Promise.all(
            batch.flatMap((transaction, idx) => {
              const rowId = idx + 1;
              return (transaction.customAttachments ?? []).map(
                (attachment, idx2) =>
                  processAttachment(transaction, attachment, rowId, idx2)
              );
            })
          );

          return batchAttachments.flat();
        }
      );

      attachSpan.setAttribute('attachmentCount', attachmentResults.length);
      logger.info(`Processed ${attachmentResults.length} attachments`);

      return attachmentResults;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      attachSpan.setAttribute('error', errorMessage);
      logger.error('Error processing attachments', { error: errorMessage });
      throw error;
    }
  });
}

/**
 * Formats transaction data into rows suitable for CSV/Excel export
 *
 * @param transactions - Array of transactions to format
 * @param attachments - Array of processed attachments
 * @param locale - Locale string for currency formatting
 * @returns Array of formatted rows
 */
async function formatTransactionRows(
  transactions: TransactionWithRelations[],
  attachments: AttachmentExportData[],
  locale: string
): Promise<ExportRow[]> {
  return await logger.trace('format-rows', async (formatSpan) => {
    try {
      // Group attachments by transaction ID for more efficient lookup
      const attachmentsByTransactionId = attachments.reduce((acc, attachment) => {
        if (!acc[attachment.id]) {
          acc[attachment.id] = [];
        }
        acc[attachment.id].push(attachment);
        return acc;
      }, {} as Record<string, AttachmentExportData[]>);

      // Format currency with robust fallbacks
      const formatCurrency = (amount: number | undefined | null, currencyCode: string | undefined | null): string => {
        if (amount === undefined || amount === null || !currencyCode) {
          return '';
        }

        try {
          return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currencyCode,
          }).format(amount);
        } catch (error) {
          // Fallback formatting if Intl has issues with the locale or currency
          return `${currencyCode} ${amount.toFixed(2)}`;
        }
      };

      const formattedRows = transactions
        ?.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((transaction): ExportRow => {
          // Get this transaction's attachments
          const transactionAttachments = attachmentsByTransactionId[transaction.id] || [];

          // Get attachment names, filtering out those with errors
          const attachmentNames = transactionAttachments
            .filter(a => !a.error)
            .map(a => a.originalName)
            .filter(Boolean)
            .join(', ');

          // Create the formatted row with all data
          return [
            transaction.id,
            transaction.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
            transaction.name,
            transaction.description,
            transaction.amount,
            transaction.currency,
            formatCurrency(transaction.amount, transaction.currency),
            formatCurrency(transaction.vatAmount || null, transaction.currency),
            transaction?.transactionCategory?.name ?? '',
            transaction?.transactionCategory?.description ?? '',
            transaction?.customAttachments?.length > 0 ? '✔️' : '❌',
            attachmentNames,
            transaction?.balance?.toString() ?? '',
            transaction?.bankAccount?.name ?? '',
            transaction?.notes ?? '',
          ];
        });

      // Validate each row against schema
      const validatedRows = formattedRows.map(row => {
        try {
          return exportRowSchema.parse(row);
        } catch (error) {
          logger.warn('Invalid row format detected', { row, error });
          // Fix the row to match expected format
          return exportRowSchema.parse([
            row[0] || '',             // id
            row[1] || '',             // date
            row[2] || 'Unknown',      // name
            row[3] || null,           // description
            Number(row[4] || 0),      // amount
            row[5] || 'USD',          // currency
            row[6] || '',             // formatted amount
            row[7] || '',             // formatted VAT
            row[8] || '',             // category name
            row[9] || '',             // category description
            row[10] || '❌',           // has attachments
            row[11] || '',            // attachment names
            row[12] || '',            // balance
            row[13] || '',            // bank account name
            row[14] || null,          // notes
          ]);
        }
      });

      formatSpan.setAttribute('rowCount', validatedRows.length);
      return validatedRows;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      formatSpan.setAttribute('error', errorMessage);
      logger.error('Error formatting transaction rows', {
        error: errorMessage,
      });
      throw error;
    }
  });
}

/**
 * Processes transaction data export with attachments for specified
 * transactions.
 *
 * This job fetches transaction data, including related categories, bank
 * accounts, and attachments, formats it into rows suitable for export, and
 * handles downloading and processing attachments.
 *
 * @remarks
 *   The job is designed for generating CSV/Excel exports with the following
 *   features:
 *
 *   - Handles locale-specific currency formatting
 *   - Processes transaction attachments in batches to manage memory usage
 *   - Downloads attachment files and converts them to a serializable format
 *   - Returns both formatted transaction data and attachment blobs
 *
 * @example
 *   ```ts
 *   await client.sendEvent({
 *     name: 'process-export',
 *     payload: {
 *       ids: ['tx_123abc', 'tx_456def'],
 *       locale: 'en-US'
 *     },
 *   });
 *   ```;
 *
 * @returns An object containing formatted transaction rows and attachment data
 */
export const processExport: Task<
  'process-export',
  ProcessExportInput,
  ProcessExportOutput
> = schemaTask({
  id: TRANSACTION_JOBS.PROCESS_EXPORT,
  description: 'Process Transaction Export with Attachments',
  schema: processExportInputSchema,
  maxDuration: 300,
  queue: {
    concurrencyLimit: 5,
  },
  /** Configure machine resources for this job */
  machine: {
    preset: 'large-1x',
  },
  /**
   * Configure retry behavior for the task
   *
   * @see https://trigger.dev/docs/errors-retrying
   */
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 60000,
    randomize: true,
  },
  /**
   * Main execution function for the transaction export processing
   *
   * @param payload - The validated input parameters
   * @param payload.ids - Array of transaction IDs to include in the export
   * @param payload.locale - Locale string for formatting currency values
   * @param ctx - The execution context provided by Trigger.dev
   * @returns An object containing formatted transaction rows and attachment
   *   data
   */
  run: async (payload, { ctx }) => {
    const { ids, locale } = payload;

    // Create a trace for the entire export operation
    return await logger.trace('process-export', async (span) => {
      span.setAttribute('transactionCount', ids.length);
      span.setAttribute('locale', locale);

      logger.info('Starting transaction export processing', {
        transactionCount: ids.length,
        locale,
      });

      try {
        // Step 1: Fetch transaction data with related entities
        const transactionsData = await fetchTransactionsWithRelations(ids);

        // Step 2: Process attachments in batches
        const attachments = await processAttachments(transactionsData);

        // Step 3: Format transaction data into rows for export
        const rows = await formatTransactionRows(
          transactionsData,
          attachments,
          locale
        );

        // Calculate statistics for the processing run
        const successfulAttachments = attachments.filter(a => !a.error).length;
        const failedAttachments = attachments.filter(a => !!a.error).length;
        const largeAttachments = attachments.filter(a =>
          (a.sizeBytes || 0) > ATTACHMENT_SIZE_WARNING_THRESHOLD
        ).length;

        logger.info('Export processing completed successfully', {
          transactionCount: transactionsData?.length || 0,
          attachmentCount: attachments?.length || 0,
          successfulAttachments,
          failedAttachments,
          rowCount: rows?.length || 0,
        });

        return {
          rows,
          attachments,
          stats: {
            totalTransactions: transactionsData.length,
            totalAttachments: attachments.length,
            successfulAttachments,
            failedAttachments,
            largeAttachments
          }
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        span.setAttribute('error', errorMessage);

        logger.error('Failed to process transaction export', {
          error: errorMessage,
        });

        throw new Error(
          `Failed to process transaction export: ${errorMessage}`
        );
      }
    });
  },
});

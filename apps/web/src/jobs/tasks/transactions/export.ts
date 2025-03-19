import { logger, schemaTask } from '@trigger.dev/sdk/v3';

import { TRANSACTION_JOBS } from '../constants';
import { blobToSerializable } from '@/jobs/utils/blob';
import { prisma } from '@/server/db';
import { processBatch } from '@/jobs/utils/process-batch';
import { z } from 'zod';

/** The number of attachments to process in each batch to manage memory usage */
const ATTACHMENT_BATCH_SIZE = 20;

/** Type definition for transaction data with included relations */
type TransactionWithRelations = {
  id: string;
  date: Date;
  name: string;
  description: string | null;
  amount: number;
  currency: string;
  vatAmount?: number | null;
  balance?: number | null;
  notes?: string | null;
  transactionCategory: {
    name: string;
    description: string | null;
  } | null;
  bankAccount: {
    id: string;
    name: string;
  };
  customAttachments: {
    id: string;
    name: string | null;
    path: string[];
    type: string;
    size: number;
  }[];
};

/** Type for attachment data in the export */
type AttachmentExportData = {
  id: string;
  name: string;
  blob: number[] | null;
  originalName: string | null;
  type: string;
};

/**
 * Fetches transaction data with all related entities needed for export
 *
 * @param ids - Array of transaction IDs to fetch
 * @returns Array of transactions with related data
 */
async function fetchTransactionsWithRelations(
  ids: string[]
): Promise<TransactionWithRelations[]> {
  return await logger.trace('fetch-transactions', async (fetchSpan) => {
    try {
      const data = (await prisma.transaction.findMany({
        where: {
          id: { in: ids },
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

      fetchSpan.setAttribute('fetchedCount', data.length);
      logger.info(`Fetched ${data.length} transactions with related data`, {
        expectedCount: ids.length,
      });

      return data;
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
 *
 * @param path - Array of path components that make up the Uploadcare URL
 * @param attachmentId - ID of the attachment for logging purposes
 * @param transactionId - ID of the transaction for logging purposes
 * @param fileName - Name of the file for logging purposes
 * @returns Serialized blob data as number[] or null if retrieval fails
 */
async function fetchFileFromUploadcare(
  path: string[],
  attachmentId: string,
  transactionId: string,
  fileName: string | null
): Promise<number[] | null> {
  if (!path || path.length === 0) {
    return null;
  }

  try {
    // Construct Uploadcare URL from path components
    const uploadcareURL = path.join('/');

    // Fetch file from Uploadcare
    const fileResponse = await fetch(uploadcareURL);

    if (fileResponse.ok) {
      const blob = await fileResponse.blob();
      // Convert blob to serializable format
      const fileData = await blobToSerializable(blob);
      logger.info('Successfully retrieved file from Uploadcare', {
        attachmentId,
        transactionId,
        fileName,
        fileSize: blob.size,
      });
      return fileData;
    } else {
      logger.error('Failed to fetch file from Uploadcare', {
        attachmentId,
        status: fileResponse.status,
        statusText: fileResponse.statusText,
      });
      return null;
    }
  } catch (error) {
    logger.error('Failed to retrieve attachment file', {
      attachmentId,
      transactionId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
}

/**
 * Processes a single attachment for export
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
    const filename = attachment.name?.split('.').at(0);
    const extension = attachment.name?.split('.').at(-1);

    const name =
      attachmentIndex > 0
        ? `${filename}-${rowId}_${attachmentIndex}.${extension}`
        : `${filename}-${rowId}.${extension}`;

    // Get file from Uploadcare
    const fileData = await fetchFileFromUploadcare(
      attachment.path,
      attachment.id,
      transaction.id,
      attachment.name
    );

    return {
      id: transaction.id,
      name,
      blob: fileData,
      originalName: attachment.name,
      type: attachment.type,
    };
  } catch (error) {
    logger.error('Error processing individual attachment', {
      attachmentId: attachment.id,
      transactionId: transaction.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return {
      id: transaction.id,
      name: attachment.name || 'unknown',
      blob: null,
      originalName: attachment.name,
      type: attachment.type,
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
): Promise<any[][]> {
  return await logger.trace('format-rows', async (formatSpan) => {
    try {
      const formattedRows = transactions
        ?.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
        .map((transaction) => [
          transaction.id,
          transaction.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
          transaction.name,
          transaction.description,
          transaction.amount,
          transaction.currency,
          // Format currency based on locale
          transaction.currency && transaction.amount !== undefined
            ? Intl.NumberFormat(locale, {
                style: 'currency',
                currency: transaction.currency,
              }).format(transaction.amount)
            : '',
          // Format VAT if available
          transaction.vatAmount
            ? Intl.NumberFormat(locale, {
                style: 'currency',
                currency: transaction.currency || 'USD',
              }).format(transaction.vatAmount)
            : '',
          transaction?.transactionCategory?.name ?? '',
          transaction?.transactionCategory?.description ?? '',
          transaction?.customAttachments?.length > 0 ? '✔️' : '❌',
          // List attachment names
          attachments
            .filter((a) => a.id === transaction.id)
            .map((a) => a.originalName)
            .join(', ') ?? '',
          transaction?.balance ?? '',
          transaction?.bankAccount?.name ?? '',
          transaction?.notes ?? '',
        ]);

      formatSpan.setAttribute('rowCount', formattedRows?.length || 0);
      return formattedRows || [];
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
export const processExport = schemaTask({
  id: TRANSACTION_JOBS.PROCESS_EXPORT,
  description: 'Process Transaction Export with Attachments',
  schema: z.object({
    /** Array of transaction IDs to include in the export */
    ids: z.array(z.string().uuid()),

    /** Locale string for formatting currency values (e.g., 'en-US', 'fr-FR') */
    locale: z.string(),
  }),
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

        logger.info('Export processing completed successfully', {
          transactionCount: transactionsData?.length || 0,
          attachmentCount: attachments?.length || 0,
          rowCount: rows?.length || 0,
        });

        return {
          rows,
          attachments,
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
  /**
   * Custom error handler to control retry behavior based on error type
   *
   * @param payload - The task payload
   * @param error - The error that occurred
   * @param options - Options object containing context and retry control
   * @returns Retry instructions or undefined to use default retry behavior
   */
  handleError: async (payload, error, { ctx, retryAt }) => {
    // If it's a database connection error, wait longer
    if (
      error instanceof Error &&
      error.message.includes('database connection')
    ) {
      logger.warn(
        `Database connection error, delaying retry for export processing`
      );
      return {
        retryAt: new Date(Date.now() + 60000), // Wait 1 minute
      };
    }

    // For resource-intensive operations that failed, maybe just skip retrying
    if (error instanceof Error && error.message.includes('resource limit')) {
      logger.warn(
        `Resource limit reached, skipping retry for export processing`
      );
      return {
        skipRetrying: true,
      };
    }

    // For other errors, use the default retry strategy
    return;
  },
});

/**
 * @module jobs/tasks/inbox/upload
 * @file This module defines a background job for processing document uploads to
 *   the inbox. It handles file uploads, storage, and document parsing using the
 *   DocumentClient.
 */

import { logger, wait } from '@trigger.dev/sdk/v3';

import { DocumentClient } from '@solomonai/documents';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { prisma } from '@/server/db';
import { schemaTask } from '@trigger.dev/sdk/v3';
import { setTimeout as sleep } from 'timers/promises';
import { utapi } from '@/lib/uploadthing';
import { z } from 'zod';

// Maximum retry attempts for transient failures
const MAX_RETRIES = 3;
// Base timeout for file operations in ms
const FILE_OPERATION_TIMEOUT = 30000; // 30 seconds
// Document processing timeout in ms
const DOC_PROCESSING_TIMEOUT = 120000; // 2 minutes
// Supported content types for document processing
const SUPPORTED_CONTENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/tiff',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/msword', // doc
];
// Maximum file size for processing (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Background job that processes document uploads to the inbox.
 *
 * This job performs the following operations:
 *
 * 1. Stores metadata about the uploaded file in the "inbox" table
 * 2. Retrieves the file from storage
 * 3. Uses DocumentClient to parse/extract information from the document
 * 4. Updates the inbox record with the extracted information
 *
 * @remarks
 *   The job includes error handling to ensure inbox records are created even if
 *   document parsing fails.
 */
export const inboxUpload = schemaTask({
  id: 'inbox-upload',
  schema: z.object({
    /** UUID of the team associated with this upload */
    teamId: z.string().uuid(),

    /** MIME type of the uploaded file */
    mimetype: z.string(),

    /** Size of the uploaded file in bytes */
    size: z.number(),

    /** Array of path segments for the file location in storage */
    file_path: z.array(z.string().min(1)).min(1),
  }),
  maxDuration: 300, // 5 minutes
  queue: {
    concurrencyLimit: 25,
  },
  run: async ({ teamId, mimetype, size, file_path }) => {
    let inboxId: string | undefined;

    logger.info('Starting inbox upload processing', {
      teamId,
      file_path: file_path.join('/'),
      mimetype,
      size,
    });

    try {
      // Validate inputs beyond schema validation
      if (size <= 0) {
        throw new Error(`Invalid file size: ${size}`);
      }

      if (size > MAX_FILE_SIZE) {
        throw new Error(
          `File size exceeds maximum allowed: ${size} > ${MAX_FILE_SIZE}`
        );
      }

      if (!SUPPORTED_CONTENT_TYPES.includes(mimetype)) {
        logger.warn('Unsupported content type, processing may fail', {
          mimetype,
        });
      }

      // Extract filename from path
      const filename = file_path.at(-1);

      if (!filename) {
        throw new Error('No filename found in file path');
      }

      // Create inbox record inside a transaction to ensure atomicity
      logger.debug('Creating inbox record', { filename, teamId });

      const inboxData = await prisma
        .$transaction(async (tx) => {
          // Check if team exists
          const team = await tx.team.findUnique({
            where: { id: teamId },
            select: { id: true },
          });

          if (!team) {
            throw new Error(`Team not found: ${teamId}`);
          }

          // Create the inbox record
          return await tx.inbox.create({
            data: {
              status: 'NEW',
              displayName: filename,
              teamId: teamId,
              filePath: file_path,
              fileName: filename,
              contentType: mimetype,
              size,
            },
            select: {
              id: true,
              contentType: true,
            },
          });
        })
        .catch((error) => {
          if (error instanceof PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
              throw new Error(`Duplicate inbox record: ${error.meta?.target}`);
            } else if (error.code === 'P2003') {
              throw new Error(
                `Foreign key constraint failed: ${error.meta?.field_name}`
              );
            }
          }
          throw error;
        });

      inboxId = inboxData.id;
      logger.info('Created inbox record', { inboxId });

      // Fetch file with retry logic
      let fileContent: ArrayBuffer | null = null;
      let attempts = 0;
      let lastError: Error | null = null;

      while (attempts < MAX_RETRIES && !fileContent) {
        try {
          if (attempts > 0) {
            // Exponential backoff: 1s, 2s, 4s, etc.
            const backoffTime = Math.pow(2, attempts - 1) * 1000;
            logger.info(
              `Retrying file retrieval (attempt ${attempts + 1}/${MAX_RETRIES}) after ${backoffTime}ms backoff`,
              {
                inboxId,
                path: file_path.join('/'),
              }
            );
            await sleep(backoffTime);
          }

          // Use a promise with a timeout via Trigger.dev's wait.for
          const fileRetrievalPromise = retrieveFileFromStorage(
            file_path.join('/')
          );

          // Create a promise that will resolve after the timeout
          const timeoutPromise = wait
            .for({ seconds: FILE_OPERATION_TIMEOUT / 1000 })
            .then(() => {
              throw new Error('File retrieval timed out');
            });

          // Race the promises
          fileContent = await Promise.race([
            fileRetrievalPromise,
            timeoutPromise,
          ]);
        } catch (error) {
          attempts++;
          lastError = error instanceof Error ? error : new Error(String(error));

          // Check if this was a timeout error
          const isTimeout =
            lastError.message.includes('timed out') ||
            lastError.message.includes('timeout') ||
            lastError.message.includes('aborted');

          logger.warn(`File retrieval attempt ${attempts} failed`, {
            inboxId,
            error: lastError.message,
            isTimeout,
            remainingAttempts: MAX_RETRIES - attempts,
          });

          // If this is a permanent error, don't retry
          if (isPermanentError(error)) {
            logger.error('Permanent error encountered, will not retry', {
              inboxId,
              error: lastError.message,
            });
            break;
          }
        }
      }

      if (!fileContent) {
        // Update the inbox record to indicate retrieval failure
        await updateInboxStatus(
          inboxId,
          'FAILED_RETRIEVAL',
          lastError?.message
        );
        throw new Error(
          `Failed to retrieve file after ${MAX_RETRIES} attempts: ${lastError?.message}`
        );
      }

      logger.debug('Retrieved file successfully', {
        inboxId,
        size: fileContent.byteLength,
      });

      try {
        // Process document with DocumentClient
        logger.info('Processing document with DocumentClient', {
          inboxId,
          contentType: inboxData.contentType,
        });

        if (!inboxData.contentType) {
          throw new Error('Missing content type for document processing');
        }

        // Create document client for processing
        const document = new DocumentClient({
          contentType: inboxData.contentType,
        });

        // Process document with timeout using Trigger.dev's wait.for
        const documentProcessingPromise = document.getDocument({
          content: Buffer.from(fileContent).toString('base64'),
        });

        // Create a promise that will resolve after the timeout
        const timeoutPromise = wait
          .for({ seconds: DOC_PROCESSING_TIMEOUT / 1000 })
          .then(() => {
            throw new Error('Document processing timed out');
          });

        // Race the promises
        const result = await Promise.race([
          documentProcessingPromise,
          timeoutPromise,
        ]);

        // Validate document processing results
        if (!result) {
          throw new Error('Document processing returned no results');
        }

        logger.info('Document processed successfully', {
          inboxId,
          documentName: result.name,
          documentType: result.type,
        });

        // Update inbox with extracted information using Prisma
        await prisma
          .$transaction(async (tx) => {
            // Check if inbox record still exists
            const existingInbox = await tx.inbox.findUnique({
              where: { id: inboxId! },
              select: { id: true },
            });

            if (!existingInbox) {
              throw new Error(`Inbox record not found: ${inboxId}`);
            }

            // Update the inbox record
            await tx.inbox.update({
              where: { id: inboxId! },
              data: {
                amount: result.amount,
                currency: result.currency,
                displayName: result.name || filename, // Fall back to filename if no name
                website: result.website,
                date: result.date ? new Date(result.date) : undefined,
                type: mapDocumentTypeToInboxType(result.type || undefined),
                description: result.description,
                status: 'PENDING',
              },
            });
          })
          .catch((error) => {
            logger.error('Failed to update inbox record', {
              inboxId,
              error: error instanceof Error ? error.message : String(error),
            });
            throw error;
          });

        logger.info('Updated inbox record with parsed document data', {
          inboxId,
          status: 'PENDING',
        });

        // TODO: Send event to match inbox
      } catch (error) {
        // Categorize document processing errors
        let errorMessage =
          error instanceof Error ? error.message : String(error);

        if (
          errorMessage.includes('timed out') ||
          errorMessage.includes('timeout')
        ) {
          logger.warn('Document processing timed out', { inboxId });
          errorMessage = 'Document processing timed out';
        } else if (error instanceof TypeError) {
          logger.warn('Invalid document format', { inboxId });
          errorMessage = 'Invalid document format';
        }

        logger.warn('Failed to parse document', {
          inboxId,
          error: errorMessage,
        });

        // Still update status even if processing failed
        await updateInboxStatus(inboxId, 'PENDING', errorMessage);

        logger.info(
          'Updated inbox record to pending status after processing failure',
          {
            inboxId,
          }
        );
      }

      return {
        success: true,
        inboxId,
        message: 'Document processed and inbox record updated',
      };
    } catch (error) {
      // Capture detailed error information for critical failures
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      logger.error('Critical error in inbox upload job', {
        inboxId,
        error: errorMessage,
        stack: errorStack,
        teamId,
        filePath: file_path.join('/'),
      });

      // If we have created an inbox record, update it to failed status
      if (inboxId) {
        try {
          await updateInboxStatus(inboxId, 'FAILED', errorMessage);
        } catch (updateError) {
          logger.error('Failed to update inbox status after critical error', {
            inboxId,
            error:
              updateError instanceof Error
                ? updateError.message
                : String(updateError),
          });
        }
      }

      throw error;
    } finally {
      // Ensure Prisma connection is closed in all scenarios
      try {
        await prisma.$disconnect();
      } catch (disconnectError) {
        logger.error('Failed to disconnect Prisma client', {
          error:
            disconnectError instanceof Error
              ? disconnectError.message
              : String(disconnectError),
        });
      }
    }
  },
});

/**
 * Maps a document type string from the DocumentClient to an InboxType enum
 * value
 *
 * @param documentType - The document type string from the DocumentClient
 * @returns The corresponding InboxType enum value
 */
function mapDocumentTypeToInboxType(
  documentType?: string
): 'INVOICE' | 'EXPENSE' | undefined {
  if (!documentType) return undefined;

  // Convert to lowercase for case-insensitive matching
  const type = documentType.toLowerCase();

  if (type.includes('invoice')) return 'INVOICE';
  if (type.includes('receipt') || type.includes('expense')) return 'EXPENSE';

  // Default to undefined if we can't determine the type
  return undefined;
}

/**
 * Determines if an error is permanent (not worth retrying)
 *
 * @param error - The error to check
 * @returns True if this is a permanent error that shouldn't be retried
 */
function isPermanentError(error: unknown): boolean {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // Consider the following permanent errors
  return (
    errorMessage.includes('not found') ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('permission denied') ||
    errorMessage.includes('invalid') ||
    // Add other permanent error indicators as needed
    false
  );
}

/**
 * Updates the status of an inbox record with error information if applicable
 *
 * @param inboxId - ID of the inbox record to update
 * @param status - New status to set
 * @param errorMessage - Optional error message to store
 */
async function updateInboxStatus(
  inboxId: string,
  status: 'PENDING' | 'FAILED' | 'FAILED_RETRIEVAL',
  errorMessage?: string
): Promise<void> {
  try {
    const updateData: any = { status };

    // If we have an error message, store it in the meta field
    if (errorMessage) {
      updateData.meta = { error: errorMessage };
    }

    await prisma.inbox.update({
      where: { id: inboxId },
      data: updateData,
    });
  } catch (error) {
    logger.error('Failed to update inbox status', {
      inboxId,
      status,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Retrieves file content from storage This implementation uses UploadThing and
 * direct fetch to retrieve files
 *
 * @param path - Full path to the file
 * @returns ArrayBuffer containing the file content
 */
async function retrieveFileFromStorage(path: string): Promise<ArrayBuffer> {
  try {
    logger.debug('Retrieving file from storage', { path });

    // Try to get the file directly via a URL first
    try {
      // Validate if the path looks like a URL
      if (path.startsWith('http')) {
        // Create a fetch request
        const response = await fetch(path);

        if (!response.ok) {
          throw new Error(
            `HTTP error: ${response.status} ${response.statusText}`
          );
        }

        const arrayBuffer = await response.arrayBuffer();
        logger.debug('Retrieved file via direct fetch', {
          size: arrayBuffer.byteLength,
          path,
        });
        return arrayBuffer;
      }
    } catch (error) {
      // Only log a warning if this was a network or HTTP error
      // Otherwise, it might just be that the path wasn't a URL
      if (
        error instanceof Error &&
        (error.name === 'TypeError' || error.message.includes('HTTP error'))
      ) {
        logger.warn('Failed to fetch file directly', {
          error: error.message,
          path,
        });
      }
    }

    // If direct fetch fails or path isn't a URL, try to get the URL from UploadThing
    try {
      // Extract the file key from the path (assuming the last part is the key)
      const fileKey = path.split('/').pop() || path;

      if (!fileKey || fileKey.length === 0) {
        throw new Error('Invalid file key extracted from path');
      }

      // Use getFileUrls to get a valid URL for the file
      const result = await utapi.getFileUrls([fileKey]);

      if (!result.data || result.data.length === 0 || !result.data[0]) {
        throw new Error(`File not found in UploadThing: ${fileKey}`);
      }

      // Now fetch the file content using the URL
      const fileUrl = result.data[0].url;
      if (!fileUrl) {
        throw new Error(`No URL returned for file key: ${fileKey}`);
      }

      // Create a fetch request
      const response = await fetch(fileUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch file from URL: ${response.status} ${response.statusText}`
        );
      }

      const buffer = await response.arrayBuffer();
      logger.debug('Retrieved file using UploadThing getFileUrls', {
        size: buffer.byteLength,
        fileKey,
      });

      return buffer;
    } catch (error) {
      logger.error('Failed to retrieve file using UploadThing', {
        error: error instanceof Error ? error.message : String(error),
        path,
      });
      throw error;
    }
  } catch (error) {
    logger.error('Failed to retrieve file from storage', {
      path,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error(
      `Failed to retrieve file from storage: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

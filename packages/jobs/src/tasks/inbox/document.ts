/**
 * @module jobs/tasks/inbox/document
 * @file This module defines a background job for processing document content in
 *   the inbox. It handles document parsing using the DocumentClient and updates
 *   the inbox record with extracted information.
 */

import {
  InboxDocumentInput,
  InboxDocumentOutput,
  inboxDocumentInputSchema,
  inboxDocumentOutputSchema
} from './schema';
import { Task, schemaTask } from '@trigger.dev/sdk/v3';
import { logger, wait } from '@trigger.dev/sdk/v3';

import { DocumentClient } from '@solomonai/documents';
import { InboxType } from '@solomonai/prisma/client';
import { prisma } from '@solomonai/prisma/server';
import { utapi } from '@solomonai/lib/clients';

// Document processing timeout in ms
const DOC_PROCESSING_TIMEOUT = 120000; // 2 minutes
// File retrieval timeout in ms
const FILE_RETRIEVAL_TIMEOUT = 30000; // 30 seconds

/**
 * Background job that processes documents in the inbox.
 *
 * This job performs the following operations:
 *
 * 1. Retrieves the inbox record from Supabase
 * 2. Downloads the associated file from Supabase storage
 * 3. Uses DocumentClient to parse/extract information from the document
 * 4. Updates the inbox record with the extracted information
 *
 * @remarks
 *   The job includes error handling to ensure inbox records are processed even if
 *   document parsing fails. In case of failure, it will still mark the inbox as
 *   pending and trigger notification handling.
 */
export const inboxDocument: Task<
  'inbox-document',
  InboxDocumentInput,
  InboxDocumentOutput
> = schemaTask({
  id: 'inbox-document',
  schema: inboxDocumentInputSchema,
  maxDuration: 300, // 5 minutes
  queue: {
    concurrencyLimit: 10,
  },
  run: async ({ inboxId }) => {
    logger.info('Starting inbox document processing', { inboxId });
    let documentType: InboxType | null = null;
    let amount: number | null = null;
    let currency: string | null = null;
    let date: string | null = null;

    try {
      // Step 1: Retrieve inbox data
      const inboxData = await fetchInboxData(inboxId);

      // Step 2: Retrieve file content
      const filePath = inboxData.filePath.join('/');
      const buffer = await retrieveFileWithTimeout(filePath, inboxId);

      // Step 3: Process document with DocumentClient
      try {
        if (!inboxData.contentType) {
          throw new Error('Missing content type for document processing');
        }

        // Process document and get results
        const result = await processDocumentWithTimeout(
          buffer,
          inboxData.contentType,
          inboxId
        );

        // Step 4: Update extracted data values
        documentType = (result.type as InboxType) || null;
        amount = result.amount || null;
        currency = result.currency || null;
        date = result.date || null;

        // Step 5: Update inbox with extracted information
        const updatedInbox = await updateInboxWithDocumentData(
          inboxId,
          result
        );

        // Step 6: Check if document has matchable attributes
        const hasMatchableAttributes = Boolean(updatedInbox?.amount);

        // Return success result
        return inboxDocumentOutputSchema.parse({
          success: true,
          inboxId,
          status: 'PENDING',
          documentType,
          amount,
          currency,
          date,
          hasMatchableAttributes
        });
      } catch (error) {
        // Handle document processing errors
        return handleDocumentProcessingError(error, inboxId);
      }
    } catch (error) {
      // Handle critical errors
      return handleCriticalError(error, inboxId);
    }
  },
});

/**
 * Fetches the inbox record data
 * 
 * @param inboxId - ID of the inbox record
 * @returns Inbox data
 * @throws Error if inbox data not found or invalid
 */
async function fetchInboxData(inboxId: string) {
  logger.debug('Fetching inbox record', { inboxId });
  const inboxData = await prisma.inbox.findUnique({
    where: { id: inboxId },
    select: {
      filePath: true,
      contentType: true,
      displayName: true,
      teamId: true,
    },
  });

  if (!inboxData) {
    logger.error('Failed to retrieve inbox record', {
      inboxId,
      error: 'Record not found',
    });
    throw new Error('Inbox data not found');
  }

  if (
    !inboxData.filePath ||
    !Array.isArray(inboxData.filePath) ||
    inboxData.filePath.length === 0
  ) {
    logger.error('Invalid file path in inbox record', {
      inboxId,
      filePath: inboxData.filePath,
    });
    throw new Error('Inbox data has invalid or missing file path');
  }

  if (!inboxData.contentType) {
    logger.warn('Missing content type in inbox record', { inboxId });
  }

  return inboxData;
}

/**
 * Retrieves a file with timeout handling
 * 
 * @param filePath - Path to the file
 * @param inboxId - ID of the inbox record
 * @returns File content as ArrayBuffer
 * @throws Error if retrieval fails
 */
async function retrieveFileWithTimeout(
  filePath: string,
  inboxId: string
): Promise<ArrayBuffer> {
  logger.info('Retrieving file from storage', { inboxId, filePath });

  try {
    // Create a promise for file retrieval
    const filePromise = retrieveFileFromStorage(filePath);

    // Create a timeout promise
    const timeoutPromise = wait
      .for({ seconds: FILE_RETRIEVAL_TIMEOUT / 1000 })
      .then(() => {
        throw new Error('File retrieval timed out');
      });

    // Race the promises
    const buffer = await Promise.race([filePromise, timeoutPromise]);

    if (!buffer) {
      logger.error('Empty file buffer', { inboxId, filePath });
      throw new Error('No file data');
    }

    logger.debug('Successfully retrieved file', {
      inboxId,
      filePath,
      size: buffer.byteLength,
    });

    return buffer;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    logger.error('Failed to retrieve file from storage', {
      inboxId,
      filePath,
      error: errorMessage,
    });

    // Update inbox status to indicate retrieval failure
    await prisma.inbox.update({
      where: { id: inboxId },
      data: {
        status: 'PENDING',
        meta: { error: errorMessage },
      },
    });

    throw error;
  }
}

/**
 * Processes a document with timeout handling
 * 
 * @param buffer - File content
 * @param contentType - MIME type of the file
 * @param inboxId - ID of the inbox record
 * @returns Document processing result
 * @throws Error if processing fails
 */
async function processDocumentWithTimeout(
  buffer: ArrayBuffer,
  contentType: string,
  inboxId: string
): Promise<any> {
  logger.info('Processing document with DocumentClient', {
    inboxId,
    contentType,
  });

  // Create document client
  const document = new DocumentClient({
    contentType,
  });

  // Process document with timeout
  const documentPromise = document.getDocument({
    content: Buffer.from(buffer).toString('base64'),
  });

  // Create a timeout promise
  const timeoutPromise = wait
    .for({ seconds: DOC_PROCESSING_TIMEOUT / 1000 })
    .then(() => {
      throw new Error('Document processing timed out');
    });

  // Race the promises
  const result = await Promise.race([documentPromise, timeoutPromise]);

  if (!result) {
    throw new Error('Document processing returned no results');
  }

  logger.info('Document processed successfully', {
    inboxId,
    documentName: result.name,
    documentType: result.type,
  });

  return result;
}

/**
 * Updates an inbox record with document data
 * 
 * @param inboxId - ID of the inbox record
 * @param result - Document processing result
 * @returns Updated inbox record
 */
async function updateInboxWithDocumentData(
  inboxId: string,
  result: any
) {
  // Update inbox with extracted information
  const updatedInbox = await prisma.inbox.update({
    where: { id: inboxId },
    data: {
      amount: result.amount,
      currency: result.currency,
      displayName: result.name,
      website: result.website,
      date: result.date && new Date(result.date).toISOString(),
      type: result.type as InboxType,
      description: result.description,
      status: 'PENDING',
    },
  });

  logger.info('Updated inbox record with parsed document data', {
    inboxId,
    status: 'PENDING',
  });

  return updatedInbox;
}

/**
 * Handles document processing errors
 * 
 * @param error - The error that occurred
 * @param inboxId - ID of the inbox record
 * @returns Error output
 */
async function handleDocumentProcessingError(
  error: unknown,
  inboxId: string
): Promise<InboxDocumentOutput> {
  const errorMessage =
    error instanceof Error ? error.message : String(error);
  logger.error('Document processing failed', {
    inboxId,
    error: errorMessage,
  });

  // Update inbox status to indicate processing failure but keep as pending
  await prisma.inbox.update({
    where: { id: inboxId },
    data: {
      status: 'PENDING',
      meta: { processingError: errorMessage },
    },
  });

  // Return partial success (inbox record created but processing failed)
  return inboxDocumentOutputSchema.parse({
    success: false,
    inboxId,
    status: 'PENDING',
    documentType: null,
    hasMatchableAttributes: false
  });
}

/**
 * Handles critical errors
 * 
 * @param error - The error that occurred
 * @param inboxId - ID of the inbox record
 * @returns Error output
 */
function handleCriticalError(
  error: unknown,
  inboxId: string
): InboxDocumentOutput {
  const errorMessage =
    error instanceof Error ? error.message : String(error);
  logger.error('Failed to process inbox document', {
    inboxId,
    error: errorMessage,
  });

  // Return failure result
  return inboxDocumentOutputSchema.parse({
    success: false,
    inboxId,
    status: 'FAILED',
    documentType: null,
    hasMatchableAttributes: false
  });
}

/**
 * Retrieves a file from storage
 * 
 * @param path - Path to the file
 * @returns ArrayBuffer containing the file data
 * @throws Error if the file cannot be retrieved
 */
async function retrieveFileFromStorage(path: string): Promise<ArrayBuffer> {
  try {
    // Fetch directly - utapi doesn't have a getFileData method
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }
    return await response.arrayBuffer();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to retrieve file from storage: ${errorMessage}`);
  }
}

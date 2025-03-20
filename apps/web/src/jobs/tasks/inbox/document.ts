/**
 * @module jobs/tasks/inbox/document
 * @file This module defines a background job for processing document content in
 *   the inbox. It handles document parsing using the DocumentClient and updates
 *   the inbox record with extracted information.
 */

import { logger, wait } from '@trigger.dev/sdk/v3';

import { DocumentClient } from '@solomonai/documents';
import { InboxType } from '@solomonai/prisma/client';
import { prisma } from '@/server/db';
import { schemaTask } from '@trigger.dev/sdk/v3';
import { utapi } from '@/lib/uploadthing';
import { z } from 'zod';

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
export const inboxDocument = schemaTask({
  id: 'inbox-document',
  schema: z.object({
    /** UUID of the inbox record to process */
    inboxId: z.string().uuid(),
  }),
  maxDuration: 300, // 5 minutes
  queue: {
    concurrencyLimit: 10,
  },
  run: async ({ inboxId }) => {
    logger.info('Starting inbox document processing', { inboxId });

    try {
      // Retrieve inbox data
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

      const filePath = inboxData.filePath.join('/');
      logger.info('Retrieving file from UploadThing', { inboxId, filePath });

      // Download file with timeout handling
      let buffer: ArrayBuffer | undefined;

      try {
        // Create a promise for file retrieval from UploadThing
        const filePromise = retrieveFileFromStorage(filePath);

        // Create a timeout promise
        const timeoutPromise = wait
          .for({ seconds: FILE_RETRIEVAL_TIMEOUT / 1000 })
          .then(() => {
            throw new Error('File retrieval timed out');
          });

        // Race the promises
        buffer = await Promise.race([filePromise, timeoutPromise]);
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

        throw new Error(`Failed to retrieve file: ${errorMessage}`);
      }

      if (!buffer) {
        logger.error('Empty file buffer', { inboxId, filePath });
        throw new Error('No file data');
      }

      logger.debug('Successfully retrieved file', {
        inboxId,
        filePath,
        size: buffer.byteLength,
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

        // Create document client
        const document = new DocumentClient({
          contentType: inboxData.contentType,
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

        if (updatedInbox?.amount) {
          logger.info('Document has amount information, can be matched', {
            inboxId,
            amount: updatedInbox.amount,
          });
          // TODO: Send event to match inbox
        } else {
          // No amount detected, send notification
          // TODO: uncomment this when we have a way to handle notifications
          // await handleInboxNotifications({
          //     inboxId,
          //     description: updatedInbox?.display_name || inboxData.display_name || "Unknown document",
          //     teamId: inboxData.team_id!,
          // });
        }

        return {
          success: true,
          inboxId,
          message: 'Document processed and inbox record updated',
        };
      } catch (error) {
        // Handle document processing errors
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        logger.warn('Failed to parse document', {
          inboxId,
          error: errorMessage,
        });

        // Still update status to pending even if processing failed
        await prisma.inbox.update({
          where: { id: inboxId },
          data: { status: 'PENDING' },
        });

        logger.info(
          'Updated inbox record to pending status after processing failure',
          {
            inboxId,
          }
        );

        // Send notification about the new inbox record
        // TODO: uncomment this when we have a way to handle notifications
        // await handleInboxNotifications({
        //     inboxId,
        //     description: inboxData.display_name!,
        //     teamId: inboxData.team_id!,
        // });

        return {
          success: false,
          inboxId,
          message:
            'Document processing failed, but inbox record was updated to pending',
        };
      }
    } catch (error) {
      // Capture and log critical errors
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      logger.error('Critical error in inbox document job', {
        inboxId,
        error: errorMessage,
        stack: errorStack,
      });

      throw error;
    }
  },
});

/**
 * Retrieves file content from UploadThing storage
 *
 * @param path - Full path to the file
 * @returns ArrayBuffer containing the file content
 */
async function retrieveFileFromStorage(path: string): Promise<ArrayBuffer> {
  try {
    logger.debug('Retrieving file from UploadThing', { path });

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

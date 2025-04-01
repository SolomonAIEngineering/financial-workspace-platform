import { InboxType } from '@solomonai/prisma/client';
import { z } from 'zod';

/**
 * Schema for the inbox upload task input
 */
export const inboxUploadInputSchema = z.object({
    /** UUID of the team associated with this upload */
    teamId: z.string()
        .describe('UUID of the team associated with this upload'),

    /** MIME type of the uploaded file */
    mimetype: z.string()
        .describe('MIME type of the uploaded file'),

    /** Size of the uploaded file in bytes */
    size: z.number()
        .describe('Size of the uploaded file in bytes'),

    /** Array of path segments for the file location in storage */
    file_path: z.array(z.string().min(1)).min(1)
        .describe('Array of path segments for the file location in storage'),
});

/**
 * Schema for the inbox upload task output
 */
export const inboxUploadOutputSchema = z.object({
    success: z.boolean()
        .describe('Whether the upload processing was successful'),

    inboxId: z.string()
        .describe('UUID of the created inbox record'),

    status: z.enum(['NEW', 'PROCESSING', 'PENDING', 'FAILED', 'FAILED_RETRIEVAL'])
        .describe('Status of the inbox record after processing'),

    documentType: z.nativeEnum(InboxType).nullable().optional()
        .describe('Type of document detected, if any'),

    metadata: z.record(z.any()).optional()
        .describe('Additional metadata extracted from the document'),
});

/**
 * Schema for the inbox document task input
 */
export const inboxDocumentInputSchema = z.object({
    /** UUID of the inbox record to process */
    inboxId: z.string()
        .describe('UUID of the inbox record to process'),
});

/**
 * Schema for the inbox document task output
 */
export const inboxDocumentOutputSchema = z.object({
    success: z.boolean()
        .describe('Whether the document processing was successful'),

    inboxId: z.string()
        .describe('UUID of the processed inbox record'),

    status: z.enum(['PENDING', 'FAILED'])
        .describe('Status of the inbox record after processing'),

    documentType: z.nativeEnum(InboxType).nullable().optional()
        .describe('Type of document detected, if any'),

    amount: z.number().nullable().optional()
        .describe('Amount extracted from the document, if any'),

    currency: z.string().nullable().optional()
        .describe('Currency extracted from the document, if any'),

    date: z.string().nullable().optional()
        .describe('Date extracted from the document, if any'),

    hasMatchableAttributes: z.boolean()
        .describe('Whether the document has attributes that can be used for matching'),
});

// Type definitions derived from schemas
export type InboxUploadInput = z.infer<typeof inboxUploadInputSchema>;
export type InboxUploadOutput = z.infer<typeof inboxUploadOutputSchema>;
export type InboxDocumentInput = z.infer<typeof inboxDocumentInputSchema>;
export type InboxDocumentOutput = z.infer<typeof inboxDocumentOutputSchema>; 
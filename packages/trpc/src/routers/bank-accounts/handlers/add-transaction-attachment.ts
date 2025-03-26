import { addTransactionAttachmentSchema, attachmentResponseSchema } from '../schema';

import { TRPCError } from '@trpc/server';
import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';

/**
 * Protected procedure to add an attachment to a transaction.
 * 
 * This procedure validates that:
 * 1. The user is authenticated
 * 2. The transaction exists and belongs to the authenticated user
 * 
 * If validation passes, it creates a new attachment record linked to the transaction.
 * 
 * @input {object} addTransactionAttachmentSchema - The attachment data to store
 *   - fileSize: Size of the file in bytes
 *   - fileType: MIME type of the file
 *   - fileUrl: URL to access the file
 *   - name: Display name of the attachment
 *   - transactionId: ID of the transaction to attach to
 * 
 * @output {object} attachmentResponseSchema - The created attachment record
 * 
 * @throws {TRPCError} NOT_FOUND - If the transaction doesn't exist or doesn't belong to the user
 * @throws {TRPCError} INTERNAL_SERVER_ERROR - If there's an error creating the attachment
 * 
 * @returns The newly created attachment record
 */
export const addTransactionAttachment = protectedProcedure
    .input(addTransactionAttachmentSchema)
    .output(attachmentResponseSchema)
    .mutation(async ({ ctx, input }) => {
        try {
            // Get the authenticated user ID
            const userId = ctx.session?.userId;

            // Ensure the transaction belongs to the user
            const transaction = await prisma.transaction.findFirst({
                where: {
                    id: input.transactionId,
                    userId,
                },
            });

            if (!transaction) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Transaction not found',
                });
            }

            // Add the attachment
            const attachment = await prisma.attachment.create({
                data: {
                    fileSize: input.fileSize,
                    fileType: input.fileType,
                    fileUrl: input.fileUrl,
                    name: input.name,
                    transactionId: input.transactionId,
                },
            });

            return attachment;
        } catch (error) {
            console.error('Error adding attachment:', error);

            throw new TRPCError({
                cause: error,
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to add attachment',
            });
        }
    }); 
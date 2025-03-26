import { Prisma, prisma } from '@solomonai/prisma';

import { TRPCError } from '@trpc/server';
import { addAttachmentSchema } from '../schema';
import { protectedProcedure } from '../../../middlewares/procedures';

/**
 * Adds an attachment to a transaction by creating a new TransactionAttachment record.
 * This handler verifies that the user is authenticated and that the transaction belongs to the user
 * before creating the attachment.
 *
 * @param ctx - The context object containing the user's session information
 * @param input - The input object containing:
 *   - id: The ID of the transaction to attach the file to
 *   - fileName: The name of the file being attached
 *   - fileType: The MIME type of the file
 *   - fileSize: The size of the file in bytes
 *   - fileUrl: The URL where the file is stored
 * @returns The newly created TransactionAttachment entity with all its properties
 * @throws {TRPCError} With code 'UNAUTHORIZED' if the user is not authenticated
 * @throws {TRPCError} With code 'NOT_FOUND' if the transaction doesn't exist or doesn't belong to the user
 */
export const addAttachmentHandler = protectedProcedure
  .input(addAttachmentSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId;

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: input.id, userId: userId },
    });

    if (!existingTransaction || existingTransaction.userId !== userId) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Transaction not found or does not belong to user',
      });
    }

    // Create and attach the transaction attachment
    const attachment = await prisma.transactionAttachment.create({
      data: {
        transaction: {
          connect: { id: input.id },
        },
        name: input.fileName,
        type: input.fileType,
        size: input.fileSize,
        path: [input.fileUrl],
      },
    });

    return attachment;
  });

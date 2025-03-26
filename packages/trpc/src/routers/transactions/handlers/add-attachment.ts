import { TRPCError } from '@trpc/server';
import { Prisma, prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';
import { z } from 'zod';

export const addAttachmentHandler = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      fileName: z.string(),
      fileType: z.string(),
      fileSize: z.number(),
      fileUrl: z.string(),
      description: z.string().optional(),
      isReceipt: z.boolean().default(false),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId;
    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: input.id },
    });

    if (!existingTransaction || existingTransaction.userId !== userId) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Transaction not found',
      });
    }

    // Create attachment
    const attachment = await prisma.transactionAttachment.create({
      data: {
        transactionId: input.id,
        name: input.fileName,
        type: input.fileType,
        size: input.fileSize,
        path: [input.fileUrl], // path is a string array in the schema
        // No direct field for description or isReceipt in the schema
      },
    });

    // Update transaction relation - no need to set hasAttachments field as it's not in the schema
    // The relation is automatically handled by Prisma through the transactionId field

    return attachment;
  });

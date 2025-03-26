import { TRPCError } from '@trpc/server';
import { Prisma, prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';
import { z } from 'zod';

export const listTransactionAttachmentsHandler = protectedProcedure
  .input(z.object({ transactionId: z.string() }))
  .query(async ({ ctx, input }) => {
    const userId = ctx.session?.userId;
    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: input.transactionId },
    });

    if (!existingTransaction || existingTransaction.userId !== userId) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Transaction not found',
      });
    }

    // Get all attachments for this transaction
    const attachments = await prisma.transactionAttachment.findMany({
      where: {
        transactionId: input.transactionId,
      },
    });

    return attachments;
  });

export const deleteTransactionAttachmentHandler = protectedProcedure
  .input(z.object({ id: z.string(), transactionId: z.string() }))
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
      where: { id: input.transactionId },
    });

    if (!existingTransaction || existingTransaction.userId !== userId) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Transaction not found',
      });
    }

    // Check if attachment exists and belongs to this transaction
    const attachment = await prisma.transactionAttachment.findFirst({
      where: {
        id: input.id,
        transactionId: input.transactionId,
      },
    });

    if (!attachment) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Attachment not found',
      });
    }

    // Delete the attachment
    await prisma.transactionAttachment.delete({
      where: { id: input.id },
    });

    // Check if there are any remaining attachments for this transaction
    const remainingAttachments = await prisma.transactionAttachment.findFirst({
      where: {
        transactionId: input.transactionId,
      },
    });

    return { success: true };
  });

export const updateTransactionAttachmentHandler = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      transactionId: z.string(),
      name: z.string().optional(),
      type: z.string().optional(),
      path: z.array(z.string()).optional(),
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
      where: { id: input.transactionId },
    });

    if (!existingTransaction || existingTransaction.userId !== userId) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Transaction not found',
      });
    }

    // Check if attachment exists and belongs to this transaction
    const attachment = await prisma.transactionAttachment.findFirst({
      where: {
        id: input.id,
        transactionId: input.transactionId,
      },
    });

    if (!attachment) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Attachment not found',
      });
    }

    // Update the attachment
    const updatedAttachment = await prisma.transactionAttachment.update({
      where: { id: input.id },
      data: {
        name: input.name,
        type: input.type,
        path: input.path,
      },
    });

    return updatedAttachment;
  });

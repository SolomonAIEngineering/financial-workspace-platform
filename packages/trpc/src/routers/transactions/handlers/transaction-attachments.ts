import {
  deleteTransactionAttachmentSchema,
  listTransactionAttachmentsSchema,
  updateTransactionAttachmentSchema,
} from '../schema'

import { TRPCError } from '@trpc/server'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'

export const listTransactionAttachmentsHandler = protectedProcedure
  .input(listTransactionAttachmentsSchema)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session?.userId
    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: input.transactionId, userId: userId },
    })

    if (!existingTransaction) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Transaction not found',
      })
    }

    // Get all attachments for this transaction
    const attachments = await prisma.transactionAttachment.findMany({
      where: {
        transactionId: input.transactionId,
      },
    })

    return attachments
  })

export const deleteTransactionAttachmentHandler = protectedProcedure
  .input(deleteTransactionAttachmentSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: input.id, userId: userId },
    })

    if (!existingTransaction) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Transaction not found',
      })
    }

    // Check if attachment exists and belongs to this transaction
    const attachment = await prisma.transactionAttachment.findFirst({
      where: {
        id: input.id,
        transactionId: input.id,
      },
    })

    if (!attachment) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Attachment not found',
      })
    }

    // Delete the attachment
    const deletedAttachment = await prisma.transactionAttachment.delete({
      where: { id: input.id },
    })

    if (!deletedAttachment) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete attachment',
      })
    }

    return { success: true }
  })

export const updateTransactionAttachmentHandler = protectedProcedure
  .input(updateTransactionAttachmentSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: input.transactionId, userId: userId },
    })

    if (!existingTransaction) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Transaction not found',
      })
    }

    // Check if attachment exists and belongs to this transaction
    const attachment = await prisma.transactionAttachment.findFirst({
      where: {
        id: input.id,
        transactionId: input.transactionId,
      },
    })

    if (!attachment) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Attachment not found',
      })
    }

    // Update the attachment
    const updatedAttachment = await prisma.transactionAttachment.update({
      where: { id: input.id },
      data: {
        name: input.name,
        type: input.type,
        path: input.path,
      },
    })

    if (!updatedAttachment) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update attachment',
      })
    }
    return updatedAttachment
  })

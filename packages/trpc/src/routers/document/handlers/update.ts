import { NodeApi } from '@udecode/plate';
import { TRPCError } from '@trpc/server';
import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';
import { updateDocumentSchema, MAX_CONTENT_LENGTH } from '../schema';

/**
 * Protected procedure to update a document.
 * 
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Validates the document content length
 * 3. Updates the document with the provided fields
 * 
 * @input {UpdateDocumentInput} - Document fields to update including ID
 * @returns void
 * 
 * @throws {TRPCError} BAD_REQUEST - If the content is too long
 * @throws {TRPCError} NOT_FOUND - If the document does not exist or user doesn't have access
 */
export const update = protectedProcedure
  .input(updateDocumentSchema)
  .mutation(async ({ ctx, input }) => {
    const content = input.contentRich
      ? NodeApi.string({
        children: input.contentRich,
        type: 'root',
      })
      : undefined;

    if (content && content.length > MAX_CONTENT_LENGTH) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Content is too long',
      });
    }

    await prisma.document.update({
      data: {
        content: input.content,
        contentRich: input.contentRich,
        coverImage: input.coverImage,
        fullWidth: input.fullWidth,
        icon: input.icon,
        isPublished: input.isPublished,
        lockPage: input.lockPage,
        smallText: input.smallText,
        textStyle: input.textStyle,
        title: input.title,
        toc: input.toc,
      },
      where: {
        id: input.id,
        userId: ctx.session?.userId,
      },
    });
  });

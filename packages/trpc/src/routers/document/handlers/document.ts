import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';
import { documentSchema } from '../schema';

/**
 * Protected procedure to retrieve a single document.
 * 
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Retrieves the document by ID with all its fields
 * 
 * @input {DocumentInput} - Document ID to retrieve
 * @returns Object containing the document
 * 
 * @throws {TRPCError} NOT_FOUND - If the document does not exist or user doesn't have access
 */
export const document = protectedProcedure
  .input(documentSchema)
  .query(async ({ ctx, input }) => {
    const document = await prisma.document.findUnique({
      select: {
        id: true,
        contentRich: true,
        coverImage: true,
        fullWidth: true,
        icon: true,
        isArchived: true,
        isPublished: true,
        isTemplate: true,
        lockPage: true,
        parentDocumentId: true,
        pinned: true,
        smallText: true,
        status: true,
        tags: true,
        templateId: true,
        textStyle: true,
        title: true,
        toc: true,
        updatedAt: true,
      },
      where: {
        id: input.id,
        userId: ctx.session?.userId,
      },
    });

    return {
      document,
    };
  });

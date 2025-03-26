import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';
import { documentsSchema } from '../schema';

/**
 * Protected procedure to retrieve multiple documents.
 * 
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Retrieves all non-archived documents belonging to the user
 * 3. Optionally filters by parent document ID
 * 
 * @input {DocumentsInput} - Optional parent document ID to filter by
 * @returns Object containing the documents array
 */
export const documents = protectedProcedure
  .input(documentsSchema)
  .query(async ({ ctx, input }) => {
    const documents = await prisma.document.findMany({
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        id: true,
        coverImage: true,
        icon: true,
        isTemplate: true,
        pinned: true,
        status: true,
        tags: true,
        title: true,
        updatedAt: true,
      },
      where: {
        isArchived: false,
        parentDocumentId: input.parentDocumentId ?? null,
        userId: ctx.session?.userId,
      },
    });

    return {
      documents,
    };
  });

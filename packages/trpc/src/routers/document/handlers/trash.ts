import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';
import { trashSchema } from '../schema';

/**
 * Protected procedure to retrieve trashed (archived) documents.
 * 
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Retrieves all archived documents belonging to the user
 * 3. Optionally filters by title containing the search query
 * 
 * @input {TrashInput} - Optional search query string
 * @returns Object containing the trashed documents array
 */
export const trash = protectedProcedure
  .input(trashSchema)
  .query(async ({ ctx, input }) => {
    const documents = await prisma.document.findMany({
      select: {
        id: true,
        icon: true,
        title: true,
      },
      where: {
        isArchived: true,
        title: {
          contains: input.q ?? '',
        },
        userId: ctx.session?.userId,
      },
    });

    return {
      documents,
    };
  });

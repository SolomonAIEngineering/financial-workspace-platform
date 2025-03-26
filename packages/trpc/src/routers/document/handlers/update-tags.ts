import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';
import { updateTagsSchema } from '../schema';

/**
 * Protected procedure to update a document's tags.
 * 
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Updates the document tags
 * 
 * @input {UpdateTagsInput} - Document ID and array of tags
 * @returns Object containing the updated tags
 * 
 * @throws {TRPCError} NOT_FOUND - If the document does not exist or user doesn't have access
 */
export const updateTags = protectedProcedure
  .input(updateTagsSchema)
  .mutation(async ({ ctx, input }) => {
    await prisma.document.update({
      data: {
        tags: input.tags,
      },
      where: {
        id: input.id,
        userId: ctx.session?.userId,
      },
    });

    return { tags: input.tags };
  });

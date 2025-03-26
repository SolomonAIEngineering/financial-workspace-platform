import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';
import { archiveDocumentSchema } from '../schema';

/**
 * Protected procedure to archive a document.
 * 
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Updates the document to set isArchived to true
 * 
 * @input {ArchiveDocumentInput} - Document ID to archive
 * @returns void
 * 
 * @throws {TRPCError} NOT_FOUND - If the document does not exist or user doesn't have access
 */
export const archive = protectedProcedure
  .input(archiveDocumentSchema)
  .mutation(async ({ ctx, input }) => {
    await prisma.document.update({
      data: {
        isArchived: true,
      },
      where: {
        id: input.id,
        userId: ctx.session?.userId,
      },
    });
  });

import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';
import { deleteDocumentSchema } from '../schema';

/**
 * Protected procedure to delete a document.
 * 
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Permanently deletes the document
 * 
 * @input {DeleteDocumentInput} - Document ID to delete
 * @returns void
 * 
 * @throws {TRPCError} NOT_FOUND - If the document does not exist or user doesn't have access
 */
export const deleteDocument = protectedProcedure
  .input(deleteDocumentSchema)
  .mutation(async ({ ctx, input }) => {
    await prisma.document.delete({
      where: {
        id: input.id,
        userId: ctx.session?.userId,
      },
    });
  });

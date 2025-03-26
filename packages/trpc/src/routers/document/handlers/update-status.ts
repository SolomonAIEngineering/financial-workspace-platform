import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';
import { updateStatusSchema } from '../schema';

/**
 * Protected procedure to update a document's status.
 * 
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Updates the document status (draft, review, approved, published, archived)
 * 
 * @input {UpdateStatusInput} - Document ID and new status
 * @returns Object containing the new status
 * 
 * @throws {TRPCError} NOT_FOUND - If the document does not exist or user doesn't have access
 */
export const updateStatus = protectedProcedure
  .input(updateStatusSchema)
  .mutation(async ({ ctx, input }) => {
    await prisma.document.update({
      data: {
        status: input.status,
      },
      where: {
        id: input.id,
        userId: ctx.session?.userId,
      },
    });

    return { status: input.status };
  });

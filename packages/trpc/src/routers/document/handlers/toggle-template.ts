import { TRPCError } from '@trpc/server';
import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';
import { toggleTemplateSchema } from '../schema';

/**
 * Protected procedure to toggle a document's template status.
 * 
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Fetches the current template status of the document
 * 3. Updates the document to toggle the template status
 * 
 * @input {ToggleTemplateInput} - Document ID to toggle template status
 * @returns Object containing the new template status
 * 
 * @throws {TRPCError} NOT_FOUND - If the document does not exist or user doesn't have access
 */
export const toggleTemplate = protectedProcedure
  .input(toggleTemplateSchema)
  .mutation(async ({ ctx, input }) => {
    const document = await prisma.document.findUnique({
      select: { isTemplate: true },
      where: {
        id: input.id,
        userId: ctx.session?.userId,
      },
    });

    if (!document) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Document not found',
      });
    }

    await prisma.document.update({
      data: {
        isTemplate: !document.isTemplate,
      },
      where: {
        id: input.id,
        userId: ctx.session?.userId,
      },
    });

    return { isTemplate: !document.isTemplate };
  });

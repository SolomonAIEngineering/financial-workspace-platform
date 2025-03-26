import { NodeApi } from '@udecode/plate';
import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';
import { restoreVersionSchema } from '../schema';

/**
 * Protected procedure to restore a document to a previous version.
 * 
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Finds the specified version
 * 3. Updates the document with content from the selected version
 * 
 * @input {RestoreVersionInput} - Version ID to restore
 * @returns The updated document
 * 
 * @throws {TRPCError} NOT_FOUND - If the version or document does not exist
 * @throws {TRPCError} FORBIDDEN - If the user doesn't have access to the document
 */
export const restoreVersion = protectedProcedure
  .input(restoreVersionSchema)
  .mutation(async ({ ctx, input }) => {
    const version = await prisma.documentVersion.findUniqueOrThrow({
      select: {
        contentRich: true,
        documentId: true,
        title: true,
      },
      where: {
        id: input.id,
      },
    });

    const content = version.contentRich
      ? NodeApi.string({ children: version.contentRich as any, type: 'root' })
      : '';

    return await prisma.document.update({
      data: {
        content,
        contentRich: version.contentRich as any,
        title: version.title,
      },
      where: {
        id: version.documentId,
        userId: ctx.user?.id as string,
      },
    });
  });

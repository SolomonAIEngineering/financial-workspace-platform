import { createVersionSchema } from '../schema'
import { getTemplateDocument } from '@solomonai/lib/utils'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'
import { ratelimitMiddleware } from '../../../middlewares/ratelimitMiddleware'

/**
 * Protected procedure to create a new document version.
 *
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Rate-limits the version creation
 * 3. Finds the document and ensures the user has access
 * 4. Creates a new version of the document
 *
 * @input {CreateVersionInput} - Document ID
 * @returns Created version ID
 *
 * @throws {TRPCError} NOT_FOUND - If the document does not exist or user doesn't have access
 */
export const createVersion = protectedProcedure
  .use(ratelimitMiddleware('version/create'))
  .input(createVersionSchema)
  .mutation(async ({ ctx, input }) => {
    const document = await prisma.document.findUniqueOrThrow({
      select: {
        contentRich: true,
        templateId: true,
        title: true,
      },
      where: {
        id: input.documentId,
        userId: ctx.user?.id,
      },
    })

    if (!document.contentRich && document.templateId) {
      const template = getTemplateDocument(document.templateId)

      document.contentRich = template.value as any
    }

    return await prisma.documentVersion.create({
      data: {
        contentRich: document.contentRich as any,
        documentId: input.documentId,
        title: document.title,
        userId: ctx.user?.id as string,
      },
      select: { id: true },
    })
  })

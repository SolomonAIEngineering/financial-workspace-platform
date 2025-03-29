import { nid } from '@solomonai/lib/utils/nid'
import { prisma } from '@solomonai/prisma'
import { TRPCError } from '@trpc/server'
import { NodeApi } from '@udecode/plate'
import { protectedProcedure } from '../../../middlewares/procedures'
import { ratelimitMiddleware } from '../../../middlewares/ratelimitMiddleware'
import { createDocumentSchema, MAX_CONTENT_LENGTH } from '../schema'

/**
 * Protected procedure to create a new document.
 *
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Rate-limits document creation
 * 3. Validates the document content length
 * 4. Creates a new document
 *
 * @input {CreateDocumentInput} - Document data including optional title, content, and parent document ID
 * @returns Created document ID
 *
 * @throws {TRPCError} BAD_REQUEST - If the content is too long
 */
export const create = protectedProcedure
  .use(ratelimitMiddleware('document/create'))
  .input(createDocumentSchema)
  .mutation(async ({ ctx, input }) => {
    const content = input.contentRich
      ? NodeApi.string({
          children: input.contentRich,
          type: 'root',
        })
      : ''

    if (content.length > MAX_CONTENT_LENGTH) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Content is too long',
      })
    }

    return await prisma.document.create({
      data: {
        id: nid(),
        contentRich: input.contentRich,
        parentDocumentId: input.parentDocumentId ?? null,
        title: input.title,
        userId: ctx.session?.userId as string,
      },
      select: { id: true },
    })
  })

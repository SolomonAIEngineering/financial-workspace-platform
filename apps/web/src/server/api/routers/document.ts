import { TRPCError } from '@trpc/server';
import { NodeApi } from '@udecode/plate';
import { z } from 'zod';

import { isTemplateDocument } from '@/components/editor/utils/useTemplateDocument';
import { nid } from '@/lib/nid';
import { prisma } from '@/server/db';

import { protectedProcedure } from '../middlewares/procedures';
import { ratelimitMiddleware } from '../middlewares/ratelimitMiddleware';
import { createRouter } from '../trpc';

const MAX_TITLE_LENGTH = 256;
const MAX_CONTENT_LENGTH = 1_000_000; // 1MB of text
const MAX_ICON_LENGTH = 100;
const MAX_TAG_LENGTH = 50;
const MAX_TAGS = 10;

// Document status constants
const DOCUMENT_STATUS = [
  'draft',
  'review',
  'approved',
  'published',
  'archived',
] as const;
type DocumentStatus = (typeof DOCUMENT_STATUS)[number];

export const documentMutations = {
  archive: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await prisma.document.update({
        data: {
          isArchived: true,
        },
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      });
    }),

  create: protectedProcedure
    .use(ratelimitMiddleware('document/create'))
    .input(
      z.object({
        contentRich: z.any().optional(),
        parentDocumentId: z.string().optional(),
        title: z.string().max(MAX_TITLE_LENGTH, 'Title is too long').optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const content = input.contentRich
        ? NodeApi.string({
            children: input.contentRich,
            type: 'root',
          })
        : '';

      if (content.length > MAX_CONTENT_LENGTH) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Content is too long',
        });
      }

      return await prisma.document.create({
        data: {
          id: nid(),
          contentRich: input.contentRich,
          parentDocumentId: input.parentDocumentId ?? null,
          title: input.title,
          userId: ctx.userId,
        },
        select: { id: true },
      });
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await prisma.document.delete({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      });
    }),

  restore: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await prisma.document.update({
        data: {
          isArchived: false,
        },
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      });
    }),

  // New mutation for toggling document pinned status
  togglePin: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const document = await prisma.document.findUnique({
        select: { pinned: true },
        where: {
          id: input.id,
          userId: ctx.userId,
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
          pinned: !document.pinned,
        },
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      });

      return { pinned: !document.pinned };
    }),

  // New mutation for toggling template status
  toggleTemplate: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const document = await prisma.document.findUnique({
        select: { isTemplate: true },
        where: {
          id: input.id,
          userId: ctx.userId,
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
          userId: ctx.userId,
        },
      });

      return { isTemplate: !document.isTemplate };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        content: z
          .string()
          .max(MAX_CONTENT_LENGTH, 'Content is too long')
          .optional(),
        contentRich: z.any().optional(),
        coverImage: z.string().max(500).optional(),
        fullWidth: z.boolean().optional(),
        icon: z.string().max(MAX_ICON_LENGTH).nullish(),
        isPublished: z.boolean().optional(),
        lockPage: z.boolean().optional(),
        smallText: z.boolean().optional(),
        textStyle: z.enum(['DEFAULT', 'SERIF', 'MONO']).optional(),
        title: z.string().max(MAX_TITLE_LENGTH, 'Title is too long').optional(),
        toc: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const content = input.contentRich
        ? NodeApi.string({
            children: input.contentRich,
            type: 'root',
          })
        : undefined;

      if (content && content.length > MAX_CONTENT_LENGTH) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Content is too long',
        });
      }

      await prisma.document.update({
        data: {
          content: input.content,
          contentRich: input.contentRich,
          coverImage: input.coverImage,
          fullWidth: input.fullWidth,
          icon: input.icon,
          isPublished: input.isPublished,
          lockPage: input.lockPage,
          smallText: input.smallText,
          textStyle: input.textStyle,
          title: input.title,
          toc: input.toc,
        },
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      });
    }),

  // New mutation for updating document status
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(DOCUMENT_STATUS),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await prisma.document.update({
        data: {
          status: input.status,
        },
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      });

      return { status: input.status };
    }),

  // New mutation for managing document tags
  updateTags: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        tags: z
          .array(z.string().max(MAX_TAG_LENGTH))
          .max(MAX_TAGS, 'Maximum 10 tags allowed'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await prisma.document.update({
        data: {
          tags: input.tags,
        },
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      });

      return { tags: input.tags };
    }),
};

export const documentRouter = createRouter({
  ...documentMutations,
  document: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const document = await prisma.document.findUnique({
        select: {
          id: true,
          contentRich: true,
          coverImage: true,
          fullWidth: true,
          icon: true,
          isArchived: true,
          isPublished: true,
          isTemplate: true,
          lockPage: true,
          parentDocumentId: true,
          pinned: true,
          smallText: true,
          status: true,
          tags: true,
          templateId: true,
          textStyle: true,
          title: true,
          toc: true,
          updatedAt: true,
        },
        where: {
          id: isTemplateDocument(input.id) ? undefined : input.id,
          userId_templateId: isTemplateDocument(input.id)
            ? {
                templateId: input.id,
                userId: ctx.userId,
              }
            : undefined,
        },
      });

      return {
        document,
      };
    }),

  documents: protectedProcedure
    .input(
      z.object({
        parentDocumentId: z.string().optional(),
      })
    )
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
          userId: ctx.userId,
        },
      });

      return {
        documents,
      };
    }),
  search: protectedProcedure
    .input(
      z.object({
        q: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const documents = await prisma.document.findMany({
        select: {
          id: true,
          icon: true,
          title: true,
        },
        where: {
          isArchived: false,
          title: {
            contains: input.q,
          },
          userId: ctx.userId,
        },
      });

      return {
        documents,
      };
    }),
  trash: protectedProcedure
    .input(
      z.object({
        q: z.string().optional(),
      })
    )
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
          userId: ctx.userId,
        },
      });

      return {
        documents,
      };
    }),
});

import { TRPCError } from '@trpc/server'
import { prisma } from '@solomonai/prisma/server'
import { protectedProcedure } from '../../../middlewares/procedures'
import { updateTagsSchema } from '../schema'

export const updateTagsHandler = protectedProcedure
  .input(updateTagsSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: input.id, userId: userId },
    })

    if (!existingTransaction) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Transaction not found',
      })
    }

    // Handle case-insensitive duplicates among input tags
    const uniqueInputTags: string[] = []
    const lowerCaseInputTags = new Set<string>()

    // Process each input tag, keeping only the first occurrence (case-insensitive)
    for (const tag of input.tags) {
      if (tag.trim() === '') continue // Skip empty tags

      const lowerCaseTag = tag.toLowerCase()

      // Check if this tag already exists in our input (case-insensitive)
      if (!lowerCaseInputTags.has(lowerCaseTag)) {
        uniqueInputTags.push(tag)
        lowerCaseInputTags.add(lowerCaseTag)
      }
    }

    // Get existing tags from the transaction
    const existingTags = existingTransaction.tags || []
    const lowerCaseExistingTags = new Set(
      existingTags.map((tag) => tag.toLowerCase()),
    )

    // Only add tags that don't already exist (case-insensitive)
    const tagsToAdd = uniqueInputTags.filter(
      (tag) => !lowerCaseExistingTags.has(tag.toLowerCase()),
    )

    // Combine existing tags with new unique tags
    const updatedTags = [...existingTags, ...tagsToAdd]

    // Update transaction with combined tags
    const updatedTransaction = await prisma.transaction.update({
      where: { id: input.id },
      data: {
        tags: updatedTags,
        lastModifiedAt: new Date(),
      },
    })

    if (!updatedTransaction) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update transaction tags',
      })
    }

    return updatedTransaction
  })

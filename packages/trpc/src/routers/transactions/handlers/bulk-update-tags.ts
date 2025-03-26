import { TRPCError } from '@trpc/server';
import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';
import { z } from 'zod';

export const bulkUpdateTagsHandler = protectedProcedure
  .input(
    z.object({
      transactionIds: z.array(z.string()),
      tags: z.array(z.string()),
      operation: z.enum(['add', 'replace', 'remove']).default('replace'),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId;
    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    const { transactionIds, tags, operation } = input;

    // Verify all transactions exist and belong to the user
    const transactions = await prisma.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId,
      },
    });

    if (transactions.length !== transactionIds.length) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'One or more transactions not found or not owned by user',
      });
    }

    // Apply the operation to each transaction
    const results = await Promise.all(
      transactions.map(async (transaction) => {
        try {
          let updatedTags: string[];

          // Determine how to update the tags based on the operation
          switch (operation) {
            case 'add':
              // Add tags without duplicates
              updatedTags = Array.from(
                new Set([...(transaction.tags || []), ...tags])
              );
              break;
            case 'remove':
              // Remove the specified tags
              updatedTags = (transaction.tags || []).filter(
                (tag) => !tags.includes(tag)
              );
              break;
            case 'replace':
            default:
              // Replace with new tags
              updatedTags = tags;
              break;
          }

          // Update the transaction
          const updated = await prisma.transaction.update({
            where: { id: transaction.id },
            data: { tags: updatedTags },
          });

          return {
            id: transaction.id,
            success: true,
            transaction: updated,
          };
        } catch (error) {
          console.error(`Error updating tags for transaction ${transaction.id}:`, error);
          return {
            id: transaction.id,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    return {
      results,
      successCount: results.filter((r) => r.success).length,
      failureCount: results.filter((r) => !r.success).length,
    };
  });

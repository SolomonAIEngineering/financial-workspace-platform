import { Prisma, prisma } from '@solomonai/prisma';

import { TRPCError } from '@trpc/server';
import { bulkUpdateTagsSchema } from '../schema';
import { protectedProcedure } from '../../../middlewares/procedures';
import { z } from 'zod';

/**
 * Updates tags for multiple transactions in bulk.
 * This handler verifies that all transactions belong to the authenticated user
 * before modifying their tags based on the specified operation.
 *
 * @param ctx - The context object containing the user's session information
 * @param input - The input object containing:
 *   - transactionIds: Array of transaction IDs to update
 *   - tags: Array of tags to add, remove, or replace
 *   - operation: The operation to perform on the tags (default: 'replace')
 *     - 'add': Adds the specified tags to existing tags without duplicates
 *     - 'remove': Removes the specified tags from existing tags
 *     - 'replace': Replaces all existing tags with the specified tags
 * @returns An object containing:
 *   - results: Array of results for each transaction update operation, including success status
 *   - successCount: Number of transactions successfully updated
 *   - failureCount: Number of transactions that failed to update
 * @throws {TRPCError} With code 'UNAUTHORIZED' if the user is not authenticated
 * @throws {TRPCError} With code 'BAD_REQUEST' if any transactions don't exist or don't belong to the user
 */
export const bulkUpdateTagsHandler = protectedProcedure
  .input(bulkUpdateTagsSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session?.userId;

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

    // Execute all operations in a transaction for atomicity
    const now = new Date();

    return await prisma.$transaction(async (tx) => {
      // First, get all current transactions with their tags
      const currentTransactions = await tx.transaction.findMany({
        where: {
          id: { in: transactionIds },
        },
        select: {
          id: true,
          tags: true,
        },
      });

      const existingIds = currentTransactions.map((tx) => tx.id);

      let updateResult: Prisma.BatchPayload | undefined;

      if (operation === 'add') {
        updateResult = await tx.transaction.updateMany({
          where: {
            id: { in: existingIds },
          },
          data: {
            tags: {
              push: tags,
            },
            lastModifiedAt: now,
          },
        });
      }

      if (operation === 'replace') {
        updateResult = await tx.transaction.updateMany({
          where: {
            id: { in: existingIds },
          },
          data: {
            tags: {
              set: tags,
            },
            lastModifiedAt: now,
          },
        });
      }

      if (operation === 'remove') {
        // First get current tags for each transaction
        const transactionsWithTags = await tx.transaction.findMany({
          where: { id: { in: existingIds } },
          select: {
            id: true,
            tags: true,
          },
        });

        // Update each transaction with filtered tags
        const updatePromises = transactionsWithTags.map(transaction =>
          tx.transaction.update({
            where: { id: transaction.id },
            data: {
              tags: (transaction.tags || []).filter(tag => !tags.includes(tag)),
              lastModifiedAt: now,
            },
          })
        );

        const results = await Promise.all(updatePromises);
        updateResult = { count: results.length };
      }

      // Get the updated transactions for the response
      const updatedTransactions = await tx.transaction.findMany({
        where: { id: { in: transactionIds } },
        select: {
          id: true,
          name: true,
          amount: true,
          date: true,
          tags: true,
        },
      });

      return {
        success: true,
        count: updateResult?.count ?? 0,
        updatedTransactions,
        timestamp: now,
      };
    });
  });

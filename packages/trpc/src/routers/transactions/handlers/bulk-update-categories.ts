import { TRPCError } from '@trpc/server';
import { bulkCategorizationSchema } from '../schema';
import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';

/**
 * Bulk updates the categories of multiple transactions.
 * This handler verifies that all transactions belong to the authenticated user
 * before updating their categories.
 *
 * @param ctx - The context object containing the user's session information
 * @param input - The input object containing:
 *   - transactionIds: Array of transaction IDs to update
 *   - category: The new category to assign
 *   - subCategory: Optional subcategory to assign
 *   - customCategory: Optional custom category to assign
 * @returns Object containing success status and count of updated transactions
 * @throws {TRPCError} With code 'BAD_REQUEST' if any transactions don't belong to the user
 */
export const bulkUpdateTransactionCategoriesHandler = protectedProcedure
    .input(bulkCategorizationSchema)
    .mutation(async ({ ctx, input }) => {
        const userId = ctx.session?.userId;

        const { transactionIds, category, subCategory, customCategory } = input;

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

        // Apply the update to all transactions at once
        const updateResult = await prisma.transaction.updateMany({
            where: {
                id: { in: transactionIds },
                userId,
            },
            data: {
                category,
                subCategory,
                customCategory,
            },
        });

        if (!updateResult) {
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to update transaction categories',
            });
        }

        return {
            success: true,
            updatedCount: updateResult.count,
            totalTransactions: transactionIds.length,
        };
    }); 
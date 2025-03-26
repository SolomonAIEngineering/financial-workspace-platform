import { TRPCError } from '@trpc/server';
import { manualCategorizationSchema } from '../schema';
import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';

/**
 * Manually categorizes multiple transactions with the same category.
 * This handler verifies that all transactions belong to the authenticated user
 * before updating their categories.
 *
 * @param ctx - The context object containing the user's session information
 * @param input - The input object containing:
 *   - transactionIds: Array of transaction IDs to categorize
 *   - category: The category to assign to all transactions
 *   - subCategory: Optional subcategory to assign
 *   - customCategory: Optional custom category to assign
 * @returns Object containing success status, count of updated transactions, and list of updated transaction IDs
 * @throws {TRPCError} With code 'FORBIDDEN' if any transactions don't belong to the user
 */
export const manualCategorizationHandler = protectedProcedure
    .input(manualCategorizationSchema)
    .mutation(async ({ ctx, input }) => {
        try {
            // Verify all transactions belong to user
            const existingTransactions = await prisma.transaction.findMany({
                where: {
                    id: { in: input.transactionIds },
                    userId: ctx.session?.userId,
                },
                select: { id: true },
            });

            const existingIds = existingTransactions.map((t) => t.id);

            if (existingIds.length !== input.transactionIds.length) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'One or more transactions not found or unauthorized',
                });
            }

            // Update all transactions with the new category
            const now = new Date();
            const result = await prisma.transaction.updateMany({
                where: {
                    id: { in: existingIds },
                },
                data: {
                    category: input.category,
                    subCategory: input.subCategory,
                    customCategory: input.customCategory,
                    lastCategorizedAt: now,
                    lastModifiedAt: now,
                },
            });

            return {
                success: true,
                count: result.count,
                updatedTransactions: existingIds,
            };
        } catch (error) {
            if (error instanceof TRPCError) {
                throw error;
            }

            console.error('Error in manualCategorization:', error);
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to categorize transactions',
                cause: error,
            });
        }
    }); 
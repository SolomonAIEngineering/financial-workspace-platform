import { TRPCError } from '@trpc/server';
import { assignTransactionSchema } from '../schema';
import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';

/**
 * DEPRECATED: Assigns a transaction to a specific user.
 * This endpoint is deprecated and will be removed in a future version.
 * Please use updateAssignedTo instead.
 *
 * @param ctx - The context object containing the user's session information
 * @param input - The input object containing:
 *   - id: Transaction ID to assign
 *   - assignedToUserId: ID of the user to assign transaction to
 *   - notifyUser: Boolean flag indicating whether to send notification to assigned user (default: false)
 * @returns The updated transaction
 * @throws {TRPCError} With code 'NOT_FOUND' if the transaction doesn't exist or doesn't belong to the user
 */
export const assignTransactionHandler = protectedProcedure
    .input(assignTransactionSchema)
    .mutation(async ({ ctx, input }) => {
        try {
            // Check if transaction exists and belongs to user
            const existingTransaction = await prisma.transaction.findUnique({
                where: { id: input.id },
                select: {
                    id: true,
                    userId: true,
                },
            });

            if (!existingTransaction || existingTransaction.userId !== ctx.session?.userId) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Transaction not found',
                });
            }

            // Update transaction with assignment
            const now = new Date();
            const updatedTransaction = await prisma.transaction.update({
                where: { id: input.id },
                data: {
                    assigneeId: input.assignedToUserId,
                    assignedAt: now,
                    lastModifiedAt: now,
                },
                select: {
                    id: true,
                    name: true,
                    amount: true,
                    date: true,
                    assigneeId: true,
                    assignedAt: true,
                },
            });

            // TODO: If notifyUser is true, send notification to assigned user
            if (input.notifyUser) {
                // Implement notification logic here or queue a background job
            }

            console.warn(
                'The assignTransaction endpoint is deprecated. Please use updateAssignedTo instead.'
            );

            return updatedTransaction;
        } catch (error) {
            if (error instanceof TRPCError) {
                throw error;
            }

            console.error('Error in assignTransaction:', error);
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to assign transaction',
                cause: error,
            });
        }
    }); 
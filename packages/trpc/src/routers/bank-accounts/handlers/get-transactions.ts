import { getTransactionsSchema, transactionsResponseSchema } from '../schema';

import { Prisma } from '@solomonai/prisma';
import { TRPCError } from '@trpc/server';
import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';
import { z } from 'zod';

/**
 * Protected procedure to retrieve transactions with filtering and pagination.
 * 
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Applies any provided filters (account, date range, categories, amount range, etc.)
 * 3. Fetches transactions with pagination based on offset and limit
 * 4. Returns transactions with pagination metadata
 * 
 * @input {object} getTransactionsSchema - The query parameters for filtering transactions
 *   - accountId: Optional filter by specific bank account
 *   - categories: Optional filter by specific transaction categories
 *   - startDate/endDate: Optional date range filters
 *   - isRecurring: Optional filter for recurring transactions
 *   - minAmount/maxAmount: Optional amount range filters
 *   - pending: Optional filter for pending status
 *   - search: Optional text search across name, merchantName, and description
 *   - offset/limit: Pagination parameters
 * 
 * @output {transactionsResponseSchema} - Paginated transaction results
 *   - hasMore: Whether more results exist beyond this page
 *   - totalCount: Total number of matching transactions
 *   - transactions: Array of transaction objects on the current page
 * 
 * @throws {TRPCError} INTERNAL_SERVER_ERROR - If there's an error fetching transactions
 * 
 * @returns Paginated transactions with metadata
 */
export const getTransactions = protectedProcedure
    .input(getTransactionsSchema)
    .output(transactionsResponseSchema)
    .query(async ({ ctx, input }) => {
        try {
            // Get the authenticated user ID
            const userId = ctx.session?.userId;

            // Build the where clause
            const where: Prisma.TransactionWhereInput = {
                userId,
            };

            // Filter by account if specified
            if (input.accountId) {
                where.bankAccountId = input.accountId;
            }

            // Date range filters
            if (input.startDate || input.endDate) {
                where.date = {};

                if (input.startDate) {
                    where.date.gte = input.startDate;
                }

                if (input.endDate) {
                    where.date.lte = input.endDate;
                }
            }

            // Category filters
            if (input.categories && input.categories.length > 0) {
                where.category = { in: input.categories };
            }

            // Recurring transaction filter
            if (input.isRecurring !== undefined) {
                where.isRecurring = input.isRecurring;
            }

            // Text search
            if (input.search && input.search.trim() !== '') {
                const searchTerm = input.search.trim();
                where.OR = [
                    { name: { contains: searchTerm, mode: 'insensitive' } },
                    { merchantName: { contains: searchTerm, mode: 'insensitive' } },
                    { description: { contains: searchTerm, mode: 'insensitive' } },
                ];
            }

            // Amount range filters
            if (input.minAmount !== undefined || input.maxAmount !== undefined) {
                where.amount = {};

                if (input.minAmount !== undefined) {
                    where.amount.gte = input.minAmount;
                }

                if (input.maxAmount !== undefined) {
                    where.amount.lte = input.maxAmount;
                }
            }

            // Pending filter
            if (input.pending !== undefined) {
                where.pending = input.pending;
            }

            // Get total count (for pagination)
            const totalCount = await prisma.transaction.count({ where });

            // Fetch transactions with pagination
            const transactions = await prisma.transaction.findMany({
                include: {
                    bankAccount: {
                        select: {
                            displayName: true,
                            mask: true,
                            name: true,
                        },
                    },
                },
                orderBy: {
                    date: 'desc',
                },
                skip: input.offset,
                take: input.limit,
                where,
            });

            const response = {
                hasMore: input.offset + transactions.length < totalCount,
                totalCount,
                transactions,
            };

            // Validate the response against our schema
            return transactionsResponseSchema.parse(response);
        } catch (error) {
            console.error('Error fetching transactions:', error);

            throw new TRPCError({
                cause: error,
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch transactions',
            });
        }
    }); 
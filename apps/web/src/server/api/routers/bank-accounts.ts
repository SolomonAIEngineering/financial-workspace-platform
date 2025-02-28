/**
 * TRPC Router for bank account connections
 * 
 * This router provides endpoints for creating Plaid link tokens, 
 * fetching connected bank accounts, disconnecting accounts, and managing transactions.
 */

import { TransactionCategory } from "@prisma/client";
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { client as triggerClient } from '@/jobs/client';
import { prisma } from '@/server/db';
import { createLinkToken, exchangePublicToken, getAccounts, removeItem } from '@/server/services/plaid';

import { protectedProcedure } from '../middlewares/procedures';
import { createRouter } from '../trpc';

export const bankAccountsRouter = createRouter({
    /**
     * Add an attachment to a transaction
     */
    addTransactionAttachment: protectedProcedure
        .input(
            z.object({
                fileSize: z.number(),
                fileType: z.string(),
                fileUrl: z.string(),
                name: z.string(),
                transactionId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            try {
                // Get the authenticated user ID
                const { userId } = ctx;

                // Ensure the transaction belongs to the user
                const transaction = await prisma.transaction.findFirst({
                    where: {
                        id: input.transactionId,
                        userId,
                    },
                });

                if (!transaction) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Transaction not found',
                    });
                }

                // Add the attachment
                const attachment = await prisma.attachment.create({
                    data: {
                        fileSize: input.fileSize,
                        fileType: input.fileType,
                        fileUrl: input.fileUrl,
                        name: input.name,
                        transactionId: input.transactionId,
                    },
                });

                return attachment;
            } catch (error) {
                console.error('Error adding attachment:', error);

                throw new TRPCError({
                    cause: error,
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to add attachment',
                });
            }
        }),

    /**
     * Create a Plaid link token for bank account connection
     */
    createLinkToken: protectedProcedure.mutation(async ({ ctx }) => {
        try {
            // Get the authenticated user ID
            const { userId } = ctx;

            // Use the Plaid service to create a link token
            const linkToken = await createLinkToken(userId);

            return linkToken;
        } catch (error) {
            console.error('Error creating link token:', error);

            throw new TRPCError({
                cause: error,
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to create link token',
            });
        }
    }),

    /**
     * Disconnect a bank account
     */
    disconnect: protectedProcedure
        .input(
            z.object({
                accountId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            try {
                // Get the authenticated user ID
                const { userId } = ctx;

                // Find the bank account and its connection
                const bankAccount = await prisma.bankAccount.findFirst({
                    include: {
                        bankConnection: true,
                    },
                    where: {
                        id: input.accountId,
                        userId,
                    },
                });

                if (!bankAccount) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Bank account not found',
                    });
                }

                // Check if this is the only account for this connection
                const accountCount = await prisma.bankAccount.count({
                    where: {
                        bankConnectionId: bankAccount.bankConnectionId,
                    },
                });

                if (accountCount === 1) {
                    // This is the only account, so remove the entire connection from Plaid
                    await removeItem(bankAccount.bankConnection.accessToken);

                    // Delete the connection (this will cascade delete the account)
                    await prisma.bankConnection.delete({
                        where: {
                            id: bankAccount.bankConnectionId,
                        },
                    });
                } else {
                    // Just delete this specific account
                    await prisma.bankAccount.delete({
                        where: {
                            id: input.accountId,
                        },
                    });
                }

                return { success: true };
            } catch (error) {
                console.error('Error disconnecting bank account:', error);

                throw new TRPCError({
                    cause: error,
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to disconnect bank account',
                });
            }
        }),

    /**
     * Exchange a public token for access token and store bank account info
     */
    exchangePublicToken: protectedProcedure
        .input(
            z.object({
                metadata: z.object({
                    accounts: z.array(
                        z.object({
                            id: z.string(),
                            mask: z.string().optional(),
                            name: z.string(),
                            subtype: z.string().optional(),
                            type: z.string(),
                        })
                    ),
                    institution: z.object({
                        institution_id: z.string(),
                        name: z.string(),
                    }),
                }),
                publicToken: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            try {
                // Get the authenticated user ID
                const { userId } = ctx;

                // Exchange the public token for an access token
                const { accessToken, itemId } = await exchangePublicToken(input.publicToken);

                // Get detailed account information from Plaid
                const plaidAccounts = await getAccounts(accessToken);

                // Get institution details
                const institutionId = input.metadata.institution.institution_id;
                const institutionName = input.metadata.institution.name;

                // Create a bank connection record in the database
                const bankConnection = await prisma.bankConnection.create({
                    data: {
                        accessToken, // Note: In production, this should be encrypted
                        accounts: {
                            create: plaidAccounts.map(account => ({
                                availableBalance: account.availableBalance,
                                currentBalance: account.currentBalance,
                                isoCurrencyCode: account.isoCurrencyCode,
                                limit: account.limit,
                                mask: account.mask,
                                name: account.name,
                                officialName: account.officialName,
                                plaidAccountId: account.plaidAccountId,
                                status: 'ACTIVE',
                                subtype: account.subtype,
                                type: account.type,
                                userId,
                            })),
                        },
                        institutionId,
                        institutionName,
                        itemId,
                        status: 'ACTIVE',
                        userId,
                    },
                });

                // Trigger an immediate transaction sync for this connection
                await triggerClient.sendEvent({
                    name: "manual-sync-transactions",
                    payload: { userId },
                });

                return { connectionId: bankConnection.id, success: true };
            } catch (error) {
                console.error('Error exchanging public token:', error);

                throw new TRPCError({
                    cause: error,
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to complete bank account connection',
                });
            }
        }),

    /**
     * Get all connected bank accounts for the current user
     */
    getAll: protectedProcedure.query(async ({ ctx }) => {
        try {
            // Get the authenticated user ID
            const { userId } = ctx;

            // Fetch bank accounts from the database
            const bankAccounts = await prisma.bankAccount.findMany({
                orderBy: {
                    createdAt: 'desc',
                },
                select: {
                    id: true,
                    availableBalance: true,
                    bankConnection: {
                        select: {
                            institutionName: true,
                            logo: true,
                            primaryColor: true,
                        },
                    },
                    createdAt: true,
                    currentBalance: true,
                    displayName: true,
                    isoCurrencyCode: true,
                    mask: true,
                    name: true,
                    subtype: true,
                    type: true,
                },
                where: {
                    deletedAt: null,
                    status: 'ACTIVE',
                    userId,
                },
            });

            // Format the accounts for the frontend
            return bankAccounts.map(account => ({
                id: account.id,
                availableBalance: account.availableBalance,
                connectedAt: account.createdAt,
                currentBalance: account.currentBalance,
                institution: account.bankConnection.institutionName,
                institutionColor: account.bankConnection.primaryColor,
                institutionLogo: account.bankConnection.logo,
                isoCurrencyCode: account.isoCurrencyCode || 'USD',
                mask: account.mask || '****',
                name: account.displayName || account.name,
                subtype: account.subtype || null,
                type: account.subtype || account.type,
            }));
        } catch (error) {
            console.error('Error fetching bank accounts:', error);

            throw new TRPCError({
                cause: error,
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch bank accounts',
            });
        }
    }),

    /**
     * Get transactions for a specific account
     */
    getTransactions: protectedProcedure
        .input(
            z.object({
                accountId: z.string().optional(),
                categories: z.array(z.nativeEnum(TransactionCategory)).optional(),
                endDate: z.date().optional(),
                isRecurring: z.boolean().optional(),
                limit: z.number().min(1).max(100).default(50),
                maxAmount: z.number().optional(),
                minAmount: z.number().optional(),
                offset: z.number().min(0).default(0),
                pending: z.boolean().optional(),
                search: z.string().optional(),
                startDate: z.date().optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            try {
                // Get the authenticated user ID
                const { userId } = ctx;

                // Build the where clause
                const where: any = {
                    userId,
                };

                // Filter by account if specified
                if (input.accountId) {
                    where.bankAccountId = input.accountId;
                }
                // Date range filters
                if (input.startDate) {
                    where.date = { ...where.date, gte: input.startDate };
                }
                if (input.endDate) {
                    where.date = { ...where.date, lte: input.endDate };
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
                if (input.minAmount !== undefined) {
                    where.amount = { ...where.amount, gte: input.minAmount };
                }
                if (input.maxAmount !== undefined) {
                    where.amount = { ...where.amount, lte: input.maxAmount };
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

                return {
                    hasMore: input.offset + transactions.length < totalCount,
                    totalCount,
                    transactions,
                };
            } catch (error) {
                console.error('Error fetching transactions:', error);

                throw new TRPCError({
                    cause: error,
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to fetch transactions',
                });
            }
        }),

    /**
     * Get transaction statistics
     */
    getTransactionStats: protectedProcedure
        .input(
            z.object({
                accountId: z.string().optional(),
                endDate: z.date().optional(),
                startDate: z.date().optional(),
            })
        )
        .query(async ({ ctx, input }) => {
            try {
                // Get the authenticated user ID
                const { userId } = ctx;

                // Build the where clause
                const where: any = {
                    userId,
                };

                // Filter by account if specified
                if (input.accountId) {
                    where.bankAccountId = input.accountId;
                }
                // Date range filters
                if (input.startDate) {
                    where.date = { ...where.date, gte: input.startDate };
                }
                if (input.endDate) {
                    where.date = { ...where.date, lte: input.endDate };
                }

                // Get income (negative amounts are income in Plaid)
                const income = await prisma.transaction.aggregate({
                    _sum: {
                        amount: true,
                    },
                    where: {
                        ...where,
                        amount: { lt: 0 },
                    },
                });

                // Get spending (positive amounts are spending in Plaid)
                const spending = await prisma.transaction.aggregate({
                    _sum: {
                        amount: true,
                    },
                    where: {
                        ...where,
                        amount: { gt: 0 },
                    },
                });

                // Get category breakdown for spending
                const categoryBreakdown = await prisma.transaction.groupBy({
                    _sum: {
                        amount: true,
                    },
                    by: ['category'],
                    where: {
                        ...where,
                        amount: { gt: 0 },
                        category: { not: null },
                    },
                });

                // Calculate monthly average spending
                const sixMonthsAgo = new Date();
                sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

                const monthlySpendings = await prisma.$queryRaw<{ month: number; total_amount: string; year: number; }[]>`
                    SELECT 
                        EXTRACT(MONTH FROM "date") as month,
                        EXTRACT(YEAR FROM "date") as year,
                        SUM(amount) as total_amount
                    FROM "Transaction"
                    WHERE amount > 0
                    AND "date" >= ${sixMonthsAgo}
                    AND "userId" = ${userId}
                    ${input.accountId ? prisma.$queryRaw`AND "bankAccountId" = ${input.accountId}` : prisma.$queryRaw``}
                    GROUP BY EXTRACT(MONTH FROM "date"), EXTRACT(YEAR FROM "date")
                `;

                const monthlyAvgSpending = monthlySpendings.length > 0
                    ? monthlySpendings.reduce((acc, curr) => acc + Number.parseFloat(curr.total_amount), 0) / monthlySpendings.length
                    : 0;

                return {
                    categoryBreakdown: categoryBreakdown.map(cat => ({
                        amount: cat._sum.amount || 0,
                        category: cat.category,
                        percentage: (cat._sum.amount || 0) / (spending._sum.amount || 1) * 100,
                    })),
                    income: Math.abs(income._sum.amount || 0),
                    monthlyAvgSpending,
                    netCashflow: Math.abs(income._sum.amount || 0) - (spending._sum.amount || 0),
                    spending: spending._sum.amount || 0,
                };
            } catch (error) {
                console.error('Error fetching transaction stats:', error);

                throw new TRPCError({
                    cause: error,
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to fetch transaction statistics',
                });
            }
        }),

    /**
     * Remove an attachment from a transaction
     */
    removeTransactionAttachment: protectedProcedure
        .input(
            z.object({
                attachmentId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            try {
                // Get the authenticated user ID
                const { userId } = ctx;

                // Ensure the attachment belongs to the user's transaction
                const attachment = await prisma.attachment.findFirst({
                    where: {
                        id: input.attachmentId,
                        transaction: {
                            userId,
                        },
                    },
                });

                if (!attachment) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Attachment not found',
                    });
                }

                // Delete the attachment
                await prisma.attachment.delete({
                    where: {
                        id: input.attachmentId,
                    },
                });

                return { success: true };
            } catch (error) {
                console.error('Error removing attachment:', error);

                throw new TRPCError({
                    cause: error,
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to remove attachment',
                });
            }
        }),

    /**
     * Update a transaction (for custom categorization, notes, etc.)
     */
    updateTransaction: protectedProcedure
        .input(
            z.object({
                category: z.nativeEnum(TransactionCategory).optional(),
                customCategory: z.string().optional(),
                excludeFromBudget: z.boolean().optional(),
                notes: z.string().optional(),
                tags: z.array(z.string()).optional(),
                transactionId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            try {
                // Get the authenticated user ID
                const { userId } = ctx;

                // Ensure the transaction belongs to the user
                const transaction = await prisma.transaction.findFirst({
                    where: {
                        id: input.transactionId,
                        userId,
                    },
                });

                if (!transaction) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Transaction not found',
                    });
                }

                // Update the transaction
                const updatedTransaction = await prisma.transaction.update({
                    data: {
                        category: input.category,
                        customCategory: input.customCategory,
                        excludeFromBudget: input.excludeFromBudget,
                        notes: input.notes,
                        tags: input.tags,
                    },
                    where: {
                        id: input.transactionId,
                    },
                });

                return updatedTransaction;
            } catch (error) {
                console.error('Error updating transaction:', error);

                throw new TRPCError({
                    cause: error,
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to update transaction',
                });
            }
        }),
}); 
/**
 * TRPC Router for bank account connections
 *
 * This router provides endpoints for creating Plaid link tokens, fetching
 * connected bank accounts, disconnecting accounts, and managing transactions.
 */

import {
  createLinkToken,
  exchangePublicToken,
  getAccounts,
  removeItem,
} from '@/server/services/plaid';

import { BankAccount } from '@/server/types/prisma';
import { TRPCError } from '@trpc/server';
import { TransactionCategory } from '@prisma/client';
import { createRouter } from '../trpc';
import { prisma } from '@/server/db';
import { protectedProcedure } from '../middlewares/procedures';
import { client as triggerClient } from '@/jobs/client';
import { z } from 'zod';

export const bankAccountsRouter = createRouter({
  /** Add an attachment to a transaction */
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

  /** Create a Plaid link token for bank account connection */
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

  /** Disconnect a bank account */
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

  /** Exchange a public token for access token and store bank account info */
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
        const { accessToken, itemId } = await exchangePublicToken(
          input.publicToken
        );

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
              create: plaidAccounts.map((account) => ({
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
          name: 'manual-sync-transactions',
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

  /** Get all connected bank accounts for the current user */
  getAll: protectedProcedure.query(async ({ ctx }): Promise<BankAccount[]> => {
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
      return bankAccounts as unknown as BankAccount[];
    } catch (error) {
      console.error('Error fetching bank accounts:', error);

      throw new TRPCError({
        cause: error,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch bank accounts',
      });
    }
  }),

  /** Get transactions for a specific account */
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

  /** Get a bank connection with all its associated accounts */
  getConnectionWithAccounts: protectedProcedure
    .input(z.object({ connectionId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const { userId } = ctx;
        const { connectionId } = input;

        // Use a type assertion to avoid type errors
        const connection = await prisma.bankConnection.findUnique({
          where: {
            id: connectionId,
            userId,
          },
          include: {
            accounts: true
          }
        });

        if (!connection) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Bank connection not found'
          });
        }

        // Transform to the shape expected by the frontend
        return {
          id: connection.id,
          name: connection.institutionName || 'Unknown Bank',
          logo: connection.logo,
          provider: connection.institutionId || 'unknown',
          status: connection.status,
          expires_at: null, // Use null for now
          accounts: connection.accounts.map(account => ({
            id: account.id,
            name: account.name || account.displayName || account.officialName || 'Unnamed Account',
            type: account.type,
            balance: account.availableBalance || account.currentBalance || 0,
            currency: account.isoCurrencyCode || 'USD',
            enabled: account.enabled
          }))
        } as any; // Use type assertion to bypass TypeScript checks
      } catch (error) {
        console.error('Error fetching bank connection with accounts:', error);

        throw new TRPCError({
          cause: error,
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch bank connection with accounts',
        });
      }
    }),

  /** Get transaction statistics */
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

        const monthlySpendings = await prisma.$queryRaw<
          { month: number; total_amount: string; year: number }[]
        >`
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

        const monthlyAvgSpending =
          monthlySpendings.length > 0
            ? monthlySpendings.reduce(
              (acc, curr) => acc + Number.parseFloat(curr.total_amount),
              0
            ) / monthlySpendings.length
            : 0;

        return {
          categoryBreakdown: categoryBreakdown.map((cat) => ({
            amount: cat._sum.amount || 0,
            category: cat.category,
            percentage:
              ((cat._sum.amount || 0) / (spending._sum.amount || 1)) * 100,
          })),
          income: Math.abs(income._sum.amount || 0),
          monthlyAvgSpending,
          netCashflow:
            Math.abs(income._sum.amount || 0) - (spending._sum.amount || 0),
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

  /** Remove an attachment from a transaction */
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

  /** Update a transaction (for custom categorization, notes, etc.) */
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

  /** Get all bank accounts for a specific team */
  getTeamBankAccounts: protectedProcedure
    .input(
      z.object({
        teamId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Get the authenticated user ID
        const { userId } = ctx;

        // First, find the user's teams
        const userTeams = await prisma.usersOnTeam.findMany({
          where: {
            userId,
            ...(input.teamId ? { teamId: input.teamId } : {}),
          },
          include: {
            team: true,
          },
        });

        if (userTeams.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Team not found or you do not have access',
          });
        }

        // Get the first team or the specific requested team
        const teamId = input.teamId || userTeams[0].teamId;

        // Mock response for development - in a real implementation you would query Prisma
        // This shows the structure of the expected response
        const mockAccounts = [
          {
            id: '1',
            name: 'Checking Account',
            type: 'CHECKING',
            balance: 2500,
            currency: 'USD',
            enabled: true,
            manual: false,
            bank: {
              id: 'bank1',
              name: 'Chase Bank',
              logo: 'https://placehold.co/50x50?text=Chase',
              provider: 'plaid',
              status: 'active',
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days in the future
            }
          },
          {
            id: '2',
            name: 'Savings Account',
            type: 'SAVINGS',
            currency: 'USD',
            balance: 100_000,
            enabled: true,
            manual: false,
            bank: {
              id: 'bank1',
              name: 'Chase Bank',
              logo: 'https://placehold.co/50x50?text=Chase',
              provider: 'plaid',
              status: 'active',
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            }
          },
          {
            id: '3',
            name: 'Business Checking',
            type: 'CHECKING',
            balance: 5000,
            currency: 'USD',
            enabled: true,
            manual: false,
            bank: {
              id: 'bank2',
              name: 'Bank of America',
              logo: 'https://placehold.co/50x50?text=BoA',
              provider: 'plaid',
              status: 'requires_attention',
              expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days in the future
            }
          },
          {
            id: '4',
            name: 'Manual Business Account',
            type: 'CHECKING',
            balance: 7500,
            currency: 'USD',
            enabled: true,
            manual: true,
            bank: null
          }
        ];

        // For now, just return mock data
        // In a real implementation, you would query the database and format the response
        return mockAccounts;

        /* Real implementation - commented out until database schema is updated
        // Fetch bank accounts associated with this team
        const connectedAccounts = await prisma.bankAccount.findMany({
          where: {
            Team: {
              some: {
                id: teamId,
              },
            },
            deletedAt: null, 
            status: 'ACTIVE',
            bankConnectionId: { not: null }, // Proper way to check for non-null values
          },
          include: {
            bankConnection: true, // Include all bankConnection fields
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        // Format the accounts for the frontend
        const formattedAccounts = connectedAccounts.map((account) => {
          return {
            id: account.id,
            name: account.displayName || account.name,
            type: account.type,
            balance: account.currentBalance || 0,
            currency: account.isoCurrencyCode || 'USD',
            enabled: account.enabled,
            manual: false,
            bank: {
              id: account.bankConnectionId,
              name: account.bankConnection.institutionName,
              logo: account.bankConnection.logo || null,
              provider: 'plaid', // Could be extended to support other providers
              status: account.bankConnection.status,
              expires_at: account.bankConnection.consentExpiresAt,
            },
          };
        });

        // Fetch manual accounts for this team (if any)
        const manualAccounts = await prisma.bankAccount.findMany({
          where: {
            Team: {
              some: {
                id: teamId,
              },
            },
            deletedAt: null,
            status: 'ACTIVE',
            bankConnectionId: { equals: null }, // Proper way to check for null values
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        // Format manual accounts
        const formattedManualAccounts = manualAccounts.map((account) => {
          return {
            id: account.id,
            name: account.displayName || account.name,
            type: account.type,
            balance: account.currentBalance || 0,
            currency: account.isoCurrencyCode || 'USD',
            enabled: account.enabled,
            manual: true,
            bank: null,
          };
        });

        // Combine all accounts
        return [...formattedAccounts, ...formattedManualAccounts];
        */
      } catch (error) {
        console.error('Error fetching team bank accounts:', error);

        throw new TRPCError({
          cause: error,
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch team bank accounts',
        });
      }
    }),
});

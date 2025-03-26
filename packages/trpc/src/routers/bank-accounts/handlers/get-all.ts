import { AccountStatus, prisma } from '@solomonai/prisma';

import { TRPCError } from '@trpc/server';
import { bankAccountResponseSchema } from '../schema';
import { protectedProcedure } from '../../../middlewares/procedures';
import { z } from 'zod';

/**
 * Protected procedure to retrieve all bank accounts for the authenticated user.
 * 
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Fetches all active bank accounts for the user
 * 3. Returns formatted account data with relevant information
 * 
 * No input parameters are required for this query.
 * 
 * @output {Array<bankAccountResponseSchema>} - Array of bank account objects
 * 
 * @throws {TRPCError} INTERNAL_SERVER_ERROR - If there's an error fetching the accounts
 * 
 * @returns An array of bank account objects with account details and connection information
 */
export const getAll = protectedProcedure
    .output(z.array(bankAccountResponseSchema))
    .query(async ({ ctx }) => {
        try {
            // Get the authenticated user ID
            const userId = ctx.session?.userId;

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
                    status: AccountStatus.ACTIVE,
                    userId,
                },
            });

            // Map and validate the data against our schema
            const validatedAccounts = bankAccounts.map(account => {
                // Ensure all fields conform to our schema
                return {
                    id: account.id,
                    availableBalance: account.availableBalance,
                    bankConnection: {
                        institutionName: account.bankConnection.institutionName,
                        logo: account.bankConnection.logo,
                        primaryColor: account.bankConnection.primaryColor,
                    },
                    createdAt: account.createdAt,
                    currentBalance: account.currentBalance,
                    displayName: account.displayName,
                    isoCurrencyCode: account.isoCurrencyCode,
                    mask: account.mask,
                    name: account.name,
                    subtype: account.subtype,
                    type: account.type,
                };
            });

            // Parse through our schema to ensure type safety
            return z.array(bankAccountResponseSchema).parse(validatedAccounts);
        } catch (error) {
            console.error('Error fetching bank accounts:', error);

            throw new TRPCError({
                cause: error,
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch bank accounts',
            });
        }
    }); 
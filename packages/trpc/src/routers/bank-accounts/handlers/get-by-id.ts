import { bankAccountResponseSchema, getByIdSchema } from '../schema';

import { AccountStatus } from '@solomonai/prisma';
import { TRPCError } from '@trpc/server';
import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';
import { z } from 'zod';

/**
 * Protected procedure to retrieve a specific bank account by ID for the authenticated user.
 * 
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Validates the input ID parameter
 * 3. Fetches the bank account that matches the ID and belongs to the user
 * 4. Returns formatted account data with relevant information
 * 
 * @input {object} getByIdSchema - The input parameter schema
 *   - id: The unique identifier of the bank account to retrieve
 * 
 * @output {bankAccountResponseSchema} - A single bank account object
 * 
 * @throws {TRPCError} NOT_FOUND - If the bank account doesn't exist or doesn't belong to the user
 * @throws {TRPCError} INTERNAL_SERVER_ERROR - If there's an error fetching the account
 * 
 * @returns A bank account object with account details and connection information
 */
export const getById = protectedProcedure
    .input(getByIdSchema)
    .output(bankAccountResponseSchema)
    .query(async ({ ctx, input }) => {
        try {
            // Get the authenticated user ID
            const userId = ctx.session?.userId;

            // Fetch the bank account from the database
            const bankAccount = await prisma.bankAccount.findFirst({
                where: {
                    id: input.id,
                    userId,
                    deletedAt: null,
                    status: AccountStatus.ACTIVE,
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
            });

            if (!bankAccount) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Bank account not found',
                });
            }

            // Map and validate the data against our schema
            const validatedAccount = {
                id: bankAccount.id,
                availableBalance: bankAccount.availableBalance,
                bankConnection: {
                    institutionName: bankAccount.bankConnection.institutionName,
                    logo: bankAccount.bankConnection.logo,
                    primaryColor: bankAccount.bankConnection.primaryColor,
                },
                createdAt: bankAccount.createdAt,
                currentBalance: bankAccount.currentBalance,
                displayName: bankAccount.displayName,
                isoCurrencyCode: bankAccount.isoCurrencyCode,
                mask: bankAccount.mask,
                name: bankAccount.name,
                subtype: bankAccount.subtype,
                type: bankAccount.type,
            };

            // Parse through our schema to ensure type safety
            return bankAccountResponseSchema.parse(validatedAccount);
        } catch (error) {
            console.error('Error fetching bank account:', error);

            throw new TRPCError({
                cause: error,
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch bank account',
            });
        }
    }); 
import { connectionWithAccountsResponseSchema, getConnectionWithAccountsSchema } from '../schema';

import { TRPCError } from '@trpc/server';
import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';

/**
 * Protected procedure to retrieve a bank connection with its associated accounts.
 * 
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Validates the input connection ID
 * 3. Fetches the bank connection with all of its accounts
 * 4. Transforms the data into a standardized format for the frontend
 * 
 * @input {object} getConnectionWithAccountsSchema - The input parameters
 *   - connectionId: Unique identifier of the bank connection to retrieve
 * 
 * @output {connectionWithAccountsResponseSchema} - The connection with its accounts
 * 
 * @throws {TRPCError} NOT_FOUND - If the connection doesn't exist or doesn't belong to the user
 * @throws {TRPCError} INTERNAL_SERVER_ERROR - If there's an error fetching the connection
 * 
 * @returns The bank connection with its associated accounts in a standardized format
 */
export const getConnectionWithAccounts = protectedProcedure
    .input(getConnectionWithAccountsSchema)
    .output(connectionWithAccountsResponseSchema)
    .query(async ({ ctx, input }) => {
        try {
            const userId = ctx.session?.userId;
            const { connectionId } = input;

            // Fetch connection with its accounts
            const connection = await prisma.bankConnection.findUnique({
                where: {
                    id: connectionId,
                    userId,
                },
                include: {
                    accounts: true,
                },
            });

            if (!connection) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Bank connection not found',
                });
            }

            // Transform to the shape expected by the frontend
            const formattedResponse = {
                id: connection.id,
                name: connection.institutionName || 'Unknown Bank',
                logo: connection.logo,
                provider: connection.institutionId || 'unknown',
                status: connection.status,
                expires_at: null, // Use null for now
                accounts: connection.accounts.map((account) => ({
                    id: account.id,
                    name:
                        account.name ||
                        account.displayName ||
                        account.officialName ||
                        'Unnamed Account',
                    type: account.type,
                    balance: account.availableBalance || account.currentBalance || 0,
                    currency: account.isoCurrencyCode || 'USD',
                    enabled: account.enabled,
                })),
            };

            // Validate the response against our schema
            return connectionWithAccountsResponseSchema.parse(formattedResponse);
        } catch (error) {
            console.error('Error fetching bank connection with accounts:', error);

            throw new TRPCError({
                cause: error,
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch bank connection with accounts',
            });
        }
    }); 
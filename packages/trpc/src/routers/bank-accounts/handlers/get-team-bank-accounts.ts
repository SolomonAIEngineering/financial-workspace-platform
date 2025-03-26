import { AccountStatus, Prisma } from '@solomonai/prisma';
import { getTeamBankAccountsSchema, teamBankAccountResponseSchema } from '../schema';

import { TRPCError } from '@trpc/server';
import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../../middlewares/procedures';
import { z } from 'zod';

/**
 * Protected procedure to retrieve bank accounts associated with a user's team.
 * 
 * This procedure:
 * 1. Verifies the user is authenticated via the protected procedure middleware
 * 2. Finds the teams the user belongs to (either all teams or a specific team if teamId is provided)
 * 3. Fetches all active bank accounts associated with the selected team
 * 4. Transforms the data into a standardized format for the frontend
 * 
 * @input {object} getTeamBankAccountsSchema - The input parameters
 *   - teamId: Optional unique identifier of a specific team to fetch accounts for
 *             If not provided, the first team the user belongs to is used
 * 
 * @output {Array<teamBankAccountResponseSchema>} - Array of team bank account objects
 * 
 * @throws {TRPCError} NOT_FOUND - If the team doesn't exist or the user doesn't have access
 * @throws {TRPCError} INTERNAL_SERVER_ERROR - If there's an error fetching the accounts
 * 
 * @returns An array of bank accounts associated with the team in a standardized format
 */
export const getTeamBankAccounts = protectedProcedure
    .input(getTeamBankAccountsSchema)
    .output(z.array(teamBankAccountResponseSchema))
    .query(async ({ ctx, input }) => {
        try {
            // Get the authenticated user ID
            const userId = ctx.session?.userId;

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

            // Define the where clause with proper Prisma types
            const where: Prisma.BankAccountWhereInput = {
                Team: {
                    some: {
                        id: teamId,
                    },
                },
                deletedAt: null,
                status: AccountStatus.ACTIVE,
            };

            // Fetch all bank accounts associated with this team
            const allAccounts = await prisma.bankAccount.findMany({
                where,
                include: {
                    bankConnection: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            // Process the accounts into the expected format for the frontend
            const processedAccounts = allAccounts.map((account) => {
                const isManual = !account.bankConnectionId || !account.bankConnection;

                return {
                    id: account.id,
                    name: account.displayName || account.name,
                    type: account.type,
                    balance: account.currentBalance || 0,
                    currency: account.isoCurrencyCode || 'USD',
                    enabled: account.enabled,
                    manual: isManual,
                    bank: isManual
                        ? null
                        : {
                            id: account.bankConnectionId,
                            name:
                                account.bankConnection?.institutionName || 'Unknown Bank',
                            logo: account.bankConnection?.logo || null,
                            provider: account.bankConnection?.provider || 'unknown',
                            status: account.bankConnection?.status || 'ACTIVE',
                            expires_at: account.bankConnection?.consentExpiresAt || null,
                        },
                };
            });

            // Validate the response against our schema
            return z.array(teamBankAccountResponseSchema).parse(processedAccounts);
        } catch (error) {
            console.error('Error fetching team bank accounts:', error);

            throw new TRPCError({
                cause: error,
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to fetch team bank accounts',
            });
        }
    }); 
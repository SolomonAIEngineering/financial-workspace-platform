import { CreateBankConnectionSchema } from './schema';
import { TRPCError } from '@trpc/server';
import { createRouter } from '../../trpc';
import { prisma } from '@solomonai/prisma/server';
import { protectedProcedure } from '../../middlewares/procedures';

/**
 * Maps the account type from the schema format to the Prisma AccountType enum
 */
function mapAccountType(type: 'credit' | 'depository' | 'other_asset' | 'loan' | 'other_liability'): any {
  const typeMap: Record<string, string> = {
    'credit': 'CREDIT',
    'depository': 'DEPOSITORY',
    'other_asset': 'OTHER_ASSET',
    'loan': 'LOAN',
    'other_liability': 'OTHER_LIABILITY'
  };

  return typeMap[type] || 'OTHER';
}

/**
 * Create a bank connection
 *
 * @param ctx
 * @param input
 * @returns
 */
export const bankConnectionRouter = createRouter({
  createBankConnection: protectedProcedure
    .input(CreateBankConnectionSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const {
          teamId,
          institutionId,
          accessToken,
          itemId,
          userId,
          accounts,
          provider,
        } = input;

        // Validate all required fields have values
        if (!teamId || !userId || !provider) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Missing required fields: teamId, userId, provider',
          });
        }

        // Make sure itemId or accessToken exists
        if (!itemId && !accessToken) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Either itemId or accessToken is required',
          });
        }

        // check if the accounts list is empty or invalid
        if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'No accounts found',
          });
        }

        // get the first account to create a bank connectionn
        const account = accounts[0];
        if (!account) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'No accounts found',
          });
        }

        // Validate the first account has all required fields
        if (!account.bank_name || !account.account_id || account.enabled === undefined) {
          console.error('[createBankConnection] Invalid account data:', JSON.stringify(account));
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid account data. Missing required fields.',
          });
        }

        // make sure the team exists
        const team = await prisma.team.findUnique({
          where: {
            id: teamId,
          },
        });

        if (!team) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Team not found',
          });
        }

        // Prepare upsert data for bank connection with null checks
        const updateData = {
          accessToken: accessToken || '',
          provider: provider,
          institutionName: account.bank_name,
          logo: account.logo_url || null,
          expiresAt: account.expires_at || null,
          status: 'ACTIVE' as const,
        };

        const createData = {
          institutionId: institutionId || '',
          institutionName: account.bank_name,
          logo: account.logo_url || null,
          provider: provider,
          accessToken: accessToken || '',
          itemId: itemId || '',
          userId: userId,
          status: 'ACTIVE' as const,
          team: {
            connect: [{ id: teamId }],
          },
        };

        // create the bank connection
        const bankConnection = await prisma.bankConnection.upsert({
          where: {
            itemId: itemId || '', // Ensure not null
          },
          update: updateData,
          create: createData,
        });


        // Filter out accounts without IDs first to avoid null promises
        const validAccounts = accounts.filter(acc => !!acc.account_id);

        if (validAccounts.length === 0) {
          console.warn('[createBankConnection] No valid accounts found with account_id');
          return { connectionId: bankConnection.id, success: true };
        }

        const accountPromises = validAccounts.map(async (acc) => {
          try {
            // Ensure all required fields have values or defaults
            const bankAccount = await prisma.bankAccount.upsert({
              where: {
                userId_plaidAccountId: {
                  userId: userId,
                  plaidAccountId: acc.account_id,
                },
              },
              update: {
                name: acc.name || 'Unnamed Account',
                isoCurrencyCode: acc.currency || 'USD',
                enabled: acc.enabled,
                type: mapAccountType(acc.type),
                balance: acc.balance ?? 0,
              },
              create: {
                userId: userId,
                plaidAccountId: acc.account_id,
                bankConnectionId: bankConnection.id,
                name: acc.name || 'Unnamed Account',
                isoCurrencyCode: acc.currency || 'USD',
                createdAt: new Date(),
                enabled: acc.enabled,
                type: mapAccountType(acc.type),
                balance: acc.balance ?? 0,
                Team: {
                  connect: [{ id: teamId }],
                },
              },
            });
            return bankAccount;
          } catch (err) {
            console.error('[createBankConnection] Error creating/updating bank account:', err);
            throw err; // Rethrow to be caught by the main try/catch
          }
        });

        await Promise.all(accountPromises);

        return { connectionId: bankConnection.id, success: true };
      } catch (error) {
        console.error('[createBankConnection] Error:', error);

        // If it's already a TRPCError, rethrow it
        if (error instanceof TRPCError) {
          throw error;
        }

        // Otherwise, determine the error type and provide a more specific error message
        let message = 'Failed to create bank connection';
        let code: TRPCError['code'] = 'INTERNAL_SERVER_ERROR';

        if (error instanceof Error) {
          message = error.message || 'Unknown error occurred';

          // Map error messages to appropriate TRPC error codes
          if (error.message.includes('No accounts found')) {
            code = 'BAD_REQUEST';
          } else if (error.message.includes('Team not found')) {
            code = 'NOT_FOUND';
          } else if (error.message.includes('foreign key constraint')) {
            code = 'BAD_REQUEST';
            message = 'Invalid relationship between records';
          } else if (error.message.includes('unique constraint')) {
            code = 'CONFLICT';
            message = 'Record already exists';
          } else if (error.message.includes('argument must be of type object')) {
            code = 'INTERNAL_SERVER_ERROR';
            message = 'Invalid data format provided';
            console.error('[createBankConnection] Data format error:', error.stack || error);
          }
        }

        // Use proper TRPC error - ensure message is not null
        throw new TRPCError({
          code,
          message: message || 'Unknown error',
          cause: error,
        });
      }
    }),
});


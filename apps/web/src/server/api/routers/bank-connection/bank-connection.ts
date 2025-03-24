import { CreateBankConnectionSchema } from './schema';
import { createRouter } from '../../trpc';
import { prisma } from '@solomonai/prisma';
import { protectedProcedure } from '../../middlewares/procedures';

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
      const {
        teamId,
        institutionId,
        accessToken,
        itemId,
        userId,
        accounts,
        provider,
      } = input;

      // check if the accounts list is empty
      if (accounts.length === 0 || !accounts) {
        throw new Error('No accounts found');
      }

      // get the first account to create a bank connectionn
      const account = accounts[0];
      if (!account) {
        throw new Error('No accounts found');
      }

      // make sure the team exists
      const team = await prisma.team.findUnique({
        where: {
          id: teamId,
        },
      });

      if (!team) {
        throw new Error('Team not found');
      }

      // create the bank connection
      const bankConnection = await prisma.bankConnection.upsert({
        where: {
          itemId: itemId,
        },
        update: {
          accessToken: accessToken,
          provider: provider,
          institutionName: account.bank_name,
          logo: account.logo_url,
          expiresAt: account.expires_at,
          status: 'ACTIVE',
        },
        create: {
          institutionId: institutionId,
          institutionName: account.bank_name,
          logo: account.logo_url,
          provider: provider,
          accessToken: accessToken,
          itemId: itemId,
          userId: userId,
          status: 'ACTIVE',
          team: {
            connect: [{ id: teamId }],
          },
        },
      });

      // create the bank accounts
      await Promise.all(
        accounts.map(async (acc) => {
          return prisma.bankAccount.upsert({
            where: {
              userId_plaidAccountId: {
                userId: userId,
                plaidAccountId: acc.account_id,
              },
            },
            update: {
              name: acc.name,
              isoCurrencyCode: acc.currency,
              enabled: acc.enabled,
              type: acc.type as any, // Cast to handle the enum type
              balance: acc.balance ?? 0,
              Team: {
                connect: [{ id: teamId }],
              },
            },
            create: {
              userId: userId,
              plaidAccountId: acc.account_id,
              bankConnectionId: bankConnection.id,
              name: acc.name,
              isoCurrencyCode: acc.currency,
              createdAt: new Date(),
              enabled: acc.enabled,
              type: acc.type as any, // Cast to handle the enum type
              balance: acc.balance ?? 0,
              Team: {
                connect: [{ id: teamId }],
              },
            },
          });
        })
      );

      return { connectionId: bankConnection.id, success: true };
    }),
});

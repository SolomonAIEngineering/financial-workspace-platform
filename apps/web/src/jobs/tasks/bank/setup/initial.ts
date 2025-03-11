import {
  type BankAccount,
  AccountStatus,
  AccountType,
  BankConnectionStatus,
} from '@prisma/client';
import { eventTrigger } from '@trigger.dev/sdk';

import { prisma } from '@/server/db';
import { getAccounts, getInstitutionById } from '@/server/services/plaid';

import { client } from '../../../client';
import { BANK_JOBS } from '../../constants';

/**
 * This job handles the complete initial setup process when a user connects a
 * financial institution through Plaid Link or similar services.
 *
 * Key responsibilities:
 *
 * - Fetches institution details from Plaid (name, logo, colors)
 * - Creates a bank connection record in the database
 * - Retrieves all available accounts from the external provider
 * - Creates bank account records for each connected account
 * - Triggers staggered initial sync jobs for all accounts (with delays to avoid
 *   rate limits)
 * - Records the connection activity in the user history
 *
 * This job is a critical part of the user onboarding flow for financial data
 * integration, converting raw Plaid credentials into structured data in our
 * system.
 *
 * @file Bank Connection Initial Setup Job
 * @example
 *   // Trigger the initial setup job after Plaid Link success:
 *   await client.sendEvent({
 *     name: 'initial-setup',
 *     payload: {
 *       userId: 'user_123abc',
 *       accessToken: 'access-token-from-plaid',
 *       itemId: 'item-id-from-plaid',
 *       institutionId: 'ins_123456',
 *       publicToken: 'public-token-from-plaid',
 *     },
 *   });
 *
 * @example
 *   // The job returns a summary on success:
 *   {
 *   status: "success",
 *   bankConnectionId: "conn_abc123",
 *   accountCount: 5
 *   }
 */
export const initialSetupJob = client.defineJob({
  id: BANK_JOBS.INITIAL_SETUP,
  name: 'Initial Bank Connection Setup',
  trigger: eventTrigger({
    name: 'initial-setup',
  }),
  version: '1.0.0',
  /**
   * Main job execution function that sets up a new bank connection
   *
   * @param payload - The job payload containing connection details
   * @param payload.accessToken - The access token received from Plaid or other
   *   provider
   * @param payload.institutionId - The ID of the financial institution
   * @param payload.itemId - The item ID from Plaid
   * @param payload.publicToken - The public token from Plaid (may be used for
   *   token exchange)
   * @param payload.userId - The ID of the user who owns this connection
   * @param io - The I/O context provided by Trigger.dev for logging, running
   *   tasks, etc.
   * @returns A result object containing the connection ID, account count, and
   *   status
   * @throws Error if any part of the setup process fails
   */
  run: async (payload, io) => {
    const { accessToken, institutionId, itemId, publicToken, userId } = payload;

    await io.logger.info(
      `Starting initial setup for institution ${institutionId}`
    );

    try {
      // Get institution details
      const institution = await io.runTask('get-institution', async () => {
        return await getInstitutionById(institutionId);
      });

      // Create the bank connection record
      const bankConnection = await io.runTask(
        'create-bank-connection',
        async () => {
          return await prisma.bankConnection.create({
            data: {
              accessToken,
              createdAt: new Date(),
              institutionId,
              institutionName: institution.name,
              itemId, // Required field
              lastSyncedAt: new Date(),
              logo: institution.logo,
              primaryColor: institution.primaryColor,
              status: BankConnectionStatus.ACTIVE,
              updatedAt: new Date(),
              userId,
            },
          });
        }
      );

      // Get accounts from Plaid
      const plaidAccounts = await io.runTask('get-plaid-accounts', async () => {
        return await getAccounts(accessToken);
      });

      await io.logger.info(`Found ${plaidAccounts.length} accounts`);

      // Create bank accounts
      let bankAccounts: BankAccount[] = [];

      await io.runTask(
        'create-bank-accounts',
        async (task, io) => {
          // Properly type the accounts array
          const accounts: BankAccount[] = [];

          for (const plaidAccount of plaidAccounts) {
            const account = await prisma.bankAccount.create({
              data: {
                availableBalance: plaidAccount.availableBalance,
                bankConnectionId: bankConnection.id,
                createdAt: new Date(),
                currentBalance: plaidAccount.currentBalance,
                enabled: true,
                isoCurrencyCode: plaidAccount.isoCurrencyCode,
                limit: plaidAccount.limit,
                mask: plaidAccount.mask,
                name: plaidAccount.name,
                officialName: plaidAccount.officialName,
                plaidAccountId: plaidAccount.plaidAccountId,
                status: AccountStatus.ACTIVE,
                subtype: plaidAccount.subtype,
                type: mapPlaidAccountType(
                  plaidAccount.type,
                  plaidAccount.subtype
                ),
                updatedAt: new Date(),
                userId,
              },
            });
            accounts.push(account);
          }

          bankAccounts = accounts;
          return { success: true };
        }
      );

      await io.logger.info(`Created ${bankAccounts.length} bank accounts`);

      // Trigger initial account and transaction syncs
      // We stagger these to avoid hitting rate limits
      let delayCounter = 0;

      for (const account of bankAccounts) {
        // Trigger a complete sync for each account (delays increasing by 5 seconds)
        await client.sendEvent({
          // Add a context with delay information instead of using delay property
          context: {
            delaySeconds: delayCounter * 5,
          },
          name: 'sync-account-trigger',
          payload: {
            accessToken,
            bankAccountId: account.id,
            manualSync: true, // Force sync even for accounts that might have issues
            userId,
          },
        });
        delayCounter++;
      }

      // Record this activity
      await prisma.userActivity.create({
        data: {
          detail: `Connected ${institution.name} with ${bankAccounts.length} accounts`,
          metadata: {
            accountCount: bankAccounts.length,
            bankConnectionId: bankConnection.id,
          },
          type: 'ACCOUNT_CONNECTED',
          userId,
        },
      });

      await io.logger.info(`Initial setup completed for ${institution.name}`);

      return {
        accountCount: bankAccounts.length,
        bankConnectionId: bankConnection.id,
        status: 'success',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      await io.logger.error(`Initial setup failed: ${errorMessage}`);

      // If we have created a bank connection, update its status
      if (institutionId) {
        const existingConnection = await prisma.bankConnection.findFirst({
          orderBy: {
            createdAt: 'desc',
          },
          where: {
            institutionId,
            userId,
          },
        });

        if (existingConnection) {
          await prisma.bankConnection.update({
            data: {
              errorMessage: errorMessage,
              status: BankConnectionStatus.ERROR,
            },
            where: { id: existingConnection.id },
          });
        }
      }

      throw error;
    }
  },
});

/**
 * Maps Plaid account types to internal AccountType enum values
 *
 * @param type - The account type string from Plaid (e.g., 'depository',
 *   'credit')
 * @param subtype - Optional account subtype from Plaid (e.g., 'checking',
 *   'savings')
 * @returns The appropriate AccountType enum value for our database
 */
function mapPlaidAccountType(type: string, subtype?: string): AccountType {
  if (type === 'depository') {
    if (subtype === 'checking') return AccountType.DEPOSITORY;
    if (subtype === 'savings') return AccountType.DEPOSITORY;

    return AccountType.DEPOSITORY;
  }
  if (type === 'credit') return AccountType.CREDIT;
  if (type === 'loan') return AccountType.LOAN;
  if (type === 'investment') return AccountType.INVESTMENT;

  return AccountType.OTHER;
}

import {
  AccountStatus,
  AccountType,
  BankConnectionStatus,
} from '@prisma/client';

import { BANK_JOBS } from '../../constants';
import { client } from '../../../client';
import { eventTrigger } from '@trigger.dev/sdk';
import { getAccounts } from '@/server/services/plaid';
import { prisma } from '@/server/db';

/**
 * This job synchronizes data for a specific bank account with the latest
 * information from Plaid or another financial data provider. It updates
 * critical account information such as:
 *
 * - Current and available balances
 * - Account name and mask
 * - Account status and type
 * - Currency and limit information
 *
 * The job can be triggered automatically as part of a scheduled sync, manually
 * by the user, or as part of a connection-wide synchronization process.
 *
 * When run with the `manualSync` flag, it will also trigger a transaction sync
 * to ensure complete data freshness.
 *
 * @file Bank Account Data Synchronization Job
 * @example
 *   // Trigger an account sync
 *   await client.sendEvent({
 *     name: 'sync-account',
 *     payload: {
 *       bankAccountId: 'acct_123abc',
 *       accessToken: 'access-token-from-provider',
 *       userId: 'user_456def',
 *       manualSync: false, // Optional, defaults to false
 *     },
 *   });
 *
 * @example
 *   // The job returns different results based on the outcome:
 *
 *   // Successful sync:
 *   {
 *   status: "success",
 *   accountId: "acct_123abc",
 *   balance: {
 *   available: 1250.75,
 *   current: 1350.25
 *   }
 *   }
 *
 *   // Account skipped:
 *   {
 *   status: "skipped",
 *   reason: "Account not active"
 *   }
 */
export const syncAccountJob = client.defineJob({
  id: BANK_JOBS.SYNC_ACCOUNT,
  name: 'Sync Bank Account',
  trigger: eventTrigger({
    name: 'sync-account',
  }),
  version: '1.0.0',
  /**
   * Main job execution function that syncs a bank account's data
   *
   * @param payload - The job payload containing account details
   * @param payload.accessToken - The access token for the financial data
   *   provider
   * @param payload.bankAccountId - The ID of the bank account to sync
   * @param payload.manualSync - Whether this is a manual sync initiated by the
   *   user
   * @param payload.userId - The ID of the user who owns the account
   * @param io - The I/O context provided by Trigger.dev for logging, running
   *   tasks, etc.
   * @returns A result object containing the account ID, balance information,
   *   and status
   * @throws Error if the account sync fails or if the account cannot be found
   */
  run: async (payload, io) => {
    const { accessToken, bankAccountId, manualSync = false, userId } = payload;

    await io.logger.info(`Starting account sync for account ${bankAccountId}`);

    // Get the bank account from the database
    const bankAccount = await io.runTask('get-bank-account', async () => {
      return await prisma.bankAccount.findUnique({
        select: {
          id: true,
          name: true,
          plaidAccountId: true,
          status: true,
          updatedAt: true,
        },
        where: { id: bankAccountId },
      });
    });

    if (!bankAccount) {
      await io.logger.error(`Bank account ${bankAccountId} not found`);

      throw new Error(`Bank account ${bankAccountId} not found`);
    }
    if (bankAccount.status !== 'ACTIVE' && !manualSync) {
      await io.logger.info(
        `Bank account ${bankAccountId} is not active and not manually synced, skipping`
      );

      return {
        reason: 'Account not active',
        status: 'skipped',
      };
    }

    try {
      // Fetch account data from Plaid
      const plaidAccounts = await io.runTask(
        'fetch-plaid-accounts',
        async () => {
          return await getAccounts(accessToken);
        }
      );

      // Find the matching account
      const plaidAccount = plaidAccounts.find(
        (acc) => acc.plaidAccountId === bankAccount.plaidAccountId
      );

      if (!plaidAccount) {
        await io.logger.error(
          `Plaid account not found for bank account ${bankAccountId}`
        );

        throw new Error(
          `Plaid account not found for bank account ${bankAccountId}`
        );
      }

      // Update the bank account with the latest information
      await io.runTask('update-bank-account', async () => {
        await prisma.bankAccount.update({
          data: {
            availableBalance: plaidAccount.availableBalance,
            balanceLastUpdated: new Date(),
            currentBalance: plaidAccount.currentBalance,
            isoCurrencyCode: plaidAccount.isoCurrencyCode,
            limit: plaidAccount.limit,
            mask: plaidAccount.mask,
            name: plaidAccount.name || bankAccount.name,
            officialName: plaidAccount.officialName,
            status: AccountStatus.ACTIVE,
            subtype: plaidAccount.subtype,
            type: mapPlaidAccountType(plaidAccount.type, plaidAccount.subtype),
            updatedAt: new Date(),
          },
          where: { id: bankAccountId },
        });
      });

      // If manually synced, also trigger a transaction sync
      if (manualSync) {
        await client.sendEvent({
          name: 'upsert-transactions-trigger',
          payload: {
            accessToken,
            bankAccountId,
            userId,
          },
        });
      }

      await io.logger.info(`Account sync completed for ${bankAccountId}`);

      return {
        accountId: bankAccountId,
        balance: {
          available: plaidAccount.availableBalance,
          current: plaidAccount.currentBalance,
        },
        status: 'success',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      await io.logger.error(`Account sync failed: ${errorMessage}`);

      // Update bank account with error information
      await prisma.bankAccount.update({
        data: {
          status: AccountStatus.INACTIVE,
          updatedAt: new Date(),
        },
        where: { id: bankAccountId },
      });

      // Get the bank connection ID for this account
      const bankConnectionInfo = await prisma.bankAccount.findUnique({
        select: { bankConnectionId: true },
        where: { id: bankAccountId },
      });

      if (bankConnectionInfo) {
        // Update the connection status
        await prisma.bankConnection.update({
          data: {
            errorMessage: errorMessage,
            status: BankConnectionStatus.REQUIRES_ATTENTION,
            updatedAt: new Date(),
          },
          where: { id: bankConnectionInfo.bankConnectionId },
        });
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

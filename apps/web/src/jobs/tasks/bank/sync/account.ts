import {
  AccountStatus,
  AccountType,
  BankConnectionStatus,
} from '@prisma/client';
import { eventTrigger } from '@trigger.dev/sdk';

import { prisma } from '@/server/db';
import { getAccounts } from '@/server/services/plaid';

import { client } from '../../../client';

/**
 * This job syncs account data from Plaid to our database It updates account
 * balances, names, and other metadata
 */
export const syncAccountJob = client.defineJob({
  id: 'sync-account-job',
  name: 'Sync Bank Account',
  trigger: eventTrigger({
    name: 'sync-account',
  }),
  version: '1.0.0',
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

/** Map Plaid account types to our AccountType enum */
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

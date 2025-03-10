import { BANK_JOBS } from '../../constants';
import { client } from '../../../client';
import { eventTrigger } from '@trigger.dev/sdk';
import { prisma } from '@/server/db';
import { subDays } from 'date-fns';

/**
 * This job sends comprehensive transaction summary notifications to users,
 * helping them stay informed about financial activity in their accounts.
 *
 * Key features:
 *
 * - Aggregates new transactions since the last notification
 * - Groups transactions by bank account for organized summaries
 * - Highlights large transactions (over $100)
 * - Calculates total spending across all accounts
 * - Sends email notifications with detailed transaction data
 * - Records notification activity in the user's history
 * - Respects user notification preferences
 *
 * The job is designed to provide users with a periodic overview of their
 * spending without overwhelming them with individual transaction
 * notifications.
 *
 * @file Transaction Summary Notifications Job
 * @example
 *   // Trigger transaction notifications for a specific user
 *   await client.sendEvent({
 *     name: 'sync-transaction-notifications',
 *     payload: {
 *       userId: 'user_123abc',
 *     },
 *   });
 *
 * @example
 *   // The job returns different results based on the outcome:
 *
 *   // When notifications are sent successfully:
 *   {
 *   status: "success",
 *   accountCount: 3,
 *   transactionCount: 27
 *   }
 *
 *   // When notifications are skipped (user preference):
 *   {
 *   status: "skipped",
 *   reason: "Notifications disabled"
 *   }
 *
 *   // When there are no new transactions:
 *   {
 *   status: "skipped",
 *   reason: "No new transactions"
 *   }
 */
export const transactionNotificationsJob = client.defineJob({
  id: BANK_JOBS.TRANSACTION_NOTIFICATIONS,
  name: 'Send Transaction Notifications',
  trigger: eventTrigger({
    name: 'sync-transaction-notifications',
  }),
  version: '1.0.0',
  /**
   * Main job execution function that processes and sends transaction
   * notifications
   *
   * @param payload - The job payload containing user identification
   * @param payload.userId - The ID of the user to generate transaction
   *   notifications for
   * @param io - The I/O context provided by Trigger.dev for logging, running
   *   tasks, etc.
   * @returns A result object containing status and transaction summary
   *   information
   * @throws Error if the user is not found or if notification processing fails
   */
  run: async (payload, io) => {
    const { userId } = payload;

    await io.logger.info(
      `Starting transaction notifications for user ${userId}`
    );

    try {
      // Find user details
      const user = await io.runTask('get-user', async () => {
        return await prisma.user.findUnique({
          select: {
            id: true,
            email: true,
            lastTransactionNotificationAt: true,
            name: true,
            notificationsEnabled: true,
          },
          where: { id: userId },
        });
      });

      if (!user) {
        await io.logger.error(`User ${userId} not found`);

        throw new Error(`User ${userId} not found`);
      }
      // Skip if notifications are disabled
      if (user.notificationsEnabled === false) {
        await io.logger.info(
          `Notifications disabled for user ${userId}, skipping`
        );

        return {
          reason: 'Notifications disabled',
          status: 'skipped',
        };
      }

      // Determine the cutoff date for "new" transactions
      const lastNotification =
        user.lastTransactionNotificationAt || subDays(new Date(), 7);

      // Find new transactions since last notification
      const transactions = await io.runTask(
        'get-new-transactions',
        async () => {
          return await prisma.transaction.findMany({
            include: {
              bankAccount: {
                select: {
                  mask: true,
                  name: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            where: {
              amount: { gt: 0 }, // Only include expenses
              createdAt: {
                gt: lastNotification,
              },
              pending: false, // Skip pending transactions
              userId,
            },
          });
        }
      );

      if (transactions.length === 0) {
        await io.logger.info(
          `No new transactions found for user ${userId}, skipping`
        );

        return {
          reason: 'No new transactions',
          status: 'skipped',
        };
      }

      await io.logger.info(
        `Found ${transactions.length} new transactions for user ${userId}`
      );

      // Group transactions by bank account
      const accountTransactions = transactions.reduce(
        (acc, transaction) => {
          const accountId = transaction.bankAccountId;

          if (!acc[accountId]) {
            acc[accountId] = {
              accountMask: transaction.bankAccount?.mask || 'xxxx',
              accountName: transaction.bankAccount?.name || 'Unknown',
              total: 0,
              transactions: [],
            };
          }

          acc[accountId].transactions.push(transaction);
          acc[accountId].total += transaction.amount;

          return acc;
        },
        {} as Record<
          string,
          {
            accountMask: string;
            accountName: string;
            total: number;
            transactions: any[];
          }
        >
      );

      // Organize data for the notification
      const largeTransactions = transactions
        .filter((t) => t.amount >= 100) // Transactions over $100
        .sort((a, b) => b.amount - a.amount) // Sort by amount descending
        .slice(0, 5); // Top 5

      const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
      const accountSummaries = (
        Object.values(accountTransactions) as {
          accountMask: string;
          accountName: string;
          total: number;
          transactions: any[];
        }[]
      ).map((acct) => ({
        mask: acct.accountMask,
        name: acct.accountName,
        total: acct.total,
        transactionCount: acct.transactions.length,
      }));

      // Send the notification
      if (user.email) {
        await io.runTask('send-notification', async () => {
          await client.sendEvent({
            name: 'send-email',
            payload: {
              subject: 'Transaction Summary: New Activity in Your Accounts',
              template: 'transaction-summary',
              templateData: {
                accountSummaries,
                largeTransactions,
                name: user.name || 'there',
                totalSpent,
                transactionCount: transactions.length,
                viewAllUrl: `https://yourdomain.com/app/transactions`,
              },
              to: user.email,
            },
          });
        });
      }

      // Update the last notification timestamp
      await prisma.user.update({
        data: {
          lastTransactionNotificationAt: new Date(),
        },
        where: { id: userId },
      });

      // Record this activity
      await prisma.userActivity.create({
        data: {
          detail: `Transaction summary with ${transactions.length} transactions`,
          metadata: {
            totalSpent,
            transactionCount: transactions.length,
          },
          type: 'TRANSACTION_NOTIFICATION',
          userId,
        },
      });

      await io.logger.info(`Transaction notifications sent for user ${userId}`);

      return {
        accountCount: Object.keys(accountTransactions).length,
        status: 'success',
        transactionCount: transactions.length,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      await io.logger.error(
        `Failed to send transaction notifications: ${errorMessage}`
      );

      throw error;
    }
  },
});

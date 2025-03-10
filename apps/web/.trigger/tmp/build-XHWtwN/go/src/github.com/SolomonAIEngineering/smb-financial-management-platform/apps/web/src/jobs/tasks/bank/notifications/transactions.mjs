import {
  require_date_fns
} from "../../../../../../../../../../../../chunk-HCZ7FCOM.mjs";
import {
  prisma
} from "../../../../../../../../../../../../chunk-OOK7QOPT.mjs";
import {
  client,
  eventTrigger
} from "../../../../../../../../../../../../chunk-MFHHZEYW.mjs";
import "../../../../../../../../../../../../chunk-L66UFWTU.mjs";
import {
  __toESM,
  init_esm
} from "../../../../../../../../../../../../chunk-KZCIDQ5Y.mjs";

// src/jobs/tasks/bank/notifications/transactions.ts
init_esm();
var import_date_fns = __toESM(require_date_fns(), 1);
var transactionNotificationsJob = client.defineJob({
  id: "transaction-notifications-job",
  name: "Send Transaction Notifications",
  trigger: eventTrigger({
    name: "sync-transaction-notifications"
  }),
  version: "1.0.0",
  run: async (payload, io) => {
    const { userId } = payload;
    await io.logger.info(
      `Starting transaction notifications for user ${userId}`
    );
    try {
      const user = await io.runTask("get-user", async () => {
        return await prisma.user.findUnique({
          select: {
            id: true,
            email: true,
            lastTransactionNotificationAt: true,
            name: true,
            notificationsEnabled: true
          },
          where: { id: userId }
        });
      });
      if (!user) {
        await io.logger.error(`User ${userId} not found`);
        throw new Error(`User ${userId} not found`);
      }
      if (user.notificationsEnabled === false) {
        await io.logger.info(
          `Notifications disabled for user ${userId}, skipping`
        );
        return {
          reason: "Notifications disabled",
          status: "skipped"
        };
      }
      const lastNotification = user.lastTransactionNotificationAt || (0, import_date_fns.subDays)(/* @__PURE__ */ new Date(), 7);
      const transactions = await io.runTask(
        "get-new-transactions",
        async () => {
          return await prisma.transaction.findMany({
            include: {
              bankAccount: {
                select: {
                  mask: true,
                  name: true
                }
              }
            },
            orderBy: {
              createdAt: "desc"
            },
            where: {
              amount: { gt: 0 },
              // Only include expenses
              createdAt: {
                gt: lastNotification
              },
              pending: false,
              // Skip pending transactions
              userId
            }
          });
        }
      );
      if (transactions.length === 0) {
        await io.logger.info(
          `No new transactions found for user ${userId}, skipping`
        );
        return {
          reason: "No new transactions",
          status: "skipped"
        };
      }
      await io.logger.info(
        `Found ${transactions.length} new transactions for user ${userId}`
      );
      const accountTransactions = transactions.reduce(
        (acc, transaction) => {
          const accountId = transaction.bankAccountId;
          if (!acc[accountId]) {
            acc[accountId] = {
              accountMask: transaction.bankAccount?.mask || "xxxx",
              accountName: transaction.bankAccount?.name || "Unknown",
              total: 0,
              transactions: []
            };
          }
          acc[accountId].transactions.push(transaction);
          acc[accountId].total += transaction.amount;
          return acc;
        },
        {}
      );
      const largeTransactions = transactions.filter((t) => t.amount >= 100).sort((a, b) => b.amount - a.amount).slice(0, 5);
      const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
      const accountSummaries = Object.values(accountTransactions).map(
        (acct) => ({
          mask: acct.accountMask,
          name: acct.accountName,
          total: acct.total,
          transactionCount: acct.transactions.length
        })
      );
      if (user.email) {
        await io.runTask("send-notification", async () => {
          await client.sendEvent({
            name: "send-email",
            payload: {
              subject: "Transaction Summary: New Activity in Your Accounts",
              template: "transaction-summary",
              templateData: {
                accountSummaries,
                largeTransactions,
                name: user.name || "there",
                totalSpent,
                transactionCount: transactions.length,
                viewAllUrl: `https://yourdomain.com/app/transactions`
              },
              to: user.email
            }
          });
        });
      }
      await prisma.user.update({
        data: {
          lastTransactionNotificationAt: /* @__PURE__ */ new Date()
        },
        where: { id: userId }
      });
      await prisma.userActivity.create({
        data: {
          detail: `Transaction summary with ${transactions.length} transactions`,
          metadata: {
            totalSpent,
            transactionCount: transactions.length
          },
          type: "TRANSACTION_NOTIFICATION",
          userId
        }
      });
      await io.logger.info(`Transaction notifications sent for user ${userId}`);
      return {
        accountCount: Object.keys(accountTransactions).length,
        status: "success",
        transactionCount: transactions.length
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await io.logger.error(
        `Failed to send transaction notifications: ${errorMessage}`
      );
      throw error;
    }
  }
});
export {
  transactionNotificationsJob
};
//# sourceMappingURL=transactions.mjs.map

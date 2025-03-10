import {
  getAccounts,
  getItemDetails,
  getTransactions
} from "../../../../../../../../../../chunk-LRH2TIVL.mjs";
import {
  require_date_fns
} from "../../../../../../../../../../chunk-HCZ7FCOM.mjs";
import {
  prisma,
  require_default
} from "../../../../../../../../../../chunk-OOK7QOPT.mjs";
import {
  client,
  cronTrigger,
  eventTrigger,
  z
} from "../../../../../../../../../../chunk-MFHHZEYW.mjs";
import "../../../../../../../../../../chunk-L66UFWTU.mjs";
import {
  __toESM,
  init_esm
} from "../../../../../../../../../../chunk-KZCIDQ5Y.mjs";

// src/jobs/tasks/sync-transactions.ts
init_esm();
var import_client2 = __toESM(require_default(), 1);

// src/jobs/utils/helpers.ts
init_esm();
var import_client = __toESM(require_default(), 1);
var import_date_fns = __toESM(require_date_fns(), 1);
async function getConnectionsForSync() {
  const connections = await prisma.bankConnection.findMany({
    orderBy: {
      lastSyncedAt: "asc"
      // Sync oldest first
    },
    take: 50,
    // Process in batches of 50
    where: {
      OR: [
        { lastSyncedAt: null },
        // Never synced
        {
          lastSyncedAt: {
            // Last sync was more than 12 hours ago
            lt: new Date(Date.now() - 12 * 60 * 60 * 1e3)
          }
        },
        { syncStatus: import_client.SyncStatus.SCHEDULED }
        // Explicitly scheduled for sync
      ],
      status: {
        not: import_client.BankConnectionStatus.ERROR
      }
    }
  });
  return connections;
}
async function updateConnectionSyncStatus(connectionId, status, error) {
  await prisma.bankConnection.update({
    data: {
      errorMessage: error || void 0,
      lastSyncedAt: status === import_client.SyncStatus.SYNCING ? void 0 : /* @__PURE__ */ new Date(),
      status: error ? import_client.BankConnectionStatus.ERROR : void 0,
      syncStatus: status
    },
    where: {
      id: connectionId
    }
  });
}
function formatDateForPlaid(date) {
  return (0, import_date_fns.format)(date, "yyyy-MM-dd");
}
function getTransactionDateRange(days = 30) {
  const endDate = /* @__PURE__ */ new Date();
  const startDate = (0, import_date_fns.subDays)(endDate, days);
  return {
    endDate: formatDateForPlaid(endDate),
    startDate: formatDateForPlaid(startDate)
  };
}

// src/jobs/tasks/sync-transactions.ts
var syncAllTransactionsJob = client.defineJob({
  id: "sync-all-transactions-job",
  name: "Sync All Transactions",
  trigger: cronTrigger({
    cron: "0 */4 * * *"
    // Every 4 hours
  }),
  version: "1.0.0",
  run: async (payload, io) => {
    await io.logger.info("Starting transaction sync for all connections");
    const connections = await io.runTask("get-connections", async () => {
      return await getConnectionsForSync();
    });
    await io.logger.info(`Found ${connections.length} connections to sync`);
    for (const connection of connections) {
      await io.runTask(`sync-connection-${connection.id}`, async () => {
        try {
          await updateConnectionSyncStatus(connection.id, import_client2.SyncStatus.SYNCING);
          await syncConnectionTransactions(connection, io);
          await updateConnectionSyncStatus(connection.id, import_client2.SyncStatus.IDLE);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          await io.logger.error(
            `Error syncing connection ${connection.id}: ${errorMessage}`
          );
          await updateConnectionSyncStatus(
            connection.id,
            import_client2.SyncStatus.FAILED,
            errorMessage
          );
        }
      });
    }
    return { connectionsProcessed: connections.length, success: true };
  }
});
var syncUserTransactionsJob = client.defineJob({
  id: "sync-user-transactions-job",
  name: "Sync User Transactions",
  // This job is triggered manually or via API
  trigger: eventTrigger({
    name: "manual-sync-transactions",
    schema: z.object({
      userId: z.string()
    })
  }),
  version: "1.0.0",
  run: async (payload, io) => {
    const { userId } = payload;
    await io.logger.info(`Starting transaction sync for user ${userId}`);
    const connections = await io.runTask("get-user-connections", async () => {
      return await prisma.bankConnection.findMany({
        where: {
          status: {
            not: "ERROR"
          },
          userId
        }
      });
    });
    await io.logger.info(
      `Found ${connections.length} connections for user ${userId}`
    );
    for (const connection of connections) {
      await io.runTask(`sync-connection-${connection.id}`, async () => {
        try {
          await updateConnectionSyncStatus(connection.id, import_client2.SyncStatus.SYNCING);
          await syncConnectionTransactions(connection, io);
          await updateConnectionSyncStatus(connection.id, import_client2.SyncStatus.IDLE);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          await io.logger.error(
            `Error syncing connection ${connection.id}: ${errorMessage}`
          );
          await updateConnectionSyncStatus(
            connection.id,
            import_client2.SyncStatus.FAILED,
            errorMessage
          );
        }
      });
    }
    return { connectionsProcessed: connections.length, success: true, userId };
  }
});
async function syncConnectionTransactions(connection, io) {
  const { endDate, startDate } = getTransactionDateRange(30);
  const itemDetails = await io.runTask(
    `check-item-status-${connection.id}`,
    async () => await getItemDetails(connection.accessToken)
  );
  const bankAccounts = await io.runTask(
    `get-bank-accounts-${connection.id}`,
    async () => {
      return await prisma.bankAccount.findMany({
        where: { bankConnectionId: connection.id }
      });
    }
  );
  const updatedAccounts = await io.runTask(
    `update-account-balances-${connection.id}`,
    async () => {
      const plaidAccounts = await getAccounts(connection.accessToken);
      for (const plaidAccount of plaidAccounts) {
        const bankAccount = bankAccounts.find(
          (account) => account.plaidAccountId === plaidAccount.plaidAccountId
        );
        if (bankAccount) {
          await prisma.bankAccount.update({
            data: {
              availableBalance: plaidAccount.availableBalance,
              balanceLastUpdated: /* @__PURE__ */ new Date(),
              currentBalance: plaidAccount.currentBalance,
              limit: plaidAccount.limit
            },
            where: { id: bankAccount.id }
          });
        }
      }
      return plaidAccounts;
    }
  );
  const transactionResults = await io.runTask(
    `sync-transactions-${connection.id}`,
    async () => {
      const transactions = await getTransactions(
        connection.accessToken,
        connection,
        bankAccounts,
        startDate,
        endDate
      );
      let created = 0;
      let updated = 0;
      const skipped = 0;
      for (const transaction of transactions) {
        const existingTransaction = await prisma.transaction.findUnique({
          where: { plaidTransactionId: transaction.plaidTransactionId }
        });
        if (existingTransaction) {
          await prisma.transaction.update({
            data: {
              amount: transaction.amount,
              category: transaction.category,
              date: transaction.date,
              merchantName: transaction.merchantName,
              name: transaction.name,
              pending: transaction.pending,
              subCategory: transaction.subCategory
            },
            where: { id: existingTransaction.id }
          });
          updated++;
        } else {
          await prisma.transaction.create({
            data: transaction
          });
          created++;
        }
      }
      return { created, skipped, updated };
    }
  );
  await io.runTask(
    `calculate-account-statistics-${connection.id}`,
    async () => {
      for (const account of bankAccounts) {
        const monthlyIncome = await prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            amount: { lt: 0 },
            // Income is negative in Plaid (money coming in)
            bankAccountId: account.id,
            date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3) }
            // Last 30 days
          }
        });
        const monthlySpending = await prisma.transaction.aggregate({
          _sum: { amount: true },
          where: {
            amount: { gt: 0 },
            // Spending is positive in Plaid (money going out)
            bankAccountId: account.id,
            date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3) }
            // Last 30 days
          }
        });
        const averageBalance = account.currentBalance;
        await prisma.bankAccount.update({
          data: {
            averageBalance,
            monthlyIncome: Math.abs(monthlyIncome._sum.amount || 0),
            monthlySpending: monthlySpending._sum.amount || 0
          },
          where: { id: account.id }
        });
      }
    }
  );
  return {
    accountsUpdated: updatedAccounts.length,
    transactions: transactionResults
  };
}
export {
  syncAllTransactionsJob,
  syncUserTransactionsJob
};
//# sourceMappingURL=sync-transactions.mjs.map

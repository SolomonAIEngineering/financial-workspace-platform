import {
  getAccounts
} from "../../../../../../../../../../../chunk-LRH2TIVL.mjs";
import {
  prisma,
  require_default
} from "../../../../../../../../../../../chunk-OOK7QOPT.mjs";
import {
  client,
  cronTrigger
} from "../../../../../../../../../../../chunk-MFHHZEYW.mjs";
import "../../../../../../../../../../../chunk-L66UFWTU.mjs";
import {
  __toESM,
  init_esm
} from "../../../../../../../../../../../chunk-KZCIDQ5Y.mjs";

// src/jobs/tasks/bank/update-balances.ts
init_esm();
var import_client = __toESM(require_default(), 1);
var updateBalancesJob = client.defineJob({
  id: "update-bank-balances-job",
  name: "Update Bank Balances",
  trigger: cronTrigger({
    cron: "0 */2 * * *"
    // Every 2 hours
  }),
  version: "1.0.0",
  run: async (payload, io) => {
    await io.logger.info("Starting balance update job");
    const connections = await io.runTask("get-active-connections", async () => {
      return await prisma.bankConnection.findMany({
        include: {
          accounts: {
            where: {
              status: "ACTIVE"
            }
          }
        },
        orderBy: {
          balanceLastUpdated: "asc"
          // Update oldest first
        },
        take: 100,
        // Process in batches
        where: {
          status: import_client.BankConnectionStatus.ACTIVE
        }
      });
    });
    await io.logger.info(
      `Found ${connections.length} connections to update balances`
    );
    let successCount = 0;
    let errorCount = 0;
    let accountsUpdated = 0;
    for (const connection of connections) {
      await io.runTask(`update-balances-${connection.id}`, async () => {
        try {
          const plaidAccounts = await getAccounts(connection.accessToken);
          for (const plaidAccount of plaidAccounts) {
            const bankAccount = connection.accounts.find(
              (acc) => acc.plaidAccountId === plaidAccount.plaidAccountId
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
              accountsUpdated++;
            }
          }
          await prisma.bankConnection.update({
            data: {
              balanceLastUpdated: /* @__PURE__ */ new Date()
            },
            where: { id: connection.id }
          });
          successCount++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          await io.logger.error(
            `Error updating balances for connection ${connection.id}: ${errorMessage}`
          );
          errorCount++;
          if (errorMessage.includes("ITEM_LOGIN_REQUIRED") || errorMessage.includes("INVALID_ACCESS_TOKEN") || errorMessage.includes("INVALID_CREDENTIALS")) {
            await prisma.bankConnection.update({
              data: {
                errorMessage,
                status: import_client.BankConnectionStatus.REQUIRES_REAUTH
              },
              where: { id: connection.id }
            });
          }
        }
      });
    }
    return {
      accountsUpdated,
      connectionsProcessed: connections.length,
      errorCount,
      successCount
    };
  }
});
export {
  updateBalancesJob
};
//# sourceMappingURL=update-balances.mjs.map

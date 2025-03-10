import {
  getItemDetails
} from "../../../../../../../../../../../../chunk-LRH2TIVL.mjs";
import {
  prisma,
  require_default
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

// src/jobs/tasks/bank/sync/connection.ts
init_esm();
var import_client = __toESM(require_default(), 1);
var syncConnectionJob = client.defineJob({
  id: "sync-connection-job",
  name: "Sync Bank Connection",
  trigger: eventTrigger({
    name: "sync-connection"
  }),
  version: "1.0.0",
  run: async (payload, io) => {
    const { connectionId, manualSync = false } = payload;
    await io.logger.info(`Starting connection sync for ${connectionId}`);
    try {
      const connection = await io.runTask("get-connection", async () => {
        return await prisma.bankConnection.findUnique({
          select: {
            id: true,
            accessToken: true,
            institutionId: true,
            institutionName: true,
            status: true,
            userId: true
          },
          where: { id: connectionId }
        });
      });
      if (!connection) {
        await io.logger.error(`Connection ${connectionId} not found`);
        throw new Error(`Connection ${connectionId} not found`);
      }
      const connectionDetails = await io.runTask(
        "check-connection-status",
        async () => {
          return await getItemDetails(connection.accessToken);
        }
      );
      if (connectionDetails.status?.error) {
        await io.logger.warn(
          `Connection error: ${connectionDetails.status.error}`
        );
        if (connectionDetails.status.error.includes("ITEM_LOGIN_REQUIRED")) {
          await prisma.bankConnection.update({
            data: {
              errorMessage: connectionDetails.status.error,
              lastCheckedAt: /* @__PURE__ */ new Date(),
              status: import_client.BankConnectionStatus.LOGIN_REQUIRED
            },
            where: { id: connectionId }
          });
        } else {
          await prisma.bankConnection.update({
            data: {
              errorMessage: connectionDetails.status.error,
              lastCheckedAt: /* @__PURE__ */ new Date(),
              status: import_client.BankConnectionStatus.ERROR
            },
            where: { id: connectionId }
          });
        }
        return {
          error: connectionDetails.status.error,
          status: "error"
        };
      }
      await prisma.bankConnection.update({
        data: {
          errorMessage: null,
          lastAccessedAt: /* @__PURE__ */ new Date(),
          lastCheckedAt: /* @__PURE__ */ new Date(),
          status: import_client.BankConnectionStatus.ACTIVE
        },
        where: { id: connectionId }
      });
      const accounts = await io.runTask("get-accounts", async () => {
        return await prisma.bankAccount.findMany({
          select: {
            id: true,
            name: true,
            plaidAccountId: true,
            status: true,
            type: true
          },
          where: {
            bankConnectionId: connectionId,
            enabled: true,
            // For automated syncs, we only include active accounts
            ...manualSync ? {} : { status: "ACTIVE" }
          }
        });
      });
      if (accounts.length === 0) {
        await io.logger.info(
          `No active accounts found for connection ${connectionId}`
        );
        return {
          accountsSynced: 0,
          status: "success"
        };
      }
      await io.logger.info(`Found ${accounts.length} accounts to sync`);
      let accountsSynced = 0;
      for (const account of accounts) {
        await client.sendEvent({
          // Use context for delay information
          context: {
            delaySeconds: manualSync ? accountsSynced * 2 : accountsSynced * 30
          },
          name: "sync-account-trigger",
          payload: {
            accessToken: connection.accessToken,
            bankAccountId: account.id,
            manualSync,
            userId: connection.userId
          }
        });
        accountsSynced++;
      }
      if (manualSync) {
        await client.sendEvent({
          // Use context for delay information
          context: {
            delaySeconds: 120
            // 2 minutes
          },
          name: "sync-transaction-notifications-trigger",
          payload: {
            userId: connection.userId
          }
        });
      }
      await io.logger.info(
        `Connection sync completed, triggered ${accountsSynced} account syncs`
      );
      return {
        accountsSynced,
        connectionId,
        status: "success"
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await io.logger.error(`Connection sync failed: ${errorMessage}`);
      await prisma.bankConnection.update({
        data: {
          errorMessage,
          lastCheckedAt: /* @__PURE__ */ new Date(),
          status: import_client.BankConnectionStatus.ERROR
        },
        where: { id: connectionId }
      });
      throw error;
    }
  }
});
export {
  syncConnectionJob
};
//# sourceMappingURL=connection.mjs.map

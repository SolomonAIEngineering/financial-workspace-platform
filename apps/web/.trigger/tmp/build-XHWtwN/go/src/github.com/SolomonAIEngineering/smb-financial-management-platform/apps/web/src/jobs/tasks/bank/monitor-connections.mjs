import {
  getItemDetails
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

// src/jobs/tasks/bank/monitor-connections.ts
init_esm();
var import_client = __toESM(require_default(), 1);
var monitorBankConnectionsJob = client.defineJob({
  id: "monitor-bank-connections-job",
  name: "Monitor Bank Connections",
  trigger: cronTrigger({
    cron: "0 */8 * * *"
    // Every 8 hours
  }),
  version: "1.0.0",
  run: async (payload, io) => {
    await io.logger.info("Starting bank connection health monitoring");
    const connections = await io.runTask("get-active-connections", async () => {
      return await prisma.bankConnection.findMany({
        orderBy: {
          lastCheckedAt: "asc"
        },
        select: {
          id: true,
          accessToken: true,
          institutionId: true,
          institutionName: true,
          lastCheckedAt: true,
          userId: true
        },
        take: 100,
        // Process in batches
        where: {
          status: import_client.BankConnectionStatus.ACTIVE
        }
      });
    });
    await io.logger.info(`Found ${connections.length} connections to check`);
    let healthy = 0;
    let requiresReauth = 0;
    let errored = 0;
    for (const connection of connections) {
      await io.runTask(`check-connection-${connection.id}`, async () => {
        try {
          const itemDetails = await getItemDetails(connection.accessToken);
          await prisma.bankConnection.update({
            data: { lastCheckedAt: /* @__PURE__ */ new Date() },
            where: { id: connection.id }
          });
          if (itemDetails.status && typeof itemDetails.status === "object" && "error_code" in itemDetails.status) {
            const errorMessage = String(
              itemDetails.status.error_code || "Unknown error"
            );
            await io.logger.warn(
              `Error with connection ${connection.id}: ${errorMessage}`
            );
            if (errorMessage.includes("ITEM_LOGIN_REQUIRED")) {
              await prisma.bankConnection.update({
                data: {
                  errorMessage,
                  status: import_client.BankConnectionStatus.REQUIRES_REAUTH
                },
                where: { id: connection.id }
              });
              requiresReauth++;
            } else {
              await prisma.bankConnection.update({
                data: {
                  errorMessage,
                  status: import_client.BankConnectionStatus.ERROR
                },
                where: { id: connection.id }
              });
              errored++;
            }
          } else {
            healthy++;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          await io.logger.error(
            `Error checking connection ${connection.id}: ${errorMessage}`
          );
          await prisma.bankConnection.update({
            data: {
              errorMessage,
              status: import_client.BankConnectionStatus.ERROR
            },
            where: { id: connection.id }
          });
          errored++;
        }
      });
    }
    return {
      connectionsChecked: connections.length,
      errored,
      healthy,
      requiresReauth
    };
  }
});
export {
  monitorBankConnectionsJob
};
//# sourceMappingURL=monitor-connections.mjs.map

import {
  require_date_fns
} from "../../../../../../../../../../../../chunk-HCZ7FCOM.mjs";
import {
  prisma,
  require_default
} from "../../../../../../../../../../../../chunk-OOK7QOPT.mjs";
import {
  client,
  cronTrigger
} from "../../../../../../../../../../../../chunk-MFHHZEYW.mjs";
import "../../../../../../../../../../../../chunk-L66UFWTU.mjs";
import {
  __toESM,
  init_esm
} from "../../../../../../../../../../../../chunk-KZCIDQ5Y.mjs";

// src/jobs/tasks/bank/scheduler/disconnected-scheduler.ts
init_esm();
var import_client = __toESM(require_default(), 1);
var import_date_fns = __toESM(require_date_fns(), 1);
var disconnectedSchedulerJob = client.defineJob({
  id: "disconnected-scheduler-job",
  name: "Disconnected Connections Scheduler",
  trigger: cronTrigger({
    cron: "0 12 * * *"
    // Run daily at noon
  }),
  version: "1.0.0",
  run: async (payload, io) => {
    await io.logger.info("Starting disconnected connections scheduler");
    const disconnectedConnections = await io.runTask(
      "find-disconnected-connections",
      async () => {
        return await prisma.bankConnection.findMany({
          include: {
            accounts: {
              select: {
                id: true,
                name: true
              },
              where: {
                enabled: true
              }
            },
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          },
          where: {
            // Only get connections that haven't been notified in the last 3 days
            lastNotifiedAt: {
              lt: (0, import_date_fns.subDays)(/* @__PURE__ */ new Date(), 3)
            },
            status: {
              in: [
                import_client.BankConnectionStatus.ERROR,
                import_client.BankConnectionStatus.LOGIN_REQUIRED,
                import_client.BankConnectionStatus.REQUIRES_ATTENTION
              ]
            }
          }
        });
      }
    );
    await io.logger.info(
      `Found ${disconnectedConnections.length} disconnected connections`
    );
    let notificationsSent = 0;
    for (const connection of disconnectedConnections) {
      await io.runTask(`process-disconnected-${connection.id}`, async () => {
        if (!connection.user.email || connection.accounts.length === 0) {
          return;
        }
        await client.sendEvent({
          name: "disconnected-notification-trigger",
          payload: {
            accountCount: connection.accounts.length,
            connectionId: connection.id,
            email: connection.user.email,
            institutionName: connection.institutionName,
            name: connection.user.name,
            status: connection.status,
            userId: connection.user.id
          }
        });
        await prisma.bankConnection.update({
          data: {
            lastNotifiedAt: /* @__PURE__ */ new Date(),
            notificationCount: { increment: 1 }
          },
          where: { id: connection.id }
        });
        await prisma.userActivity.create({
          data: {
            detail: `Disconnected connection notification for ${connection.institutionName}`,
            metadata: {
              connectionId: connection.id,
              status: connection.status
            },
            type: "NOTIFICATION_SENT",
            userId: connection.user.id
          }
        });
        notificationsSent++;
      });
    }
    const abandonedConnections = await io.runTask(
      "find-abandoned-connections",
      async () => {
        return await prisma.bankConnection.findMany({
          where: {
            // Connections that have been in error state for more than 30 days
            AND: [
              {
                lastStatusChangedAt: {
                  lt: (0, import_date_fns.subDays)(/* @__PURE__ */ new Date(), 30)
                }
              },
              {
                notificationCount: {
                  gte: 5
                  // At least 5 notifications have been sent
                }
              }
            ],
            status: {
              in: [
                import_client.BankConnectionStatus.ERROR,
                import_client.BankConnectionStatus.LOGIN_REQUIRED,
                import_client.BankConnectionStatus.REQUIRES_ATTENTION
              ]
            }
          }
        });
      }
    );
    let disabledCount = 0;
    for (const connection of abandonedConnections) {
      await io.runTask(`disable-abandoned-${connection.id}`, async () => {
        await prisma.bankConnection.update({
          data: {
            disabled: true,
            status: import_client.BankConnectionStatus.DISCONNECTED
          },
          where: { id: connection.id }
        });
        await prisma.bankAccount.updateMany({
          data: {
            enabled: false,
            status: "DISCONNECTED"
          },
          where: { bankConnectionId: connection.id }
        });
        disabledCount++;
      });
    }
    await io.logger.info(
      `Completed scheduler run. Sent ${notificationsSent} notifications and disabled ${disabledCount} abandoned connections`
    );
    return {
      connectionsProcessed: disconnectedConnections.length,
      disabledCount,
      notificationsSent
    };
  }
});
export {
  disconnectedSchedulerJob
};
//# sourceMappingURL=disconnected-scheduler.mjs.map

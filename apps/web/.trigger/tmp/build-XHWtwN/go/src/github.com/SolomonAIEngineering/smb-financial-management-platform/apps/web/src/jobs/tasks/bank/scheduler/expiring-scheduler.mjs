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

// src/jobs/tasks/bank/scheduler/expiring-scheduler.ts
init_esm();
var import_client = __toESM(require_default(), 1);
var import_date_fns = __toESM(require_date_fns(), 1);
var expiringSchedulerJob = client.defineJob({
  id: "expiring-scheduler-job",
  name: "Expiring Connections Scheduler",
  trigger: cronTrigger({
    cron: "0 10 * * *"
    // Run daily at 10 AM
  }),
  version: "1.0.0",
  run: async (payload, io) => {
    await io.logger.info("Starting expiring connections scheduler");
    const expiringThreshold = (0, import_date_fns.subDays)(/* @__PURE__ */ new Date(), 20);
    const expiringConnections = await io.runTask(
      "find-expiring-connections",
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
            lastAccessedAt: {
              lt: expiringThreshold
            },
            // Only get connections that haven't been notified about expiring in the last 7 days
            lastExpiryNotifiedAt: {
              lt: (0, import_date_fns.subDays)(/* @__PURE__ */ new Date(), 7)
            },
            status: import_client.BankConnectionStatus.ACTIVE
          }
        });
      }
    );
    await io.logger.info(
      `Found ${expiringConnections.length} potentially expiring connections`
    );
    let notificationsSent = 0;
    for (const connection of expiringConnections) {
      await io.runTask(`process-expiring-${connection.id}`, async () => {
        if (!connection.user.email || connection.accounts.length === 0) {
          return;
        }
        const daysInactive = (0, import_date_fns.differenceInDays)(
          /* @__PURE__ */ new Date(),
          new Date(connection.lastAccessedAt || /* @__PURE__ */ new Date())
        );
        const daysUntilExpiry = 30 - daysInactive;
        await client.sendEvent({
          name: "expiring-notification-trigger",
          payload: {
            accountCount: connection.accounts.length,
            connectionId: connection.id,
            daysInactive,
            daysUntilExpiry,
            email: connection.user.email,
            institutionName: connection.institutionName,
            name: connection.user.name,
            userId: connection.user.id
          }
        });
        await prisma.bankConnection.update({
          data: {
            expiryNotificationCount: { increment: 1 },
            lastExpiryNotifiedAt: /* @__PURE__ */ new Date()
          },
          where: { id: connection.id }
        });
        await prisma.userActivity.create({
          data: {
            detail: `Expiring connection notification for ${connection.institutionName}`,
            metadata: {
              connectionId: connection.id,
              daysInactive,
              daysUntilExpiry
            },
            type: "NOTIFICATION_SENT",
            userId: connection.user.id
          }
        });
        notificationsSent++;
      });
    }
    const expiredConnections = await io.runTask(
      "find-expired-connections",
      async () => {
        return await prisma.bankConnection.findMany({
          where: {
            lastAccessedAt: {
              lt: (0, import_date_fns.subDays)(/* @__PURE__ */ new Date(), 30)
            },
            status: import_client.BankConnectionStatus.ACTIVE
          }
        });
      }
    );
    let markedForAttention = 0;
    for (const connection of expiredConnections) {
      await io.runTask(`mark-expired-${connection.id}`, async () => {
        await prisma.bankConnection.update({
          data: {
            errorMessage: "Connection may have expired due to inactivity",
            status: import_client.BankConnectionStatus.REQUIRES_ATTENTION
          },
          where: { id: connection.id }
        });
        markedForAttention++;
      });
    }
    await io.logger.info(
      `Completed scheduler run. Sent ${notificationsSent} notifications and marked ${markedForAttention} connections as requiring attention`
    );
    return {
      connectionsProcessed: expiringConnections.length,
      markedForAttention,
      notificationsSent
    };
  }
});
export {
  expiringSchedulerJob
};
//# sourceMappingURL=expiring-scheduler.mjs.map

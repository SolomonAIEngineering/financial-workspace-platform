import {
  require_date_fns
} from "../../../../../../../../../../../chunk-HCZ7FCOM.mjs";
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

// src/jobs/tasks/reconnect/send-reconnect-alerts.ts
init_esm();
var import_client = __toESM(require_default(), 1);
var import_date_fns = __toESM(require_date_fns(), 1);
var sendReconnectAlertsJob = client.defineJob({
  id: "send-reconnect-alerts-job",
  name: "Send Reconnect Alerts",
  trigger: cronTrigger({
    cron: "0 10 * * *"
    // Every day at 10 AM
  }),
  version: "1.0.0",
  run: async (payload, io) => {
    await io.logger.info("Starting reconnect alerts job");
    const connectionsToReconnect = await io.runTask(
      "get-connections-needing-reconnect",
      async () => {
        return await prisma.bankConnection.findMany({
          include: {
            accounts: {
              select: {
                id: true,
                displayName: true,
                name: true
              },
              where: {
                status: "ACTIVE"
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
            // Only alert if they haven't been alerted in the last 3 days
            lastAlertedAt: {
              lt: (0, import_date_fns.subDays)(/* @__PURE__ */ new Date(), 3)
            },
            status: import_client.BankConnectionStatus.LOGIN_REQUIRED
          }
        });
      }
    );
    await io.logger.info(
      `Found ${connectionsToReconnect.length} connections needing reconnection`
    );
    let alertsSent = 0;
    for (const connection of connectionsToReconnect) {
      await io.runTask(`alert-connection-${connection.id}`, async () => {
        try {
          if (!connection.user.email) {
            await io.logger.warn(
              `No email for user ${connection.user.id}, skipping alert`
            );
            return;
          }
          if (connection.accounts.length === 0) {
            await io.logger.warn(
              `No active accounts for connection ${connection.id}, skipping alert`
            );
            return;
          }
          const message = {
            html: generateReconnectEmailHtml(connection),
            subject: "Action Required: Reconnect Your Bank Account",
            text: generateReconnectEmailText(connection),
            to: connection.user.email
          };
          await client.sendEvent({
            name: "send-email",
            payload: message
          });
          await prisma.bankConnection.update({
            data: {
              alertCount: { increment: 1 },
              lastAlertedAt: /* @__PURE__ */ new Date()
            },
            where: { id: connection.id }
          });
          await prisma.userActivity.create({
            data: {
              detail: "Bank reconnect alert sent",
              metadata: {
                connectionId: connection.id,
                institutionName: connection.institutionName
              },
              type: "NOTIFICATION",
              userId: connection.user.id
            }
          });
          alertsSent++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          await io.logger.error(
            `Error sending reconnect alert for connection ${connection.id}: ${errorMessage}`
          );
        }
      });
    }
    return {
      alertsSent,
      connectionsChecked: connectionsToReconnect.length
    };
  }
});
function generateReconnectEmailText(connection) {
  const userName = connection.user.name || "there";
  const institution = connection.institutionName || "your financial institution";
  const accountList = connection.accounts.map((a) => a.displayName || a.name).join(", ");
  return `
Hello ${userName},

We noticed that your connection to ${institution} needs to be updated. Without reconnecting, we won't be able to update your account information and transactions.

Affected accounts: ${accountList}

Please log in to your dashboard and click the "Reconnect" button next to your ${institution} connection to update your credentials.

Thank you for using our service!
`;
}
function generateReconnectEmailHtml(connection) {
  const userName = connection.user.name || "there";
  const institution = connection.institutionName || "your financial institution";
  const accountList = connection.accounts.map((a) => a.displayName || a.name).join(", ");
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f5f5f5; padding: 20px; border-bottom: 2px solid #ddd; }
        .content { padding: 20px; }
        .button { display: inline-block; background-color: #4CAF50; color: white; padding: 12px 20px; 
                  text-decoration: none; border-radius: 4px; margin-top: 20px; }
        .footer { margin-top: 30px; font-size: 12px; color: #777; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Account Reconnection Required</h2>
        </div>
        <div class="content">
            <p>Hello ${userName},</p>
            
            <p>We noticed that your connection to <strong>${institution}</strong> needs to be updated. 
            Without reconnecting, we won't be able to update your account information and transactions.</p>
            
            <p><strong>Affected accounts:</strong> ${accountList}</p>
            
            <p>Please log in to your dashboard and click the "Reconnect" button next to your ${institution} 
            connection to update your credentials.</p>
            
            <a href="https://app.yourdomain.com/accounts" class="button">Go to Dashboard</a>
            
            <p>Thank you for using our service!</p>
        </div>
        <div class="footer">
            <p>If you have any questions, please contact our support team.</p>
        </div>
    </div>
</body>
</html>
`;
}
export {
  sendReconnectAlertsJob
};
//# sourceMappingURL=send-reconnect-alerts.mjs.map

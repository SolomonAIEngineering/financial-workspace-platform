import {
  prisma
} from "../../../../../../../../../../../../chunk-OOK7QOPT.mjs";
import {
  client,
  eventTrigger
} from "../../../../../../../../../../../../chunk-MFHHZEYW.mjs";
import "../../../../../../../../../../../../chunk-L66UFWTU.mjs";
import {
  init_esm
} from "../../../../../../../../../../../../chunk-KZCIDQ5Y.mjs";

// src/jobs/tasks/bank/notifications/expiring.ts
init_esm();
var expiringNotificationsJob = client.defineJob({
  id: "expiring-notifications-job",
  name: "Send Expiring Connection Notifications",
  trigger: eventTrigger({
    name: "expiring-notification"
  }),
  version: "1.0.0",
  run: async (payload, io) => {
    const {
      accountCount,
      connectionId,
      daysInactive,
      daysUntilExpiry,
      email,
      institutionName,
      name,
      userId
    } = payload;
    await io.logger.info(
      `Sending expiring connection notification for ${connectionId}`
    );
    try {
      await io.runTask("send-expiring-email", async () => {
        await client.sendEvent({
          name: "send-email",
          payload: {
            subject: `Action Required: Your ${institutionName} Connection Will Expire Soon`,
            template: "connection-expiring",
            templateData: {
              accountCount,
              daysInactive,
              daysUntilExpiry,
              institutionName,
              name: name || "there",
              reconnectUrl: `https://yourdomain.com/app/accounts/reconnect/${connectionId}`
            },
            to: email
          }
        });
      });
      await prisma.notification.create({
        data: {
          body: `Your connection to ${institutionName} will expire in ${daysUntilExpiry} days if not used. Please reconnect to maintain access.`,
          metadata: {
            connectionId,
            daysUntilExpiry
          },
          read: false,
          title: `${institutionName} connection expiring soon`,
          type: "CONNECTION_EXPIRING",
          userId
        }
      });
      const emailText = generateExpiringEmailText({
        accountCount,
        daysInactive,
        daysUntilExpiry,
        institutionName,
        name: name || "there"
      });
      const emailHtml = generateExpiringEmailHtml({
        accountCount,
        daysInactive,
        daysUntilExpiry,
        institutionName,
        name: name || "there",
        reconnectUrl: `https://yourdomain.com/app/accounts/reconnect/${connectionId}`
      });
      await io.logger.info(
        `Expiring notification sent for ${institutionName} connection`
      );
      return {
        connectionId,
        emailHtml,
        emailText,
        status: "success"
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await io.logger.error(
        `Failed to send expiring notification: ${errorMessage}`
      );
      throw error;
    }
  }
});
function generateExpiringEmailText({
  accountCount,
  daysInactive,
  daysUntilExpiry,
  institutionName,
  name
}) {
  return `
Hello ${name},

We've noticed that your connection to ${institutionName} has been inactive for ${daysInactive} days and will expire in approximately ${daysUntilExpiry} days if not used.

When a connection expires, we'll no longer be able to update your account information and transactions, which may affect your financial tracking and insights.

This connection provides data for ${accountCount} account${accountCount !== 1 ? "s" : ""} in your profile.

To prevent expiration, please log in to your dashboard and use your ${institutionName} accounts, or reconnect them if needed.

Thank you for using our service!
`;
}
function generateExpiringEmailHtml({
  accountCount,
  daysInactive,
  daysUntilExpiry,
  institutionName,
  name,
  reconnectUrl
}) {
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
        .warning { color: #e65100; font-weight: bold; }
        .button { display: inline-block; background-color: #4CAF50; color: white; padding: 12px 20px; 
                  text-decoration: none; border-radius: 4px; margin-top: 20px; }
        .footer { margin-top: 30px; font-size: 12px; color: #777; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Connection Expiring Soon</h2>
        </div>
        <div class="content">
            <p>Hello ${name},</p>
            
            <p>We've noticed that your connection to <strong>${institutionName}</strong> has been inactive for 
            <strong>${daysInactive} days</strong> and will expire in approximately 
            <span class="warning">${daysUntilExpiry} days</span> if not used.</p>
            
            <p>When a connection expires, we'll no longer be able to update your account information and 
            transactions, which may affect your financial tracking and insights.</p>
            
            <p>This connection provides data for <strong>${accountCount} account${accountCount !== 1 ? "s" : ""}</strong> in your profile.</p>
            
            <p>To prevent expiration, please log in to your dashboard and use your ${institutionName} 
            accounts, or reconnect them if needed.</p>
            
            <a href="${reconnectUrl}" class="button">Reconnect Now</a>
            
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
  expiringNotificationsJob
};
//# sourceMappingURL=expiring.mjs.map

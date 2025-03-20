import { logger, schedules } from '@trigger.dev/sdk/v3';

import { BankConnectionStatus } from '@solomonai/prisma/client';
import { client } from '../../client';
import { prisma } from '@/server/db';
import { subDays } from 'date-fns';

/**
 * This job identifies bank connections that need to be reconnected and sends
 * alerts to users prompting them to fix their connections.
 */
export const sendReconnectAlertsJob = schedules.task({
  id: 'send-reconnect-alerts-job',
  description: 'Send Reconnect Alerts',
  cron: '0 10 * * *', // Every day at 10 AM
  run: async () => {
    await logger.info('Starting reconnect alerts job');

    // Find connections needing reconnection
    const connectionsToReconnect = await prisma.bankConnection.findMany({
      include: {
        accounts: {
          select: {
            id: true,
            displayName: true,
            name: true,
          },
          where: {
            status: 'ACTIVE',
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      where: {
        // Only alert if they haven't been alerted in the last 3 days
        lastAlertedAt: {
          lt: subDays(new Date(), 3),
        },
        status: BankConnectionStatus.LOGIN_REQUIRED,
      },
    });

    await logger.info(
      `Found ${connectionsToReconnect.length} connections needing reconnection`
    );

    let alertsSent = 0;

    // Process each connection
    for (const connection of connectionsToReconnect) {
      try {
        // Skip if no user email
        if (!connection.user.email) {
          await logger.warn(
            `No email for user ${connection.user.id}, skipping alert`
          );

          return;
        }
        // Skip if no active accounts
        if (connection.accounts.length === 0) {
          await logger.warn(
            `No active accounts for connection ${connection.id}, skipping alert`
          );

          return;
        }

        // Generate message for user
        const message = {
          html: generateReconnectEmailHtml(connection),
          subject: 'Action Required: Reconnect Your Bank Account',
          text: generateReconnectEmailText(connection),
          to: connection.user.email,
        };

        // Send email (using event for email service to pick up)
        await client.sendEvent({
          name: 'send-email',
          payload: message,
        });

        // Update last alerted timestamp
        await prisma.bankConnection.update({
          data: {
            alertCount: { increment: 1 },
            lastAlertedAt: new Date(),
          },
          where: { id: connection.id },
        });

        // Record notification in user activity
        await prisma.userActivity.create({
          data: {
            detail: 'Bank reconnect alert sent',
            metadata: {
              connectionId: connection.id,
              institutionName: connection.institutionName,
            },
            type: 'NOTIFICATION',
            userId: connection.user.id,
          },
        });

        alertsSent++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        await logger.error(
          `Error sending reconnect alert for connection ${connection.id}: ${errorMessage}`
        );
      }
    }

    return {
      alertsSent,
      connectionsChecked: connectionsToReconnect.length,
    };
  },
});

/** Generate plain text email content */
function generateReconnectEmailText(connection: any): string {
  const userName = connection.user.name || 'there';
  const institution =
    connection.institutionName || 'your financial institution';
  const accountList = connection.accounts
    .map((a: any) => a.displayName || a.name)
    .join(', ');

  return `
Hello ${userName},

We noticed that your connection to ${institution} needs to be updated. Without reconnecting, we won't be able to update your account information and transactions.

Affected accounts: ${accountList}

Please log in to your dashboard and click the "Reconnect" button next to your ${institution} connection to update your credentials.

Thank you for using our service!
`;
}

/** Generate HTML email content */
function generateReconnectEmailHtml(connection: any): string {
  const userName = connection.user.name || 'there';
  const institution =
    connection.institutionName || 'your financial institution';
  const accountList = connection.accounts
    .map((a: any) => a.displayName || a.name)
    .join(', ');

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

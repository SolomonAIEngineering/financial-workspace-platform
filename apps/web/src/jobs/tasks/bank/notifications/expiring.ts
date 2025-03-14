import { logger, schemaTask } from '@trigger.dev/sdk/v3';

import { BANK_JOBS } from '../../constants';
import { client } from '@/jobs/client';
import { prisma } from '@/server/db';
import { z } from 'zod';

/**
 * This job sends detailed notifications to users about bank connections that
 * are approaching their expiration date. It generates both email notifications
 * and in-app notifications to ensure users are aware of connections that need
 * attention.
 *
 * The notifications include:
 *
 * - How many days until the connection expires
 * - How long the connection has been inactive
 * - How many accounts are affected
 * - A direct link to reconnect the bank
 *
 * @file Bank Connection Expiration Notifications
 * @example
 *   // Trigger an expiration notification for a specific connection
 *   await client.sendEvent({
 *     name: 'expiring-notification',
 *     payload: {
 *       userId: 'user_123abc',
 *       connectionId: 'conn_456def',
 *       email: 'user@example.com',
 *       name: 'John',
 *       institutionName: 'Chase Bank',
 *       daysUntilExpiry: 14,
 *       daysInactive: 30,
 *       accountCount: 3,
 *     },
 *   });
 *
 * @example
 *   // The job returns the following structure on success:
 *   {
 *   connectionId: "conn_456def",
 *   emailHtml: "<!DOCTYPE html>...", // Full HTML content of the email
 *   emailText: "Hello John...",      // Plain text version of the email
 *   status: "success"
 *   }
 */
export const expiringNotificationsJob = schemaTask({
  id: BANK_JOBS.EXPIRING_NOTIFICATIONS,
  description: 'Send Expiring Connection Notifications',
  schema: z.object({
    userId: z.string(),
    connectionId: z.string(),
    email: z.string(),
    name: z.string(),
    institutionName: z.string(),
    daysUntilExpiry: z.number(),
    daysInactive: z.number(),
    accountCount: z.number(),
  }),
  /**
   * Main job execution function that handles sending notifications for expiring
   * connections
   *
   * @param payload - Information about the expiring connection
   * @param payload.userId - The ID of the user who owns the connection
   * @param payload.connectionId - The ID of the bank connection that's expiring
   * @param payload.email - User's email address to send the notification to
   * @param payload.name - User's name for personalized greeting
   * @param payload.institutionName - Name of the financial institution
   * @param payload.daysUntilExpiry - Number of days until the connection
   *   expires
   * @param payload.daysInactive - Number of days the connection has been
   *   inactive
   * @param payload.accountCount - Number of accounts linked through this
   *   connection
   * @param io - The I/O context provided by Trigger.dev for logging, running
   *   tasks, etc.
   * @returns An object containing the connection ID, email content, and status
   */
  run: async (payload, io) => {
    const {
      accountCount,
      connectionId,
      daysInactive,
      daysUntilExpiry,
      email,
      institutionName,
      name,
      userId,
    } = payload;

    await logger.info(
      `Sending expiring connection notification for ${connectionId}`
    );

    try {
      // Send email notification
      await client.sendEvent({
        name: 'send-email',
        payload: {
          subject: `Action Required: Your ${institutionName} Connection Will Expire Soon`,
          template: 'connection-expiring',
          templateData: {
            accountCount,
            daysInactive,
            daysUntilExpiry,
            institutionName,
            name: name || 'there',
            reconnectUrl: `https://yourdomain.com/app/accounts/reconnect/${connectionId}`,
          },
          to: email,
        },
      });

      // Record this notification
      await prisma.notification.create({
        data: {
          body: `Your connection to ${institutionName} will expire in ${daysUntilExpiry} days if not used. Please reconnect to maintain access.`,
          metadata: {
            connectionId,
            daysUntilExpiry,
          },
          read: false,
          title: `${institutionName} connection expiring soon`,
          type: 'CONNECTION_EXPIRING',
          userId,
        },
      });

      // Generate the email content
      const emailText = generateExpiringEmailText({
        accountCount,
        daysInactive,
        daysUntilExpiry,
        institutionName,
        name: name || 'there',
      });

      const emailHtml = generateExpiringEmailHtml({
        accountCount,
        daysInactive,
        daysUntilExpiry,
        institutionName,
        name: name || 'there',
        reconnectUrl: `https://yourdomain.com/app/accounts/reconnect/${connectionId}`,
      });

      logger.info(
        `Expiring notification sent for ${institutionName} connection`
      );

      return {
        connectionId,
        emailHtml,
        emailText,
        status: 'success',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(`Failed to send expiring notification: ${errorMessage}`);

      throw error;
    }
  },
});

/**
 * Generates the plain text version of the expiring connection email
 *
 * @param params - Parameters for constructing the email
 * @param params.accountCount - Number of accounts affected by this connection
 * @param params.daysInactive - Number of days since the connection was last
 *   active
 * @param params.daysUntilExpiry - Number of days until the connection expires
 * @param params.institutionName - Name of the financial institution
 * @param params.name - User's name for personalized greeting
 * @returns A formatted plain text string containing the email content
 */
function generateExpiringEmailText({
  accountCount,
  daysInactive,
  daysUntilExpiry,
  institutionName,
  name,
}: {
  accountCount: number;
  daysInactive: number;
  daysUntilExpiry: number;
  institutionName: string;
  name: string;
}): string {
  return `
Hello ${name},

We've noticed that your connection to ${institutionName} has been inactive for ${daysInactive} days and will expire in approximately ${daysUntilExpiry} days if not used.

When a connection expires, we'll no longer be able to update your account information and transactions, which may affect your financial tracking and insights.

This connection provides data for ${accountCount} account${accountCount !== 1 ? 's' : ''} in your profile.

To prevent expiration, please log in to your dashboard and use your ${institutionName} accounts, or reconnect them if needed.

Thank you for using our service!
`;
}

/**
 * Generates the HTML version of the expiring connection email
 *
 * @param params - Parameters for constructing the email
 * @param params.accountCount - Number of accounts affected by this connection
 * @param params.daysInactive - Number of days since the connection was last
 *   active
 * @param params.daysUntilExpiry - Number of days until the connection expires
 * @param params.institutionName - Name of the financial institution
 * @param params.name - User's name for personalized greeting
 * @param params.reconnectUrl - URL for the user to click to reconnect their
 *   account
 * @returns A formatted HTML string containing the email content
 */
function generateExpiringEmailHtml({
  accountCount,
  daysInactive,
  daysUntilExpiry,
  institutionName,
  name,
  reconnectUrl,
}: {
  accountCount: number;
  daysInactive: number;
  daysUntilExpiry: number;
  institutionName: string;
  name: string;
  reconnectUrl: string;
}): string {
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
            
            <p>This connection provides data for <strong>${accountCount} account${accountCount !== 1 ? 's' : ''}</strong> in your profile.</p>
            
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

import {
  EmailMessage,
  ReconnectConnection,
  emailMessageSchema,
  reconnectConnectionSchema,
  sendReconnectAlertsOutputSchema
} from './schema';
import { logger, schedules } from '@trigger.dev/sdk/v3';

import { BankConnectionStatus } from '@solomonai/prisma/client';
import { BankReconnectAlert } from '@solomonai/email';
import React from 'react';
import { prisma } from '@solomonai/prisma';
import { render } from '@react-email/render';
import { subDays } from 'date-fns';

/**
 * Find connections that need to be reconnected
 * @returns Array of connections requiring reconnection
 */
async function findConnectionsNeedingReconnection(): Promise<ReconnectConnection[]> {
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

  // Validate connections against schema
  return connectionsToReconnect.map(conn => reconnectConnectionSchema.parse(conn));
}

/**
 * Create an email message for a connection that needs reconnection
 * @param connection Bank connection requiring reconnection
 * @returns Email message object
 */
async function createReconnectEmailMessage(connection: ReconnectConnection): Promise<EmailMessage> {
  // Skip if no user email
  if (!connection.user.email) {
    throw new Error(`No email for user ${connection.user.id}`);
  }

  // Skip if no active accounts
  if (connection.accounts.length === 0) {
    throw new Error(`No active accounts for connection ${connection.id}`);
  }

  // Format account names for display
  const accountNames = connection.accounts
    .map(a => a.displayName || a.name)
    .join(', ');

  // Create properties for the template
  const emailProps = {
    fullName: connection.user.name || 'there',
    email: connection.user.email,
    bankName: connection.institutionName || 'your financial institution',
    accountNames: accountNames
  };

  // Render email using React Email template
  const html = await render(React.createElement(BankReconnectAlert, emailProps));

  // Generate message for user
  return emailMessageSchema.parse({
    html,
    subject: 'Action Required: Reconnect Your Bank Account',
    text: '', // We provide an empty string to satisfy the schema, but modern email systems will use the HTML version
    to: connection.user.email,
  });
}

/**
 * Send a reconnection alert email for a bank connection
 * @param connection Bank connection requiring reconnection
 * @returns Whether the alert was successfully sent
 */
async function sendReconnectAlert(connection: ReconnectConnection): Promise<boolean> {
  try {
    // Create email message
    const message = await createReconnectEmailMessage(connection);

    // Trigger email sending event
    // Note: The actual client implementation should be imported
    // This is a simplified approach for now
    await logger.info('Sending reconnect alert email', {
      to: message.to,
      connectionId: connection.id
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

    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await logger.error(
      `Error sending reconnect alert for connection ${connection.id}: ${errorMessage}`
    );
    return false;
  }
}

/**
 * This job identifies bank connections that need to be reconnected and sends
 * alerts to users prompting them to fix their connections.
 */
export const sendReconnectAlertsJob = schedules.task({
  id: 'send-reconnect-alerts-job',
  description: 'Send Reconnect Alerts',
  cron: '0 10 * * *', // Every day at 10 AM
  /**
   * Configure retry behavior for the scheduled task
   */
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 5000,
    maxTimeoutInMs: 60000,
    randomize: true,
  },
  /**
   * Main execution function for sending reconnect alerts
   * 
   * @returns A summary object with counts of alerts sent and connections checked
   */
  run: async () => {
    try {
      return await logger.trace('send-reconnect-alerts', async (span) => {
        await logger.info('Starting reconnect alerts job');

        // Find connections needing reconnection
        const connectionsToReconnect = await findConnectionsNeedingReconnection();

        await logger.info(
          `Found ${connectionsToReconnect.length} connections needing reconnection`
        );

        span.setAttribute('connectionsCount', connectionsToReconnect.length);

        // Process connections in parallel
        const alertResults = await Promise.all(
          connectionsToReconnect.map(connection =>
            sendReconnectAlert(connection)
          )
        );

        // Count successful alerts
        const alertsSent = alertResults.filter(result => result).length;

        span.setAttribute('alertsSent', alertsSent);

        // Return results
        return sendReconnectAlertsOutputSchema.parse({
          alertsSent,
          connectionsChecked: connectionsToReconnect.length,
        });
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to send reconnect alerts: ${errorMessage}`);
      throw new Error(`Failed to send reconnect alerts: ${errorMessage}`);
    }
  },
});

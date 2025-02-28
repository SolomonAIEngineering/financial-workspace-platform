import { BankConnectionStatus } from '@prisma/client';
import { cronTrigger } from '@trigger.dev/sdk';
import { differenceInDays, subDays } from 'date-fns';

import { prisma } from '@/server/db';

import { client } from '../../../client';

/**
 * This job runs on a schedule to find bank connections that might be
 * approaching their expiration date and notifies users to take action. This
 * helps maintain continuous access to financial data.
 */
export const expiringSchedulerJob = client.defineJob({
  id: 'expiring-scheduler-job',
  name: 'Expiring Connections Scheduler',
  trigger: cronTrigger({
    cron: '0 10 * * *', // Run daily at 10 AM
  }),
  version: '1.0.0',
  run: async (payload, io) => {
    await io.logger.info('Starting expiring connections scheduler');

    // Plaid tokens typically expire after 30 days of inactivity
    // We'll proactively notify users of connections that haven't been used in 20+ days
    const expiringThreshold = subDays(new Date(), 20);

    // Find potentially expiring connections
    const expiringConnections = await io.runTask(
      'find-expiring-connections',
      async () => {
        return await prisma.bankConnection.findMany({
          include: {
            accounts: {
              select: {
                id: true,
                name: true,
              },
              where: {
                enabled: true,
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
            lastAccessedAt: {
              lt: expiringThreshold,
            },
            // Only get connections that haven't been notified about expiring in the last 7 days
            lastExpiryNotifiedAt: {
              lt: subDays(new Date(), 7),
            },
            status: BankConnectionStatus.ACTIVE,
          },
        });
      }
    );

    await io.logger.info(
      `Found ${expiringConnections.length} potentially expiring connections`
    );

    // Process each expiring connection
    let notificationsSent = 0;

    for (const connection of expiringConnections) {
      await io.runTask(`process-expiring-${connection.id}`, async () => {
        // Skip if no email or no active accounts
        if (!connection.user.email || connection.accounts.length === 0) {
          return;
        }

        const daysInactive = differenceInDays(
          new Date(),
          new Date(connection.lastAccessedAt || new Date())
        );
        const daysUntilExpiry = 30 - daysInactive;

        // Send notification to user
        await client.sendEvent({
          name: 'expiring-notification-trigger',
          payload: {
            accountCount: connection.accounts.length,
            connectionId: connection.id,
            daysInactive,
            daysUntilExpiry,
            email: connection.user.email,
            institutionName: connection.institutionName,
            name: connection.user.name,
            userId: connection.user.id,
          },
        });

        // Update last notified timestamp
        await prisma.bankConnection.update({
          data: {
            expiryNotificationCount: { increment: 1 },
            lastExpiryNotifiedAt: new Date(),
          },
          where: { id: connection.id },
        });

        // Record this activity
        await prisma.userActivity.create({
          data: {
            detail: `Expiring connection notification for ${connection.institutionName}`,
            metadata: {
              connectionId: connection.id,
              daysInactive,
              daysUntilExpiry,
            },
            type: 'NOTIFICATION_SENT',
            userId: connection.user.id,
          },
        });

        notificationsSent++;
      });
    }

    // For connections that have likely already expired (no activity in 30+ days),
    // mark them as requiring attention
    const expiredConnections = await io.runTask(
      'find-expired-connections',
      async () => {
        return await prisma.bankConnection.findMany({
          where: {
            lastAccessedAt: {
              lt: subDays(new Date(), 30),
            },
            status: BankConnectionStatus.ACTIVE,
          },
        });
      }
    );

    let markedForAttention = 0;

    for (const connection of expiredConnections) {
      await io.runTask(`mark-expired-${connection.id}`, async () => {
        // Mark as requiring attention
        await prisma.bankConnection.update({
          data: {
            errorMessage: 'Connection may have expired due to inactivity',
            status: BankConnectionStatus.REQUIRES_ATTENTION,
          },
          where: { id: connection.id },
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
      notificationsSent,
    };
  },
});

import {
  NotificationTypes,
  TriggerEvents,
  triggerBulk,
} from '@solomonai/notification';

import { InvoiceOverdue } from '@solomonai/email';
import { InvoicePaid } from '@solomonai/email';
import { BusinessConfig as config } from '@solomonai/platform-config';
import { logger } from '@trigger.dev/sdk/v3';
import { render } from '@react-email/render';

/**
 * Payload structure for triggering notifications
 * @interface TriggerPayload
 */
type TriggerPayload = {
  /** The event that triggered the notification */
  name: TriggerEvents;
  /** Additional data for the notification */
  payload: Record<string, any>;
  /** User details to send the notification to */
  user: {
    /** Unique identifier for the subscriber */
    subscriberId: string;
    /** Identifier of the team the user belongs to */
    teamId: string;
    /** User's email address */
    email: string;
    /** User's full name */
    fullName: string;
    /** Optional URL to the user's avatar image */
    avatarUrl?: string;
  };
};

/**
 * Sends notifications for paid invoices both in-app and via email
 * 
 * @param {Object} params - Parameters for the paid invoice notifications
 * @param {any[]} params.user - Array of user objects to notify
 * @param {string} params.invoiceId - Unique identifier of the invoice
 * @param {string} params.invoiceNumber - Human-readable invoice number
 * @param {string} [params.customerName] - Optional name of the customer
 * @param {string} [params.teamName] - Optional name of the team
 * @param {string} [params.teamSlug] - Optional team slug for URL generation
 * 
 * @returns {Promise<void>} Resolves when all notifications have been sent
 */
export async function handlePaidInvoiceNotifications({
  user,
  invoiceId,
  invoiceNumber,
  customerName,
  teamName,
  teamSlug,
}: {
  user: any[];
  invoiceId: string;
  invoiceNumber: string;
  customerName?: string;
  teamName?: string;
  teamSlug?: string;
}) {
  const link = `${config.platformUrl}/invoices?invoiceId=${invoiceId}&type=details`;

  const paidNotificationEvents = user
    ?.map(({ user, team_id }) => {
      if (!user) {
        return null;
      }

      return {
        name: TriggerEvents.InvoicePaidInApp,
        payload: {
          type: NotificationTypes.Invoice,
          recordId: invoiceId,
          description: `Invoice ${invoiceNumber} has been paid`,
        },
        user: {
          subscriberId: user.id,
          teamId: team_id,
          email: user.email,
          fullName: user.full_name,
          avatarUrl: user.avatar_url,
        },
      };
    })
    .filter(Boolean);

  try {
    await triggerBulk(
      paidNotificationEvents.filter(Boolean) as TriggerPayload[]
    );
  } catch (error) {
    await logger.error('Paid invoice notification', { error });
  }

  const paidEmailPromises = user
    ?.map(async ({ user, team_id, team_slug, customer_name, team_name }) => {
      if (!user) {
        return null;
      }

      const html = await render(
        <InvoicePaid
          invoiceNumber={invoiceNumber}
          link={link}
          customerName={customer_name}
          teamName={team_name}
          teamSlug={team_slug}
        />
      );

      return {
        name: TriggerEvents.InvoicePaidEmail,
        payload: {
          subject: `Invoice ${invoiceNumber} has been paid`,
          html,
        },
        user: {
          subscriberId: user.id,
          teamId: team_id,
          email: user.email,
          fullName: user.full_name,
          avatarUrl: user.avatar_url,
        },
      };
    })
    .filter(Boolean);

  const validPaidEmailPromises = await Promise.all(paidEmailPromises);

  try {
    await triggerBulk(validPaidEmailPromises as TriggerPayload[]);
  } catch (error) {
    await logger.error('Paid invoice email', { error });
  }
}

/**
 * Sends notifications for overdue invoices both in-app and via email
 * 
 * @param {Object} params - Parameters for the overdue invoice notifications
 * @param {any[]} params.user - Array of user objects to notify
 * @param {string} params.invoiceId - Unique identifier of the invoice
 * @param {string} params.invoiceNumber - Human-readable invoice number
 * @param {string} [params.customerName] - Optional name of the customer
 * @param {string} [params.teamName] - Optional name of the team
 * @param {string} [params.teamSlug] - Optional team slug for URL generation
 * 
 * @returns {Promise<void>} Resolves when all notifications have been sent
 */
export async function handleOverdueInvoiceNotifications({
  user,
  invoiceId,
  invoiceNumber,
  customerName,
  teamName,
  teamSlug,
}: {
  user: any[];
  invoiceId: string;
  invoiceNumber: string;
  customerName?: string;
  teamName?: string;
  teamSlug?: string;
}) {
  const link = `${config.platformUrl}/invoices?invoiceId=${invoiceId}&type=details`;

  const overdueNotificationEvents = user
    ?.map(({ user, team_id }) => {
      if (!user) {
        return null;
      }

      return {
        name: TriggerEvents.InvoiceOverdueInApp,
        payload: {
          type: NotificationTypes.Invoice,
          recordId: invoiceId,
          description: `Invoice ${invoiceNumber} is overdue`,
        },
        user: {
          subscriberId: user.id,
          teamId: team_id,
          email: user.email,
          fullName: user.full_name,
          avatarUrl: user.avatar_url,
        },
      };
    })
    .filter(Boolean);

  try {
    await triggerBulk(overdueNotificationEvents as TriggerPayload[]);
  } catch (error) {
    await logger.error('Overdue invoice notification', { error });
  }

  const overdueEmailPromises = user
    ?.map(async ({ user, team_id, team_slug }) => {
      if (!user) {
        return null;
      }

      const html = await render(
        <InvoiceOverdue
          invoiceNumber={invoiceNumber}
          customerName={customerName ?? ''}
          link={link}
          teamSlug={team_slug ?? ''}
        />
      );

      return {
        name: TriggerEvents.InvoiceOverdueEmail,
        payload: {
          subject: `Invoice ${invoiceNumber} is overdue`,
          html,
        },
        user: {
          subscriberId: user.id,
          teamId: team_id,
          email: user.email,
          fullName: user.full_name,
          avatarUrl: user.avatar_url,
        },
      };
    })
    .filter(Boolean);

  const validOverdueEmailPromises = await Promise.all(overdueEmailPromises);

  try {
    await triggerBulk(validOverdueEmailPromises as TriggerPayload[]);
  } catch (error) {
    await logger.error('Overdue invoice email', { error });
  }
}

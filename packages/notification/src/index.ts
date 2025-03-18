/**
 * Notification module that provides an interface to the Novu notification infrastructure.
 * This module allows sending notifications via various channels and managing subscriber preferences.
 * @module notification
 */
import { Novu } from "@novu/node";
import { nanoid } from "nanoid";

const novu = new Novu(process.env.NOVU_API_KEY!);

const API_ENDPOINT = "https://api.novu.co/v1";

/**
 * Enumeration of notification trigger event types used throughout the application.
 * These events map to notification templates configured in Novu.
 */
export enum TriggerEvents {
  /** Notification for a single new transaction (in-app) */
  TransactionNewInApp = "transaction_new_in_app",
  /** Notification for multiple new transactions (in-app) */
  TransactionsNewInApp = "transactions_new_in_app",
  /** Notification for a new transaction (email) */
  TransactionNewEmail = "transaction_new_email",
  /** Notification for a new inbox message (in-app) */
  InboxNewInApp = "inbox_new_in_app",
  /** Notification for a new match (in-app) */
  MatchNewInApp = "match_in_app",
  /** Notification for a paid invoice (in-app) */
  InvoicePaidInApp = "invoice_paid_in_app",
  /** Notification for a paid invoice (email) */
  InvoicePaidEmail = "invoice_paid_email",
  /** Notification for an overdue invoice (in-app) */
  InvoiceOverdueInApp = "invoice_overdue_in_app",
  /** Notification for an overdue invoice (email) */
  InvoiceOverdueEmail = "invoice_overdue_email",
}

/**
 * Categorization of different notification types by entity.
 * Used for grouping and filtering notifications.
 */
export enum NotificationTypes {
  /** Transaction-related notifications */
  Transaction = "transaction",
  /** Notifications related to multiple transactions */
  Transactions = "transactions",
  /** Inbox message notifications */
  Inbox = "inbox",
  /** Match-related notifications */
  Match = "match",
  /** Invoice-related notifications */
  Invoice = "invoice",
}

/**
 * Information about the user to whom the notification will be sent.
 * @interface TriggerUser
 */
type TriggerUser = {
  /** Unique identifier for the subscriber */
  subscriberId: string;
  /** Email address of the user */
  email: string;
  /** User's full name */
  fullName: string;
  /** Optional URL for the user's avatar */
  avatarUrl?: string;
  /** Team ID the user belongs to */
  teamId: string;
};

/**
 * Payload for triggering a notification.
 * @interface TriggerPayload
 */
type TriggerPayload = {
  /** The notification event name */
  name: TriggerEvents;
  /** Custom data to be included in the notification */
  payload: any;
  /** Recipient information */
  user: TriggerUser;
  /** Optional email address to set as reply-to */
  replyTo?: string;
  /** Optional tenant identifier for multi-tenant applications */
  tenant?: string; // NOTE: Currently no way to listen for messages with tenant, we use team_id + user_id for unique
};

/**
 * Triggers a notification to a single user.
 * 
 * @param data - The notification data including event name, payload, and user information
 * @returns A promise that resolves when the notification has been triggered
 * 
 * @example
 * ```typescript
 * await trigger({
 *   name: TriggerEvents.TransactionNewInApp,
 *   payload: { transactionId: '123', amount: 100 },
 *   user: {
 *     subscriberId: 'user123',
 *     email: 'user@example.com',
 *     fullName: 'John Doe',
 *     teamId: 'team456'
 *   }
 * });
 * ```
 */
export async function trigger(data: TriggerPayload) {
  try {
    await novu.trigger(data.name, {
      to: {
        ...data.user,
        //   Prefix subscriber id with team id
        subscriberId: `${data.user.teamId}_${data.user.subscriberId}`,
      },
      payload: data.payload,
      tenant: data.tenant,
      overrides: {
        email: {
          replyTo: data.replyTo,
          // @ts-ignore
          headers: {
            "X-Entity-Ref-ID": nanoid(),
          },
        },
      },
    });
  } catch (error) {
    console.log(error);
  }
}

/**
 * Triggers multiple notifications in bulk to optimize API calls.
 * 
 * @param events - Array of notification payloads to be sent
 * @returns A promise that resolves when all notifications have been triggered
 * 
 * @example
 * ```typescript
 * await triggerBulk([
 *   {
 *     name: TriggerEvents.TransactionNewInApp,
 *     payload: { transactionId: '123', amount: 100 },
 *     user: {
 *       subscriberId: 'user123',
 *       email: 'user@example.com',
 *       fullName: 'John Doe',
 *       teamId: 'team456'
 *     }
 *   },
 *   {
 *     name: TriggerEvents.InboxNewInApp,
 *     payload: { messageId: '789' },
 *     user: {
 *       subscriberId: 'user456',
 *       email: 'other@example.com',
 *       fullName: 'Jane Doe',
 *       teamId: 'team456'
 *     }
 *   }
 * ]);
 * ```
 */
export async function triggerBulk(events: TriggerPayload[]) {
  try {
    await novu.bulkTrigger(
      events.map((data) => ({
        name: data.name,
        to: {
          ...data.user,
          //   Prefix subscriber id with team id
          subscriberId: `${data.user.teamId}_${data.user.subscriberId}`,
        },
        payload: data.payload,
        tenant: data.tenant,
        overrides: {
          email: {
            replyTo: data.replyTo,
            headers: {
              "X-Entity-Ref-ID": nanoid(),
            },
          },
        },
      })),
    );
  } catch (error) {
    console.log(error);
  }
}

/**
 * Parameters for retrieving subscriber notification preferences.
 * @interface GetSubscriberPreferencesParams
 */
type GetSubscriberPreferencesParams = {
  /** Team ID the subscriber belongs to */
  teamId: string;
  /** Unique identifier for the subscriber */
  subscriberId: string;
};

/**
 * Retrieves notification preferences for a subscriber.
 * 
 * @param params - Object containing teamId and subscriberId
 * @returns A promise resolving to the subscriber's notification preferences
 * 
 * @example
 * ```typescript
 * const preferences = await getSubscriberPreferences({
 *   teamId: 'team456',
 *   subscriberId: 'user123'
 * });
 * ```
 */
export async function getSubscriberPreferences({
  subscriberId,
  teamId,
}: GetSubscriberPreferencesParams) {
  const response = await fetch(
    `${API_ENDPOINT}/subscribers/${teamId}_${subscriberId}/preferences?includeInactiveChannels=false`,
    {
      method: "GET",
      headers: {
        Authorization: `ApiKey ${process.env.NOVU_API_KEY!}`,
      },
    },
  );

  return response.json();
}

/**
 * Parameters for updating a subscriber's notification preference.
 * @interface UpdateSubscriberPreferenceParams
 */
type UpdateSubscriberPreferenceParams = {
  /** Unique identifier for the subscriber */
  subscriberId: string;
  /** Team ID the subscriber belongs to */
  teamId: string;
  /** Notification template ID to update preferences for */
  templateId: string;
  /** Channel type (e.g., 'email', 'in_app') */
  type: string;
  /** Whether notifications for this channel should be enabled */
  enabled: boolean;
};

/**
 * Updates notification preferences for a specific subscriber and channel.
 * 
 * @param params - Object containing subscriberId, teamId, templateId, type, and enabled flag
 * @returns A promise resolving to the updated preference data
 * 
 * @example
 * ```typescript
 * await updateSubscriberPreference({
 *   subscriberId: 'user123',
 *   teamId: 'team456',
 *   templateId: 'template789',
 *   type: 'email',
 *   enabled: false
 * });
 * ```
 */
export async function updateSubscriberPreference({
  subscriberId,
  teamId,
  templateId,
  type,
  enabled,
}: UpdateSubscriberPreferenceParams) {
  const response = await fetch(
    `${API_ENDPOINT}/subscribers/${teamId}_${subscriberId}/preferences/${templateId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `ApiKey ${process.env.NOVU_API_KEY!}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel: {
          type,
          enabled,
        },
      }),
    },
  );

  return response.json();
}

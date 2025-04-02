import { Task, schemaTask } from "@trigger.dev/sdk/v3";

import { ConnectionExpire } from "@solomonai/email";
import { BusinessConfig as platformConfig } from '@solomonai/platform-config';
import { render } from "@react-email/components";
import { resend } from "@solomonai/lib/clients";
import { z } from "zod";

/**
 * Schema defining the required input for sending expiration notifications
 * Validates that all required fields are present and properly formatted
 */
const expiringNotificationSchema = z.object({
  /**
   * Array of users to notify about expiring bank connections
   * Each entry contains information about the user, bank, and team
   */
  users: z.array(
    z.object({
      /** Name of the financial institution with expiring access */
      bankName: z.string(),
      /** Name of the team/workspace the user belongs to */
      teamName: z.string(),
      /** URL-friendly slug of the team name */
      teamSlug: z.string(),
      /** ISO date string when the connection will expire */
      expiresAt: z.string(),
      /** User details including contact information */
      user: z.object({
        /** Unique identifier for the user */
        id: z.string(),
        /** Email address where notification will be sent */
        email: z.string(),
        /** User's full name for personalized greeting */
        full_name: z.string(),
        /** User's locale preference for potential localization */
        locale: z.string(),
      }),
    }),
  ),
});

/**
 * Type definition derived from the expiration notification input schema
 * Represents the validated parameters for the notification task
 */
type ExpiringNotificationInput = z.infer<typeof expiringNotificationSchema>;

/**
 * Output structure returned by the expiration notification task
 * Provides information about the success of the operation and metrics
 */
type ExpiringNotificationOutput = {
  /** Indicates whether the notification operation was successful */
  success: boolean;
  /** Number of email notifications that were sent */
  emailsSent: number;
};

/**
 * Defines a task to send notifications to users when their bank connections are
 * about to expire. This helps ensure users can take timely action to prevent
 * data access interruptions.
 * 
 * @remarks
 * The task generates personalized emails for each user with information about their
 * specific bank connection that's expiring. It includes the expiration date and a
 * direct link to reconnect or refresh their connection. Email delivery is handled
 * through the Resend service with fault tolerance for service availability.
 * 
 * @example
 * ```ts
 * await client.sendEvent({
 *   name: 'expiring-notifications',
 *   payload: {
 *     users: [
 *       {
 *         bankName: 'Chase Bank',
 *         teamName: 'Finance Team',
 *         teamSlug: 'finance-team',
 *         expiresAt: '2023-12-31T23:59:59Z',
 *         user: {
 *           id: 'user-123',
 *           email: 'jane@example.com',
 *           full_name: 'Jane Smith',
 *           locale: 'en-US'
 *         }
 *       }
 *     ]
 *   }
 * });
 * ```
 */
export const expiringNotifications: Task<
  'expiring-notifications',
  ExpiringNotificationInput,
  ExpiringNotificationOutput
> = schemaTask({
  /**
   * Unique identifier for this task
   */
  id: "expiring-notifications",

  /**
   * Maximum duration in seconds that this task can run before timing out
   */
  maxDuration: 300,

  /**
   * Queue configuration to control concurrency and rate limiting
   */
  queue: {
    concurrencyLimit: 1,
  },

  /**
   * Schema used to validate input parameters
   */
  schema: expiringNotificationSchema,

  /**
   * Main execution function for the expiring connection notification task
   * 
   * @param payload - The validated input parameters
   * @param payload.users - Array of users to notify about expiring bank connections
   * @returns A result object with success status and email count
   * @throws Error if email generation or sending fails
   */
  run: async ({ users }) => {
    /**
     * Generate personalized email content for each user
     * Maps the user data to email message objects
     */
    const emailPromises = users.map(
      async ({ user, bankName, teamName, teamSlug, expiresAt }) => {
        /**
         * Render the email template with personalized data
         * Creates a HTML version of the email with proper formatting
         */
        const html = await render(
          <ConnectionExpire
            fullName={user.full_name}
            bankName={bankName}
            workspaceName={teamName}
            workspaceSlug={teamSlug}
            expiresAt={expiresAt}
            reconnectUrl={`${platformConfig.platformUrl}/team/${teamSlug}/settings/connect`}
          />,
        );

        /**
         * Create the email message object with proper sender and recipient
         */
        return {
          from: platformConfig.email.from.notifications,
          to: [user.email],
          subject: "Bank Connection Expiring Soon",
          html,
        };
      },
    );

    // Wait for all email rendering to complete
    const emails = await Promise.all(emailPromises);

    /**
     * Send emails if the Resend client is available
     * Adds fault tolerance for cases where the email client isn't properly initialized
     */
    if (resend) {
      await resend.batch.send(emails);
    }

    /**
     * Return success result with email count
     */
    return {
      success: true,
      emailsSent: emails.length
    };
  },
});

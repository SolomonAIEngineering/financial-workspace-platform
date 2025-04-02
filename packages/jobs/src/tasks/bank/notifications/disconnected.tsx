import { Task, schemaTask } from '@trigger.dev/sdk/v3';

import { ConnectionIssue } from "@solomonai/email";
import { BusinessConfig as platformConfig } from '@solomonai/platform-config';
import { render } from "@react-email/components";
import { resend } from '@solomonai/lib/clients';
import { z } from 'zod';

/**
 * Schema defining the required input for sending disconnection notifications
 * Validates that all required fields are present and properly formatted
 */
const disconnectedNotificationSchema = z.object({
  /**
   * Array of users to notify about disconnected bank connections
   * Each entry contains information about the user, bank, and team
   */
  users: z.array(
    z.object({
      /** Name of the financial institution that is disconnected */
      bankName: z.string(),
      /** Name of the team/workspace the user belongs to */
      teamName: z.string(),
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
    })
  ),
});

/**
 * Type definition derived from the notification input schema
 * Represents the validated parameters for the notification task
 */
type DisconnectedNotificationSchema = z.infer<typeof disconnectedNotificationSchema>;

/**
 * Schema defining the output structure returned by the notification task
 * Contains information about the outcome of the notification process
 */
const disconnectedNotificationOutputSchema = z.object({
  /** Indicates whether the notification operation was successful */
  success: z.boolean(),
  /** Number of notifications that were sent */
  notificationCount: z.number(),
});

/**
 * Type definition derived from the notification output schema
 * Represents the response structure from the notification task
 */
type DisconnectedNotificationOutput = z.infer<typeof disconnectedNotificationOutputSchema>;

/**
 * Defines a task to send notifications to users when their bank connections have been
 * disconnected and require reconnection. It helps ensure users are aware of
 * connectivity issues and can take prompt action to restore their financial
 * data.
 * 
 * @remarks
 * The task handles generating personalized emails for each user based on 
 * their specific bank connection and team context. It includes a reconnection URL
 * that allows users to quickly resolve their connection issues. Email delivery
 * is handled through the Resend service.
 * 
 * @example
 * ```ts
 * await client.sendEvent({
 *   name: 'disconnected-notifications',
 *   payload: {
 *     users: [
 *       {
 *         bankName: 'Chase Bank',
 *         teamName: 'Finance Team',
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
export const disconnectedNotifications: Task<
  'disconnected-notifications',
  DisconnectedNotificationSchema,
  DisconnectedNotificationOutput
> = schemaTask({
  /**
   * Unique identifier for this task
   */
  id: 'disconnected-notifications',

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
  // TODO: Add retry configuration for email delivery failures

  /**
   * Schema used to validate input parameters
   */
  schema: disconnectedNotificationSchema,

  /**
   * Main execution function for the disconnected notification task
   * 
   * @param payload - The validated input parameters
   * @param payload.users - Array of users to notify about disconnected bank connections
   * @returns A result object with success status and notification count
   * @throws Error if email generation or sending fails
   */
  run: async ({ users }) => {
    /**
     * Generate personalized email content for each user
     * Maps the user data to email message objects
     */
    const emailPromises = users.map(async ({ user, bankName, teamName }) => {
      // Generate the workspace slug from the team name for URL construction
      const workspaceSlug = teamName.toLowerCase().replace(/\s+/g, '-');

      // Render the email template with personalized data
      const html = await render(
        <ConnectionIssue
          fullName={user.full_name}
          bankName={bankName}
          workspaceName={teamName}
          workspaceSlug={workspaceSlug}
          reconnectUrl={`${platformConfig.platformUrl}/team/${workspaceSlug}/settings/connect`}
        />,
      );

      // Create the email message object
      return {
        from: platformConfig.email.from.notifications,
        to: [user.email],
        subject: "Bank Connection Expiring Soon",
        html,
      };
    });

    // Wait for all email rendering to complete
    const emails = await Promise.all(emailPromises);

    // Send emails if the Resend client is available
    if (resend) {
      await resend.batch.send(emails);
    } else {
      console.error("Resend client is not initialized");
    }

    // Return success result with notification count
    return {
      success: true,
      notificationCount: emails.length,
    };
  },
});

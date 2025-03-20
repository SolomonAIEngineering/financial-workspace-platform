import { resend } from '@/lib/resend';
import { schemaTask } from '@trigger.dev/sdk/v3';
import { z } from 'zod';

/**
 * This job sends notifications to users when their bank connections have been
 * disconnected and require reconnection. It helps ensure users are aware of
 * connectivity issues and can take prompt action to restore their financial
 * data.
 *
 * @file Bank Connection Disconnected Notifications
 */
export const disconnectedNotifications = schemaTask({
  id: 'disconnected-notifications',
  maxDuration: 300,
  queue: {
    concurrencyLimit: 1,
  },
  // TODO: Add retry configuration for email delivery failures
  schema: z.object({
    users: z.array(
      z.object({
        bankName: z.string(),
        teamName: z.string(),
        user: z.object({
          id: z.string(),
          email: z.string(),
          full_name: z.string(),
          locale: z.string(),
        }),
        // TODO: Add connection details (id, last connected date, etc.)
        // TODO: Add reason for disconnection (expired, revoked, error, etc.)
      })
    ),
    // TODO: Add notification preferences to control which channels to use (email, in-app, SMS)
  }),
  run: async ({ users }) => {
    // TODO: Add logging for job start and completion
    // TODO: Add handling for users who may have reestablished connection since job was triggered

    const emailPromises = users.map(async ({ user, bankName, teamName }) => {
      // TODO: Implement proper email template with reconnection instructions and links
      // const html = render(
      //     <ConnectionIssueEmail
      //         fullName={user.full_name}
      //         bankName={bankName}
      //         teamName={teamName}
      //     />,
      // );
      const html = `<h1>Hello</h1>`;

      // TODO: Add user's preferred language/locale support for email content
      // TODO: Add customized subject line based on disconnection reason

      return {
        from: 'Solomon AI <hello@solomonai.com>',
        to: [user.email],
        subject: 'Bank Connection Expiring Soon',
        html,
        // TODO: Add plain text version of email for better deliverability
        // TODO: Add tracking parameters to measure email engagement
      };
    });

    const emails = await Promise.all(emailPromises);

    // TODO: Add error handling for individual email failures
    // TODO: Add rate limiting to prevent excessive notifications
    // TODO: Add tracking and metrics for notification success rates

    await resend?.batch.send(emails);

    // TODO: Track which users were notified to prevent duplicate notifications
    // TODO: Add follow-up notification scheduling if users don't reconnect within X days
    // TODO: Send notifications through additional channels (in-app, SMS) for critical accounts

    return {
      success: true,
      notificationCount: emails.length,
      // TODO: Return detailed results with success/failure per user
    };
  },
});

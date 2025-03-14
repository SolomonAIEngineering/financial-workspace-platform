import { resend } from '@/lib/resend';
import { schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
export const disconnectedNotifications = schemaTask({
    id: "disconnected-notifications",
    maxDuration: 300,
    queue: {
        concurrencyLimit: 1,
    },
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
            }),
        ),
    }),
    run: async ({ users }) => {
        const emailPromises = users.map(async ({ user, bankName, teamName }) => {
            // const html = render(
            //     <ConnectionIssueEmail
            //         fullName={user.full_name}
            //         bankName={bankName}
            //         teamName={teamName}
            //     />,
            // );
            const html = `<h1>Hello</h1>`;
            return {
                from: "Solomon AI <hello@solomonai.com>",
                to: [user.email],
                subject: "Bank Connection Expiring Soon",
                html,
            };
        });

        const emails = await Promise.all(emailPromises);

        await resend?.batch.send(emails);
    },
});

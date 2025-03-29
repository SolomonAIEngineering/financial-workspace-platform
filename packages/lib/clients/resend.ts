import { Resend } from 'resend';
import { BusinessConfig as platformConfig } from '@solomonai/platform-config';

export const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

// Define type separately to avoid null issues
type ResendEmailOptions = Parameters<typeof Resend.prototype.emails.send>[0];

export const sendEmailViaResend = async ({
    bcc,
    email,
    from,
    marketing,
    react,
    replyToFromEmail,
    scheduledAt,
    subject,
    text,
}: Omit<ResendEmailOptions, 'from' | 'to'> & {
    email: string;
    from?: string;
    marketing?: boolean;
    replyToFromEmail?: boolean;
}) => {
    if (!resend) {
        console.info(
            'RESEND_API_KEY is not set in the .env. Skipping sending email.'
        );

        return;
    }

    return await resend.emails.send({
        bcc: bcc,
        from:
            from ||
            (marketing
                ? `${platformConfig.email.from.default}`
                : `${platformConfig.email.from.system}`),
        to: email,
        ...(!replyToFromEmail && {
            replyTo: platformConfig.email.replyTo,
        }),
        react: react,
        scheduledAt,
        subject: subject,
        text: text,
        ...(marketing && {
            headers: {
                'List-Unsubscribe': `${platformConfig.platformUrl}/account/settings`,
            },
        }),
    });
};

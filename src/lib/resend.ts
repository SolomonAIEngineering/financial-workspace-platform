import { Resend } from 'resend';

import { env } from '@/env';

export const resend = env.RESEND_API_KEY
  ? new Resend(env.RESEND_API_KEY)
  : null;

// Define type separately to avoid null issues
type ResendEmailOptions = Parameters<typeof Resend.prototype.emails.send>[0];

export const platformConfig = {
  address: {
    city: 'New York',
    state: 'NY',
    street: '1000 Avenue of the Americas, 6th Ave',
    zipCode: '10036',
  },
  company: env.NEXT_PUBLIC_APP_NAME || 'Solomon AI',
  email: {
    from: {
      default: `${env.NEXT_PUBLIC_APP_NAME} <noreply@${process.env.EMAIL_DOMAIN || 'solomon-ai.app'}>`,
      system: `${env.NEXT_PUBLIC_APP_NAME} <system@${process.env.EMAIL_DOMAIN || 'solomon-ai.app'}>`,
    },
    replyTo: `support@${process.env.EMAIL_DOMAIN || 'solomon-ai.app'}`,
  },
  platformUrl: env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
};

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

/**
 * Email sending utility module using Resend service.
 * Provides functionality to send emails through the Resend API with various configuration options.
 * @module send-via-resend
 */

import type { CreateEmailOptions } from 'resend'
import { BusinessConfig as platform } from '@solomonai/platform-config'
import { resend } from '../lib/resend'

/**
 * Sends an email via the Resend service.
 * This function handles the configuration and sending of emails with proper formatting
 * and branding based on the platform configuration. It supports both system and marketing emails.
 *
 * @param options - Email sending options
 * @param options.email - Recipient's email address
 * @param options.subject - Email subject line
 * @param options.from - Sender's email address (optional, defaults based on marketing flag)
 * @param options.bcc - BCC recipients (optional)
 * @param options.replyToFromEmail - Whether to use the 'from' address as reply-to (optional)
 * @param options.text - Plain text content of the email (optional)
 * @param options.react - React component for the email content (optional)
 * @param options.scheduledAt - Scheduled time to send the email (optional)
 * @param options.marketing - Whether this is a marketing email (affects headers and from address) (optional)
 * @returns Promise resolving to the result of the email sending operation, or undefined if Resend is not configured
 */
export const sendEmailViaResend = async ({
  email,
  subject,
  from,
  bcc,
  replyToFromEmail,
  text,
  react,
  scheduledAt,
  marketing,
}: Omit<CreateEmailOptions, 'to' | 'from'> & {
  email: string
  from?: string
  replyToFromEmail?: boolean
  marketing?: boolean
}) => {
  if (!resend) {
    console.info(
      'RESEND_API_KEY is not set in the .env. Skipping sending email.',
    )
    return
  }

  return await resend.emails.send({
    to: email,
    from:
      from ||
      (marketing
        ? `${platform.email.from.default}`
        : `${platform.email.from.system}`),
    bcc: bcc,
    ...(!replyToFromEmail && {
      replyTo: platform.email.replyTo,
    }),
    subject: subject,
    text: text,
    react: react,
    scheduledAt,
    ...(marketing && {
      headers: {
        'List-Unsubscribe': `${platform.platformUrl}/account/settings`,
      },
    }),
  })
}

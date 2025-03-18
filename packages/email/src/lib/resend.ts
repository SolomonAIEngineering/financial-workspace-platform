/**
 * A module for email sending functionality using the Resend service.
 * @module resend
 */

import { BusinessConfig as PlatformConfig } from '@solomonai/platform-config'
import { Resend } from 'resend'

/**
 * Initialized Resend client instance.
 * Returns null if RESEND_API_KEY environment variable is not set.
 */
export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

/**
 * Type definition for Resend email sending options.
 * Defined separately to avoid null issues with the resend client.
 */
type ResendEmailOptions = Parameters<typeof Resend.prototype.emails.send>[0]

/**
 * Sends an email via the Resend service.
 *
 * @param options - The email sending options
 * @param options.bcc - BCC recipients
 * @param options.email - The recipient's email address
 * @param options.from - The sender's email address (optional, defaults to PlatformConfig value)
 * @param options.marketing - Whether this is a marketing email (affects headers and from address)
 * @param options.react - React component to render as email content
 * @param options.replyToFromEmail - Whether to use the from address as reply-to
 * @param options.scheduledAt - When to send the email (for scheduling)
 * @param options.subject - Email subject line
 * @param options.text - Plain text content of the email
 *
 * @returns A promise that resolves to the Resend response or undefined if RESEND_API_KEY is not set
 */
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
  email: string
  from?: string
  marketing?: boolean
  replyToFromEmail?: boolean
}) => {
  if (!resend) {
    console.info(
      'RESEND_API_KEY is not set in the .env. Skipping sending email.',
    )

    return
  }

  return await resend.emails.send({
    bcc: bcc,
    from:
      from ||
      (marketing
        ? `${PlatformConfig.email.from}`
        : `${PlatformConfig.email.from}`),
    to: email,
    ...(!replyToFromEmail && {
      replyTo: PlatformConfig.supportEmail,
    }),
    react: react,
    scheduledAt,
    subject: subject,
    text: text,
    ...(marketing && {
      headers: {
        'List-Unsubscribe': `${PlatformConfig.platformUrl}/account/settings`,
      },
    }),
  })
}

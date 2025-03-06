'use client'

// biome-ignore lint/correctness/noUnusedImports: react-email needs this imported
import * as React from 'react'
import CONSTANTS from '../constants/constants'
import { Layout } from '../src/components/layout'
import { Signature } from '../src/components/signature'

/**
 * Props interface for the SubscriptionEnded email component
 * @interface Props
 * @property {string} username - The username of the recipient
 */
export type Props = {
  username: string
}

/**
 * Email template component for when a user's subscription has ended
 * This component renders an email notification informing users that their subscription
 * has expired and provides options to reactivate their subscription.
 *
 * @component
 * @param {Props} props - Component props
 * @param {string} props.username - The username of the recipient
 *
 * @example
 * ```tsx
 * <SubscriptionEnded username="John Doe" />
 * ```
 *
 * @returns {JSX.Element} A React Email component for subscription ended notification
 *
 * @remarks
 * The email includes:
 * - A header announcing the subscription end
 * - Personalized greeting with the user's name
 * - Information about the subscription downgrade
 * - CTA button to upgrade the subscription
 * - Feedback request section
 * - Signature
 */
export function SubscriptionEnded({ username }: Props) {
  return (
    <Layout>
      <h1 style={{ fontWeight: 600, textAlign: 'center', fontFamily: 'sans-serif', fontSize: '1.875rem' }}>
        Your {CONSTANTS.PLATFORM.NAME} subscription has ended.
      </h1>
      <p>Hey {username},</p>
      <p>
        Your subscription to {CONSTANTS.PLATFORM.NAME} has ended. We're sorry to
        see you go.
      </p>

      <div>
        <p style={{ fontWeight: 600 }}>
          What this means for your account:
        </p>
        <ul>
          <li className="pb-4">
            Your workspace has been downgraded to the free tier
          </li>
          <li className="pb-4">
            Limited to 1k transactions per month and 2.5k verifications
          </li>
          <li className="pb-4">
            Limited to 50 API requests per minute (down from 1,000/minute)
          </li>
        </ul>
      </div>

      <div style={{ padding: '0.75rem 0', textAlign: 'center' }}>
        <a
          href={CONSTANTS.URLS.BILLING}
          style={{ display: 'inline-block', width: '66.666667%', borderRadius: '0.5rem', backgroundColor: '#111827', padding: '0.75rem', color: '#f9fafb', textDecoration: 'none' }}
        >
          Reactivate subscription
        </a>
      </div>

      <hr />

      <p>
        Need help? Please reach out to{' '}
        <a href={`mailto:${CONSTANTS.URLS.SUPPORT_EMAIL}`}>
          {CONSTANTS.URLS.SUPPORT_EMAIL}
        </a>{' '}
        or just reply to this email.
      </p>

      <Signature signedBy={CONSTANTS.SIGNATURE.NAME} />
    </Layout>
  )
}

/**
 * Preview props for the email template
 * These props are used for previewing the email template in development
 *
 * @constant
 * @type {Props}
 */
SubscriptionEnded.PreviewProps = {
  username: 'Mike Wazowski',
} satisfies Props

export default SubscriptionEnded

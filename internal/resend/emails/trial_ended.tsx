'use client'
import { Button } from '@react-email/button'
import { Heading } from '@react-email/heading'
import { Hr } from '@react-email/hr'
import { Link } from '@react-email/link'
import { Section } from '@react-email/section'
import { Text } from '@react-email/text'
// biome-ignore lint/correctness/noUnusedImports: react-email needs this imported
import * as React from 'react'
import CONSTANTS from '../constants/constants'
import { Layout } from '../src/components/layout'
import { Signature } from '../src/components/signature'

/**
 * Props interface for the TrialEnded email component
 * @interface Props
 * @property {string} username - The username of the recipient
 * @property {string} workspaceName - The name of the workspace whose trial has ended
 */
export type Props = {
  username: string
  workspaceName: string
}

/**
 * Email template component for when a workspace's trial period has ended
 * This component renders an email notification informing users about their trial expiration
 * and provides detailed information about Pro plan benefits and upgrade options.
 *
 * @component
 * @param {Props} props - Component props
 * @param {string} props.workspaceName - The name of the workspace whose trial has ended
 * @param {string} props.username - The username of the recipient
 *
 * @example
 * ```tsx
 * <TrialEnded
 *   username="John Doe"
 *   workspaceName="My Workspace"
 * />
 * ```
 *
 * @returns {JSX.Element} A React Email component for trial ended notification
 *
 * @remarks
 * The email includes:
 * - A header announcing the trial end for the specific workspace
 * - Personalized greeting with the user's name
 * - Information about the trial period completion
 * - Detailed list of Pro plan benefits including:
 *   - Monthly active keys quota
 *   - Monthly verifications quota
 *   - Rate limits
 *   - Team features
 *   - Analytics and audit log retention
 * - CTA button for upgrade
 * - Support contact information
 * - Signature
 */
export function TrialEnded({ workspaceName, username }: Props) {
  return (
    <Layout>
      <h1 style={{ fontWeight: 600, textAlign: 'center', fontFamily: 'sans-serif', fontSize: '1.875rem' }}>
        Your workspace <strong>{workspaceName}</strong> has reached the end of
        its trial.
      </h1>
      <p>Hey {username},</p>
      <p>
        We hope you've enjoyed your two-week {CONSTANTS.PLATFORM.NAME} Pro trial
        for your workspace <strong>{workspaceName}</strong>.
      </p>

      <p>
        Since your trial ended, please add a payment method to keep all features
        of the Pro plan.
      </p>

      <div>
        <p style={{ fontWeight: 600 }}>
          It's simple to upgrade and enjoy the benefits of the{' '}
          {CONSTANTS.PLATFORM.NAME} Pro plan:
        </p>
        <ul>
          <li className="pb-4">
            {' '}
            Process up to 1M monthly transactions{' '}
            <span className="text-sm italic">
              (free tier limited to 1k transactions)
            </span>
          </li>
          <li className="pb-4">
            {' '}
            150k monthly payment verifications included{' '}
            <span className="text-sm italic">
              (free tier limited to 2.5k per month)
            </span>
          </li>
          <li className="pb-4">
            {' '}
            Enhanced fraud protection with 2.5M monthly checks{' '}
            <span className="text-sm italic">
              (free tier limited to 100k per month)
            </span>
          </li>
        </ul>
        <p style={{ fontWeight: 600 }}>Pro workspaces also receive:</p>
        <ul>
          <li className="pb-4">
            {' '}
            Unlimited team access for seamless financial operations management
          </li>
          <li className="pb-4"> 90-day detailed transaction analytics</li>
          <li className="pb-4"> 90-day financial audit trail for compliance</li>
          <li className="pb-4"> Priority Support from our financial experts</li>
        </ul>
      </div>

      <div style={{ padding: '0.75rem 0', textAlign: 'center' }}>
        <a
          href={CONSTANTS.URLS.BILLING}
          className="w-2/3 rounded-lg bg-gray-900 p-3 text-gray-50"
          style={{ display: 'inline-block', width: '66.666667%', borderRadius: '0.5rem', backgroundColor: '#111827', padding: '0.75rem', color: '#f9fafb', textDecoration: 'none' }}
        >
          Upgrade now
        </a>
      </div>

      <hr />

      <p>
        Need help? Please reach out to{' '}
        <a href={CONSTANTS.URLS.SUPPORT_EMAIL}>
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
 * These props are used for previewing the email template in development environment
 *
 * @constant
 * @type {Props}
 *
 * @example
 * Used in email preview mode:
 * ```tsx
 * const preview = <TrialEnded {...TrialEnded.PreviewProps} />;
 * ```
 */
TrialEnded.PreviewProps = {
  username: 'Spongebob Squarepants',
  workspaceName: 'Krusty crab',
} satisfies Props

export default TrialEnded

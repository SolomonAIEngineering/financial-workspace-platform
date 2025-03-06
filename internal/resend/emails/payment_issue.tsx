'use client'

// biome-ignore lint/correctness/noUnusedImports: react-email needs this imported
import * as React from 'react'
import CONSTANTS from '../constants/constants'
import { Layout } from '../src/components/layout'
import { Signature } from '../src/components/signature'

/**
 * Props interface for the PaymentIssue email component
 * @interface Props
 * @property {string} username - The username of the recipient
 * @property {string} date - The date when the payment issue occurred
 */
export type Props = {
  username: string
  date: string
}

/**
 * Email template component for notifying users of payment issues
 * This component renders an email notification informing users about
 * payment processing failures and provides instructions to update their
 * payment information.
 *
 * @component
 * @param {Props} props - Component props
 * @param {string} props.username - The name of the user who will receive the email
 * @param {string} props.date - The date when the payment issue occurred
 *
 * @example
 * ```tsx
 * <PaymentIssue
 *   username="John Doe"
 *   date="Tue Dec 10 2024"
 * />
 * ```
 */
export function PaymentIssue({ username, date }: Props) {
  return (
    <Layout>
      <h1
        style={{
          fontWeight: 600,
          textAlign: 'center',
          fontFamily: 'sans-serif',
          fontSize: '1.875rem',
        }}
      >
        {CONSTANTS.TEXT.HEADING}
      </h1>
      <p>Hey {username},</p>
      <p>
        We had trouble processing your payment on {date}. Please update your
        payment information below to prevent your account from being downgraded.
      </p>

      <div style={{ padding: '0.75rem 0', textAlign: 'center' }}>
        <a
          href={CONSTANTS.URLS.BILLING}
          style={{
            display: 'inline-block',
            width: '66.666667%',
            borderRadius: '0.5rem',
            backgroundColor: '#111827',
            padding: '0.75rem',
            color: '#f9fafb',
            textDecoration: 'none',
          }}
        >
          {CONSTANTS.TEXT.BUTTON}
        </a>
      </div>

      <hr />
      <p>
        {CONSTANTS.TEXT.SUPPORT_MESSAGE}{' '}
        <a href={`mailto:${CONSTANTS.URLS.SUPPORT_EMAIL}`}>
          {CONSTANTS.URLS.SUPPORT_EMAIL}
        </a>
      </p>

      <Signature signedBy={CONSTANTS.SIGNATURE.NAME} />
    </Layout>
  )
}

/**
 * Preview props for the PaymentIssue component
 * These props are used when previewing the email template in development
 * @example
 * ```tsx
 * <PaymentIssue {...PaymentIssue.PreviewProps} />
 * ```
 */
PaymentIssue.PreviewProps = {
  username: 'Mr. Yoan Yomba',
  date: new Date().toDateString(),
} satisfies Props

export default PaymentIssue

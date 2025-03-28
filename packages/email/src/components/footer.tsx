/**
 * Email footer component module that provides standard footer contents
 * for all emails sent from the platform.
 * @module components/footer
 */

import { Hr, Link, Text } from '@react-email/components'

import { BusinessConfig as PlatformConfig } from '@solomonai/platform-config'
import { Tailwind } from '@react-email/tailwind'

/**
 * Email footer component that renders differently based on whether it's
 * for a marketing email or a transactional email.
 *
 * For marketing emails, it includes an unsubscribe link.
 * For transactional emails, it includes recipient info and optional notification settings.
 *
 * @param props - Component properties
 * @param props.email - Recipient's email address
 * @param props.marketing - Whether this is for a marketing email (includes unsubscribe link if true)
 * @param props.notificationSettingsUrl - URL for notification settings (optional, only for non-marketing emails)
 * @returns JSX component for email footer
 */
export default function Footer({
  email,
  marketing,
  notificationSettingsUrl,
}: {
  email: string
  marketing?: boolean
  notificationSettingsUrl?: string
}) {
  if (marketing) {
    return (
      <Tailwind>
        <Hr className="mx-0 my-6 w-full border border-gray-200" />
        <Text className="text-[12px] leading-6 text-gray-500">
          We send out product update emails once a month – no spam, no nonsense.
          Don't want to get these emails?{' '}
          <Link
            className="text-gray-700 underline"
            href={`${PlatformConfig.platformUrl}/account/settings`}
          >
            Unsubscribe here.
          </Link>
        </Text>
        <Text className="text-[12px] text-gray-500">
          {PlatformConfig.company}, Inc.
          <br />
          {PlatformConfig.address.street}
          <br />
          {PlatformConfig.address.city}, {PlatformConfig.address.state}{' '}
          {PlatformConfig.address.zipCode}
        </Text>
      </Tailwind>
    )
  }

  return (
    <Tailwind>
      <Hr className="mx-0 my-6 w-full border border-gray-200" />
      <Text className="text-[12px] leading-6 text-gray-500">
        This email was intended for <span className="text-black">{email}</span>.
        If you were not expecting this email, you can ignore this email. If you
        are concerned about your account's safety, please reply to this email to
        get in touch with us.
      </Text>

      {notificationSettingsUrl && (
        <Text className="text-[12px] leading-6 text-gray-500">
          Don't want to get these emails?{' '}
          <Link
            className="text-gray-700 underline"
            href={notificationSettingsUrl}
          >
            Adjust your notification settings
          </Link>
        </Text>
      )}
      <Text className="text-[12px] text-gray-500">
        {PlatformConfig.company}, Inc.
        <br />
        {PlatformConfig.address.street}
        <br />
        {PlatformConfig.address.city}, {PlatformConfig.address.state}{' '}
        {PlatformConfig.address.zipCode}
      </Text>
    </Tailwind>
  )
}

/**
 * Password reset link email template module.
 * Provides a professionally designed email for password recovery
 * with a secure link to reset forgotten passwords.
 * @module reset-password-link
 */

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

import Footer from '@/components/footer'
import { Tailwind } from '@react-email/tailwind'
import { BusinessConfig as platform } from '@solomonai/platform-config'

/**
 * Password reset link React component.
 * This email provides a secure link for users to reset their password
 * when they've forgotten it or need to change it for security reasons.
 * It includes both a button and a text link for accessibility.
 *
 * @param props - Component properties
 * @param props.email - Recipient's email address (defaults to 'panic@thedis.co' if not provided)
 * @param props.url - The password reset URL with a secure token
 * @returns JSX component for the password reset email
 */
export default function ResetPasswordLink({
  email = 'panic@thedis.co',
  url = 'http://localhost:8888/auth/reset-password/adaf8468f590e70bb60fe40983321c2719c7bdc694063bd2437c1f8a53f7c90a',
}: {
  email: string
  url: string
}) {
  return (
    <Html>
      <Head />
      <Preview>Reset Password Link</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-10 max-w-[500px] rounded border border-solid border-gray-200 px-10 py-5">
            <Section className="mt-8">
              <Img
                src={platform.assets.wordmark}
                height="140"
                alt={platform.company}
                className="mx-auto my-0"
              />
            </Section>
            <Heading className="mx-0 my-7 p-0 text-center text-xl font-semibold text-black">
              Reset password link
            </Heading>
            <Text className="text-sm leading-6 text-black">
              You are receiving this email because we received a password reset
              request for your account at {platform.company}.
            </Text>
            <Text className="text-sm leading-6 text-black">
              Please click the button below to reset your password.
            </Text>
            <Section className="my-8 text-center">
              <Link
                className="rounded-full bg-black px-6 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={url}
              >
                Reset Password
              </Link>
            </Section>
            <Text className="text-sm leading-6 text-black">
              or copy and paste this URL into your browser:
            </Text>
            <Text className="max-w-sm flex-wrap break-words font-medium text-purple-600 no-underline">
              {url.replace(/^https?:\/\//, '')}
            </Text>
            <Footer email={email} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

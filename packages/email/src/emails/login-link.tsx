/**
 * Magic login link email template module.
 * Provides a professionally designed email for passwordless authentication
 * using magic links to sign users into their accounts.
 * @module login-link
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

import Footer from '../components/footer'
import { Tailwind } from '@react-email/tailwind'
import { BusinessConfig as platform } from '@solomonai/platform-config'

/**
 * Magic login link React component.
 * This email provides a secure one-time link that allows users to sign in
 * to their account without needing to enter a password. It includes both
 * a button and a text link for accessibility.
 *
 * @param props - Component properties
 * @param props.email - Recipient's email address (defaults to 'panic@thedis.co' if not provided)
 * @param props.url - The magic login URL that authenticates the user
 * @returns JSX component for the magic login link email
 */
export default function LoginLink({
  email = 'panic@thedis.co',
  url = 'http://localhost:8888/api/auth/callback/email?callbackUrl=http%3A%2F%2Fapp.localhost%3A3000%2Flogin&token=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx&email=youremail@gmail.com',
}: {
  email: string
  url: string
}) {
  return (
    <Html>
      <Head />
      <Preview>Your {platform.company} Login Link</Preview>
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
              Your Login Link
            </Heading>
            <Text className="text-sm leading-6 text-black">
              Welcome to {platform.company}!
            </Text>
            <Text className="text-sm leading-6 text-black">
              Please click the magic link below to sign in to your account.
            </Text>
            <Section className="my-8 text-center">
              <Link
                className="rounded-full bg-black px-6 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={url}
              >
                Sign in
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

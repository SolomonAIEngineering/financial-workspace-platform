/**
 * Email verification template module.
 * Provides a professionally designed email for verifying a user's email address
 * during the account creation or email update process.
 * @module verify-email
 */

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components'

import Footer from '../components/footer'
import { Tailwind } from '@react-email/tailwind'
import { BusinessConfig as platform } from '@solomonai/platform-config'

/**
 * Email verification React component.
 * This email provides a verification code for users to confirm their email address,
 * typically during account creation or when updating their email address.
 * The code is displayed prominently and includes an expiration notice.
 *
 * @param props - Component properties
 * @param props.email - Recipient's email address (defaults to 'panic@thedis.co' if not provided)
 * @param props.code - Verification code to display in the email (defaults to '123456' if not provided)
 * @returns JSX component for the email verification email
 */
export default function VerifyEmail({
  email = 'panic@thedis.co',
  code = '123456',
}: {
  email: string
  code: string
}) {
  return (
    <Html>
      <Head />
      <Preview>Your {platform.company} Verification Code</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-10 max-w-[500px] rounded border border-solid border-gray-200 px-10 py-5">
            <Section className="mt-8">
              <Img
                src={platform.assets.logo}
                height="140"
                alt={platform.company}
                className="mx-auto my-0"
              />
            </Section>
            <Heading className="mx-0 my-7 p-0 text-center text-xl font-semibold text-black">
              Please confirm your email address
            </Heading>
            <Text className="mx-auto text-sm leading-6">
              Enter this code on the {platform.company} verify page to complete
              your sign up:
            </Text>
            <Section className="my-8">
              <div className="mx-auto w-fit rounded-xl px-6 py-3 text-center font-mono text-2xl font-semibold tracking-[0.25em]">
                {code}
              </div>
            </Section>
            <Text className="text-sm leading-6 text-black">
              This code expires in 10 minutes.
            </Text>
            <Footer email={email} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

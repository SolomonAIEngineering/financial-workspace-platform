/**
 * Password update confirmation email template module.
 * Provides a professionally designed email to notify users when their password
 * has been successfully updated or reset.
 * @module password-updated
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
 * Password update confirmation React component.
 * This email notifies users when their account password has been changed,
 * either through a password reset or a direct update. It includes security
 * information in case the change was unauthorized.
 *
 * @param props - Component properties
 * @param props.email - Recipient's email address (defaults to 'panic@thedis.co' if not provided)
 * @param props.verb - The action verb to describe what happened to the password ('reset' or 'updated', defaults to 'updated')
 * @returns JSX component for the password update confirmation email
 */
export default function PasswordUpdated({
  email = 'panic@thedis.co',
  verb = 'updated',
}: {
  email: string
  verb?: 'reset' | 'updated'
}) {
  return (
    <Html>
      <Head />
      <Preview>Your password has been {verb}</Preview>
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
              Password has been {verb}
            </Heading>
            <Text className="text-sm leading-6 text-black">
              The password for your {platform.company} account has been
              successfully {verb}.
            </Text>
            <Text className="text-sm leading-6 text-black">
              If you did not make this change or you believe an unauthorised
              person has accessed your account, please contact us immediately to
              secure your account.
            </Text>
            <Footer email={email} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

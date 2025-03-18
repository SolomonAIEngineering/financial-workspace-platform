import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'
import {
  BusinessConfig,
  BusinessConfig as platform,
} from '@solomonai/platform-config'
import { addDays, formatDistance } from 'date-fns'

import Footer from '@/components/footer'
import { Tailwind } from '@react-email/tailwind'
import { AlertCircle } from 'lucide-react'

interface ConnectionExpireEmailProps {
  fullName: string
  email?: string
  expiresAt: string
  bankName: string
  workspaceName: string
  bankLogo?: string
  reconnectUrl: string
  workspaceSlug: string
}

export default function ConnectionExpireEmail({
  fullName = 'Solomon AI',
  email = 'solomon@example.com',
  expiresAt = addDays(new Date(), 4).toISOString(),
  bankName = 'Revolut',
  workspaceName = 'Solomon AI',
  bankLogo = 'https://example.com/bank-logo.png',
  reconnectUrl = 'https://app.example.com/reconnect',
  workspaceSlug = 'solomon-ai',
}: ConnectionExpireEmailProps) {
  const firstName = fullName.split(' ')[0]
  const timeUntilExpiry = formatDistance(new Date(expiresAt), new Date())
  const notificationSettingsUrl = `${platform.platformUrl}/${workspaceSlug}/settings/notifications`

  return (
    <Html>
      <Head />
      <Preview>
        Important: Your {bankName} connection will expire in {timeUntilExpiry}
      </Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-10 max-w-[500px] rounded border border-solid border-gray-200 px-10 py-5">
            <Section className="mt-4 text-center">
              <Img
                className="mx-auto"
                alt={`${BusinessConfig.company} logo`}
                height="140"
                src={BusinessConfig.assets.wordmark}
                width="140"
              />
            </Section>
            <Section className="mt-8 text-center">
              {bankLogo && (
                <Img
                  src={bankLogo}
                  width="140"
                  height="140"
                  alt={bankName}
                  className="mx-auto mb-4"
                />
              )}
              <Row>
                <Column align="center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                  </div>
                </Column>
              </Row>
            </Section>

            <Heading className="mx-0 my-7 p-0 text-center text-xl font-semibold text-black">
              Your {bankName} Connection Will Expire Soon
            </Heading>

            <Text className="text-sm leading-6 text-black">
              Hi {firstName},
              <br />
              <br />
              We wanted to let you know that your connection to {bankName} for
              team <strong>{workspaceName}</strong> will expire in{' '}
              <strong>{timeUntilExpiry}</strong>. To ensure uninterrupted
              service, please take a moment to reconnect your bank account.
            </Text>

            <Section className="my-8">
              <Row>
                <Column className="px-4">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <Text className="m-0 text-sm text-gray-700">
                      • Reconnection takes less than 60 seconds
                      <br />
                      • Your data and settings will remain unchanged
                      <br />• Secure connection using bank-level encryption
                    </Text>
                  </div>
                </Column>
              </Row>
            </Section>

            <Section className="my-8 text-center">
              <Link
                className="rounded-full bg-black px-6 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={reconnectUrl}
              >
                Reconnect {bankName}
              </Link>
            </Section>

            <Text className="text-sm leading-6 text-gray-600">
              If you need any assistance or have questions, simply reply to this
              email. Our support team is here to help.
            </Text>

            <Hr className="my-6 w-full border border-gray-200" />

            <Footer
              email={email}
              notificationSettingsUrl={notificationSettingsUrl}
            />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

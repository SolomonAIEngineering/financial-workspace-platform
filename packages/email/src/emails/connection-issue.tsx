import { ArrowRightCircle, XCircle } from 'lucide-react'
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

import Footer from '../components/footer'
import { Tailwind } from '@react-email/tailwind'

interface ConnectionIssueEmailProps {
  fullName: string
  email?: string
  bankName: string
  workspaceName: string
  bankLogo?: string
  reconnectUrl: string
  appDomain?: string
  lastSyncTime?: string
  workspaceSlug: string
}

export default function ConnectionIssueEmail({
  fullName = 'Solomon AI',
  email = 'solomon@example.com',
  bankName = 'Revolut',
  workspaceName = 'Solomon AI',
  bankLogo = 'https://example.com/bank-logo.png',
  reconnectUrl = 'https://app.example.com/reconnect',
  appDomain = 'example.com',
  lastSyncTime = '2 days ago',
  workspaceSlug = 'solomon-ai',
}: ConnectionIssueEmailProps) {
  const firstName = fullName.split(' ')[0]
  const notificationSettingsUrl = `${platform.platformUrl}/${workspaceSlug}/settings/notifications`

  return (
    <Html>
      <Head />
      <Preview>
        Action Required: Connection issue detected with your {bankName} account
      </Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-10 max-w-[500px] rounded border border-solid border-gray-200 px-10 py-5">
            <Section className="mt-4 text-center">
              <Img
                className="mx-auto"
                alt={`${BusinessConfig.company} logo`}
                height="140"
                src={BusinessConfig.assets.logo}
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
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                </Column>
              </Row>
            </Section>

            <Heading className="mx-0 my-7 p-0 text-center text-xl font-semibold text-black">
              Connection Issue Detected
            </Heading>

            <Text className="text-sm leading-6 text-black">
              Hi {firstName},
              <br />
              <br />
              We've detected that your connection to <strong>
                {bankName}
              </strong>{' '}
              for team <strong>{workspaceName}</strong> is currently
              disconnected.
              {lastSyncTime &&
                ` Your last successful sync was ${lastSyncTime}.`}
            </Text>

            <Section className="my-8">
              <Row>
                <Column className="px-4">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <Text className="m-0 text-sm font-medium text-gray-900">
                      What you need to know:
                    </Text>
                    <Text className="m-0 mt-2 text-sm text-gray-700">
                      • Your data is safe and will resume syncing once
                      reconnected
                      <br />
                      • Reconnection takes less than 60 seconds
                      <br />• This is a common occurrence due to bank security
                      measures
                    </Text>
                  </div>
                </Column>
              </Row>
            </Section>

            <Section className="my-8">
              <Row>
                <Column className="px-4">
                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                    <Row>
                      <Column className="w-8">
                        <ArrowRightCircle className="h-5 w-5 text-blue-600" />
                      </Column>
                      <Column>
                        <Text className="m-0 text-sm text-blue-900">
                          To restore your connection and keep your data up to
                          date, please click the button below to reconnect your
                          account.
                        </Text>
                      </Column>
                    </Row>
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
              Need help? Have questions? Just reply to this email - our support
              team is ready to assist you.
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

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

interface BankReconnectAlertProps {
    fullName?: string
    email?: string
    bankName?: string
    accountNames?: string
    workspaceName?: string
    bankLogo?: string
    reconnectUrl?: string
    workspaceSlug?: string
}

/**
 * Email template for bank reconnection alerts
 * 
 * This email is sent to users when their bank connection requires reconnection
 * to continue syncing financial data.
 */
export default function BankReconnectAlert({
    fullName = 'there',
    email = '',
    bankName = 'your financial institution',
    accountNames = '',
    workspaceName = 'your workspace',
    bankLogo = '',
    reconnectUrl = `${platform.platformUrl}/accounts`,
    workspaceSlug = '',
}: BankReconnectAlertProps) {
    const firstName = fullName.split(' ')[0]
    const notificationSettingsUrl = workspaceSlug ?
        `${platform.platformUrl}/${workspaceSlug}/settings/notifications` :
        `${platform.platformUrl}/settings/notifications`

    return (
        <Html>
            <Head />
            <Preview>
                Action Required: Reconnect Your {bankName} Account
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
                            Account Reconnection Required
                        </Heading>

                        <Text className="text-sm leading-6 text-black">
                            Hello {firstName},
                            <br />
                            <br />
                            We noticed that your connection to <strong>{bankName}</strong> needs to be updated.
                            Without reconnecting, we won't be able to update your account information and transactions.
                        </Text>

                        <Section className="my-8">
                            <Row>
                                <Column className="px-4">
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                        <Text className="m-0 text-sm font-medium text-gray-900">
                                            Affected accounts:
                                        </Text>
                                        <Text className="m-0 mt-2 text-sm text-gray-700">
                                            {accountNames || 'All accounts connected to this institution'}
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
                                                    Please log in to your dashboard and click the "Reconnect" button next to your {bankName}
                                                    connection to update your credentials.
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
                                Go to Dashboard
                            </Link>
                        </Section>

                        <Text className="text-sm leading-6 text-gray-600">
                            Need help? Have questions? Contact our support team for assistance.
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
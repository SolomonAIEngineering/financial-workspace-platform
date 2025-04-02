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

export default function DomainDeleted({
  email = 'finance@example.com',
  domain = `${platform.webUrl}`,
  workspaceSlug = platform.company.toLowerCase(),
}: {
  email: string
  domain: string
  workspaceSlug: string
}) {
  return (
    <Html>
      <Head />
      <Preview>Financial Workspace Domain Deactivated</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-10 max-w-[500px] rounded border border-solid border-gray-200 px-10 py-5">
            <Section className="mt-8">
              <Img
                src={platform.assets.logo}
                height="140"
                width="140"
                alt={platform.company}
                className="mx-auto my-0"
              />
            </Section>
            <Heading className="mx-0 my-7 p-0 text-center text-xl font-semibold text-black">
              Financial Workspace Domain Deactivated
            </Heading>
            <Text className="text-sm leading-6 text-black">
              Your financial management domain <code className="text-purple-600">{domain}</code> for
              your {platform.company} financial workspace{' '}
              <Link
                href={`${platform.platformUrl}/${workspaceSlug}`}
                className="font-medium text-blue-600 no-underline"
              >
                {workspaceSlug}↗
              </Link>{' '}
              has been inactive for 30 days and has been deactivated for security reasons.
            </Text>
            <Text className="text-sm leading-6 text-black">
              This may affect your team's access to financial reports, forecasting tools, and transaction history.
              To restore access to your financial workspace, please reactivate your domain using the link below.
            </Text>
            <Section className="my-8 text-center">
              <Link
                className="rounded-full bg-black px-6 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={`${platform.platformUrl}/${workspaceSlug}/settings/domains`}
              >
                Reactivate Financial Workspace
              </Link>
            </Section>
            <Text className="text-sm leading-6 text-black">
              If this deactivation was intentional as part of closing your financial period or fiscal year,
              no action is required. All your financial data remains securely stored according to your retention policies.
            </Text>
            <Footer email={email} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

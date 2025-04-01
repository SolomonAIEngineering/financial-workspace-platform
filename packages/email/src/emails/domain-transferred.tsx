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

export default function DomainTransferred({
  email = 'finance@example.com',
  domain = `${platform.webUrl}`,
  newWorkspace = {
    name: platform.company,
    slug: platform.company.toLowerCase(),
  },
  linksCount = 50,
}: {
  email: string
  domain: string
  newWorkspace: {
    name: string
    slug: string
  }
  linksCount: number
}) {
  return (
    <Html>
      <Head />
      <Preview>Financial Workspace Domain Transfer Completed</Preview>
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
              Financial Workspace Transfer Completed
            </Heading>
            <Text className="text-sm leading-6 text-black">
              Your financial management domain <code className="text-purple-600">{domain}</code>{' '}
              {linksCount > 0 && (
                <>and its {linksCount > 0 ? linksCount : ''} associated financial records </>
              )}
              has been successfully transferred to the financial workspace{' '}
              <Link
                href={`${platform.platformUrl}/${newWorkspace.slug}/settings/domains`}
                className="font-medium text-blue-600 no-underline"
              >
                {newWorkspace.name}↗
              </Link>
            </Text>
            <Text className="text-sm leading-6 text-black">
              All financial data, including transaction history, reports, and account information
              have been securely migrated to the new workspace. Your team members will need to use
              the new workspace for all financial management activities going forward.
            </Text>
            <Section className="my-8 text-center">
              <Link
                className="rounded-full bg-black px-6 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={`${platform.platformUrl}/${newWorkspace.slug}/dashboard`}
              >
                Access Financial Workspace
              </Link>
            </Section>
            <Footer email={email} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

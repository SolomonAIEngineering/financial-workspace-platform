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

import { Tailwind } from '@react-email/tailwind'
import { BusinessConfig as platform } from '@solomonai/platform-config'
import Footer from '../components/footer'

export default function IntegrationInstalled({
  email = 'panic@thedis.co',
  workspace = {
    name: 'Acme, Inc',
    slug: 'acme',
  },
  integration = {
    name: 'Slack',
    slug: 'slack',
  },
}: {
  email: string
  workspace: {
    name: string
    slug: string
  }
  integration: {
    name: string
    slug: string
  }
}) {
  return (
    <Html>
      <Head />
      <Preview>
        An integration has been added to your {platform.company} workspace
      </Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-10 max-w-[500px] rounded border border-solid border-gray-200 px-10 py-5">
            <Section className="mt-8">
              <Img
                src={platform.assets.wordmark}
                height="140"
                width="140"
                alt={platform.company}
                className="mx-auto my-0"
              />
            </Section>
            <Heading className="mx-0 my-7 p-0 text-center text-xl font-semibold text-black">
              An integration has been added to your workspace
            </Heading>
            <Text className="text-sm leading-6 text-black">
              The <strong>{integration.name}</strong> integration has been added
              to your workspace {workspace.name} on {platform.company}.
            </Text>
            <Section className="mb-8 mt-4 text-center">
              <Link
                className="rounded-full bg-black px-6 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={`${platform.platformUrl}/${workspace.slug}/settings/integrations/${integration.slug}`}
              >
                View installed integration
              </Link>
            </Section>
            <Footer email={email} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

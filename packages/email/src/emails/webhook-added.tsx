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

export default function WebhookAdded({
  email = 'panic@thedis.co',
  workspace = {
    name: 'Acme, Inc',
    slug: 'acme',
  },
  webhook = {
    name: 'My Webhook',
  },
}: {
  email: string
  workspace: {
    name: string
    slug: string
  }
  webhook: {
    name: string
  }
}) {
  return (
    <Html>
      <Head />
      <Preview>New webhook added</Preview>
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
              New webhook added
            </Heading>
            <Text className="text-sm leading-6 text-black">
              Webhook with the name <strong>{webhook.name}</strong> has been
              added to your {platform.company} workspace {workspace.name}.
            </Text>
            <Section className="mb-8 mt-[10%] text-center">
              <Link
                className="rounded-full bg-black px-6 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={`${platform.platformUrl}/${workspace.slug}/settings/webhooks`}
              >
                View Webhook
              </Link>
            </Section>
            <Text className="text-sm leading-6 text-black">
              If you did not create this webhook, you can{' '}
              <Link
                href={`${platform.platformUrl}/${workspace.slug}/settings/webhooks`}
                className="text-black underline"
              >
                <strong>delete this webhook</strong>
              </Link>{' '}
              from your account.
            </Text>
            <Footer email={email} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

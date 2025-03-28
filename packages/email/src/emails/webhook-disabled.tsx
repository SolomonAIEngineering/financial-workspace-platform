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

export default function WebhookDisabled({
  email = 'panic@thedis.co',
  workspace = {
    name: 'Acme, Inc',
    slug: 'acme',
  },
  webhook = {
    id: 'wh_tYedrqsWgNJxUwQOaAnupcUJ1',
    url: 'https://example.com/webhook',
  },
  threshold = 5,
}: {
  email: string
  workspace: {
    name: string
    slug: string
  }
  webhook: {
    id: string
    url: string
  }
  threshold: number
}) {
  return (
    <Html>
      <Head />
      <Preview>Webhook has been disabled</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-10 max-w-[500px] rounded border border-solid border-gray-200 px-10 py-5">
            <Section className="mt-8">
              <Img
                src="https://assets.solomon-ai.app/logo.png"
                height="140"
                alt="Think Thank"
                className="mx-auto my-0"
              />
            </Section>
            <Heading className="mx-0 my-7 p-0 text-center text-xl font-semibold text-black">
              Webhook has been disabled
            </Heading>
            <Text className="text-sm leading-6 text-black">
              Your webhook <strong>{webhook.url}</strong> has failed to deliver
              successfully {threshold} times in a row and has been deactivated
              to prevent further issues.
            </Text>
            <Text className="text-sm leading-6 text-black">
              Please review the webhook details and update the URL if necessary
              to restore functionality.
            </Text>
            <Section className="mb-8 mt-4 text-center">
              <Link
                className="rounded-full bg-black px-6 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={`${platform.platformUrl}/${workspace.slug}/settings/webhooks/${webhook.id}/edit`}
              >
                Edit Webhook
              </Link>
            </Section>
            <Footer email={email} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

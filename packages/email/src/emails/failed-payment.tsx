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

export default function FailedPayment({
  user = { name: 'Brendon Urie', email: 'panic@thedis.co' },
  workspace = { name: platform.company, slug: platform.company.toLowerCase() },
  amountDue = 2400,
  attemptCount = 2,
}: {
  user: { name?: string | null; email: string }
  workspace: {
    name: string
    slug: string
  }
  amountDue: number
  attemptCount: number
}) {
  const title = `${
    attemptCount === 2
      ? '2nd notice: '
      : attemptCount === 3
        ? '3rd notice: '
        : ''
  }Your payment for ${platform.company} failed`

  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
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
              {attemptCount === 2 ? '2nd ' : attemptCount === 3 ? '3rd  ' : ''}
              Failed Payment for {platform.company}
            </Heading>
            <Text className="text-sm leading-6 text-black">
              Hey{user.name ? `, ${user.name}` : ''}!
            </Text>
            <Text className="text-sm leading-6 text-black">
              Your payment of{' '}
              <code className="text-purple-600">${amountDue / 100}</code> for
              your {platform.company} workspace{' '}
              <code className="text-purple-600">{workspace.name}</code> has
              failed. Please update your payment information using the link
              below:
            </Text>
            <Section className="my-8 text-center">
              <Link
                className="rounded-full bg-black px-6 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={`${platform.platformUrl}/${workspace.slug}/settings/billing`}
              >
                Update payment information
              </Link>
            </Section>
            <Text className="text-sm leading-6 text-black">
              If you have any questions, feel free to respond to this email –
              we're happy to help!
            </Text>
            <Footer email={user.email} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

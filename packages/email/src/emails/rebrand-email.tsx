import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
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

export default function RebrandEmail({
  name = 'Brendon Urie',
  email = 'panic@thedis.co',
}: {
  name: string | null
  email: string
}) {
  return (
    <Html>
      <Head />
      <Preview>
        Today, we're thrilled to announce our rebrand. We are now{' '}
        {platform.company}.
      </Preview>
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
              🚀 Exciting Brand Evolution: {platform.company}​.sh →{' '}
              {platform.company}​.co ✨
            </Heading>
            <Text className="text-sm leading-6 text-black">
              We're thrilled to share an important milestone in our journey! As
              part of our continuous evolution and commitment to providing you
              with the best possible experience, we're embarking on an exciting
              brand transformation.
            </Text>
            <Text className="text-sm leading-6 text-black">
              You can learn more about the rebrand and what's changing{' '}
              <Link
                href={`${platform.webUrl}/blog/rebrand`}
                className="font-medium text-blue-600 no-underline"
              >
                in this blog post
              </Link>
              .
            </Text>
            <Section className="my-8">
              <Img
                src={platform.assets.thumbnail}
                alt={platform.company}
                className="max-w-[500px]"
              />
            </Section>
            <Text className="text-sm leading-6 text-black">
              Hey{name ? ` ${name}` : ' there'}!
            </Text>
            <Text className="text-sm leading-6 text-black">
              My name is {platform.founderFirstName}, and I'm the founder of{' '}
              {platform.company}. Today, I have some exciting news to share with
              you.
            </Text>
            <Text className="text-sm font-bold leading-6 text-black">
              {platform.company}​.sh is rebranding to {platform.company}​.co.
            </Text>
            <Text className="text-sm leading-6 text-black">
              You can learn more about the rebrand and what's changing{' '}
              <Link
                href={`${platform.webUrl}/blog/rebrand`}
                className="font-medium text-blue-600 no-underline"
              >
                in this blog post
              </Link>
              .
            </Text>
            <Text className="text-sm leading-6 text-black">
              Moving forward, we'll also be sending product update emails from{' '}
              <strong>{platform.company}​.co</strong> instead of{' '}
              <strong>{platform.company}​.sh</strong>. We'd appreciate it if you
              can add <strong>{platform.company}​.co</strong> to your email
              whitelist to ensure you receive our emails.
            </Text>
            <Hr />
            <Text className="text-sm leading-6 text-black">
              Along with the rebrand, we've also been working on a multitude of
              new features. In the last 30 days, we rolled out 9 major updates:
            </Text>
            <Text className="ml-1 text-sm leading-6 text-black">
              ◆{' '}
              <Link
                href={`${platform.webUrl}/blog/migration-assistants`}
                className="font-bold text-blue-600 no-underline"
              >
                Migration Assistants
              </Link>{' '}
              for Bitly and Short​.io
            </Text>
            <Text className="ml-1 text-sm leading-6 text-black">
              ◆{' '}
              <Link
                href={`${platform.webUrl}/help`}
                className="font-bold text-blue-600 no-underline"
              >
                {platform.company} Help Center
              </Link>{' '}
              - a one-stop shop for all your {platform.company} questions
            </Text>
            <Text className="ml-1 text-sm leading-6 text-black">
              ◆ <strong>Geo Targeting</strong> - Redirect visitors based on
              their location
            </Text>
            <Text className="ml-1 text-sm leading-6 text-black">
              ◆ <strong>Link comments</strong> - Leave comments on your links
            </Text>
            <Text className="ml-1 text-sm leading-6 text-black">
              ◆ <strong>Link Cloaking</strong> – Mask your destination URL
            </Text>
            <Text className="ml-1 text-sm leading-6 text-black">
              ◆ <strong>Custom QR Codes</strong> – Available on the Pro plan
            </Text>
            <Text className="ml-1 text-sm leading-6 text-black">
              ◆ <strong>Custom Social Media Cards</strong>
            </Text>
            <Text className="ml-1 text-sm leading-6 text-black">
              ◆ <strong>Detailed Link Stats</strong>
            </Text>
            <Text className="ml-1 text-sm leading-6 text-black">
              ◆ <strong>Link Pagination</strong>
            </Text>
            <Text className="text-sm leading-6 text-black">
              Check out our{' '}
              <Link
                href={`${platform.webUrl}/changelog`}
                className="font-medium text-blue-600 no-underline"
              >
                changelog
              </Link>{' '}
              to see what's new on {platform.company}.
            </Text>

            <Text className="text-sm leading-6 text-black">
              Let me know if you have any questions or feedback. I'm always
              happy to help!
            </Text>
            <Text className="text-sm font-light leading-6 text-gray-400">
              {platform.founderFirstName} from {platform.company}
            </Text>

            <Footer email={email} marketing />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

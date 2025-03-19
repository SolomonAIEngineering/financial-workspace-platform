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

export default function DomainClaimed({
  email = 'panic@thedis.co',
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
      <Preview>Successfully claimed your .link domain!</Preview>
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
              Successfully claimed your .link domain!
            </Heading>
            <Text className="text-sm leading-6 text-black">
              Congratulations! You have successfully claimed your free{' '}
              <code className="text-purple-600">{domain}</code> domain for your
              {platform.company} workspace{' '}
              <Link
                href={`${platform.platformUrl}/${workspaceSlug}`}
                className="font-medium text-blue-600 no-underline"
              >
                {workspaceSlug}↗
              </Link>
              .
            </Text>
            <Section className="my-8 text-center">
              <Link
                className="rounded-full bg-black px-6 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={`${platform.platformUrl}/${workspaceSlug}/settings/domains`}
              >
                Manage your domain
              </Link>
            </Section>
            <Text className="text-sm leading-6 text-black">
              Once the domain is fully provisioned, you can start creating links
              with it. This process can take anywhere between a few minutes to
              an hour.
            </Text>
            <Text className="text-sm leading-6 text-black">
              If your domain is not active after 1 hour, please reply to this
              email and we will look into it.
            </Text>
            <Footer email={email} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

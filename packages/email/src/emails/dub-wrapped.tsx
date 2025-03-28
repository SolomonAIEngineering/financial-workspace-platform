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

import Footer from '../components/footer'
import { Tailwind } from '@react-email/tailwind'
import { nFormatter } from '../utils/nformatter'
import { BusinessConfig as platform } from '@solomonai/platform-config'

export default function WrappedEmail({
  email = 'panic@thedis.co',
  workspace = {
    name: platform.company,
    slug: platform.company.toLowerCase(),
    logo: platform.assets.logo,
  },
  stats = {
    'Total Accounts': 1429,
    'Total Clicks': 425319,
  },
  topCountries = [
    {
      item: 'US',
      count: 23049,
    },
    {
      item: 'GB',
      count: 12345,
    },
    {
      item: 'CA',
      count: 10000,
    },
    {
      item: 'DE',
      count: 9000,
    },
    {
      item: 'FR',
      count: 8000,
    },
  ],
}: {
  email: string
  workspace: {
    name: string
    slug: string
    logo?: string | null
  }
  stats: {
    'Total Accounts': number
    'Total Clicks': number
  }
  topCountries: {
    item: string
    count: number
  }[]
}) {
  const platformStatistics = [
    {
      item: '126M clicks tracked',
      increase: '+900%',
    },
    {
      item: '700K links created',
      increase: '+400%',
    },
    {
      item: '56K new users',
      increase: '+360%',
    },
    {
      item: '5.5K custom domains',
      increase: '+500%',
    },
  ]

  const shippedItems = [
    {
      title: `${platform.company} API General Availability`,
      description: `Our ${platform.company} API went GA, allowing you to build your powerful integrations with ${platform.company}. We also launched <b>native SDKs in 5 different languages</b>: TypeScript, Python, Ruby, PHP, and Go.`,
      image: '',
      cta: {
        text: 'Read the announcement',
        href: `${platform.webUrl}/blog/oppulence-api`,
      },
    },
  ]

  return (
    <Html>
      <Head />
      <Preview>
        In 2024, you created{' '}
        {nFormatter(stats['Total Accounts'], { full: true })} accounts on{' '}
        {platform.company} and got{' '}
        {nFormatter(stats['Total Clicks'], { full: true })} clicks.
      </Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-10 max-w-[500px] rounded border border-solid border-gray-200 px-10 py-5">
            <Section className="mt-8">
              <Img
                src={platform.assets.logo}
                height="140"
                width="140"
                alt={platform.company}
                className="my-0"
              />
            </Section>
            <Heading className="mx-0 mb-4 mt-8 p-0 text-xl font-semibold text-black">
              {platform.company} Year in Review 🎊
            </Heading>
            <Text className="text-sm leading-6 text-black">
              As we put a wrap on 2024, we wanted to say thank you for your
              support! Here's a look back at your activity in 2024:
            </Text>

            <Section className="my-8 rounded-lg border border-solid border-gray-200 py-[3%]">
              <div>
                <div className="text-center">
                  <Text className="mt-1 text-xl font-semibold">
                    {workspace.name}
                  </Text>
                </div>
              </div>
              <Row className="w-full px-4 py-2">
                {Object.entries(stats).map(([key, value]) => (
                  <StatCard key={key} title={key} value={value} />
                ))}
              </Row>
              <div className="grid gap-2 px-4">
                <StatTable
                  title="Top Countries"
                  value={topCountries}
                  workspaceSlug={workspace.slug}
                />
              </div>
            </Section>

            <Heading className="mx-0 mb-4 mt-8 p-0 text-xl font-semibold text-black">
              Your contribution 📈
            </Heading>
            <Text className="text-sm leading-6 text-black">
              Thanks to customers like you, we had an incredible year as well,
              seeing record activity:
            </Text>
            {platformStatistics.map((stat) => (
              <Text
                key={stat.item}
                className="ml-1 text-sm font-medium leading-4 text-black"
              >
                ◆ {stat.item}{' '}
                <span className="font-semibold text-green-700">
                  ({stat.increase})
                </span>
              </Text>
            ))}

            <Hr className="mx-0 my-6 w-full border border-gray-200" />

            <Heading className="mx-0 mb-4 mt-8 p-0 text-xl font-semibold text-black">
              What we shipped 🚢
            </Heading>
            <Text className="text-sm leading-6 text-black">
              Here's a rundown of what we shipped in 2024:
            </Text>

            {shippedItems.map((item) => (
              <div key={item.title} className="mb-8">
                <Text className="text-lg font-semibold text-black">
                  {item.title}
                </Text>
                <Text
                  className="leading-6 text-gray-600"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
                  dangerouslySetInnerHTML={{ __html: item.description }}
                />
                <Link
                  href={item.cta.href}
                  className="rounded-md bg-black px-4 py-1.5 text-sm font-medium text-white"
                >
                  {item.cta.text}
                </Link>
              </div>
            ))}

            <Hr className="mx-0 my-6 w-full border border-gray-200" />

            <Text className="text-sm leading-6 text-black">
              You can also check out more updates on our{' '}
              <Link
                href="https://oppulence.app/blog"
                className="text-black underline underline-offset-2"
              >
                blog
              </Link>{' '}
              and{' '}
              <Link
                href="https://oppulence.app/changelog"
                className="text-black underline underline-offset-2"
              >
                changelog
              </Link>
              .
              <br />
              <br />
              Thank you again, and happy holidays!
            </Text>
            <Img
              src={`${platform.assetsUrl}/signature.png`}
              alt="Email signature"
              className="max-w-[200px]"
            />
            <Text className="text-sm leading-6 text-black">
              and the {platform.company} team 🎄
            </Text>

            <Footer email={email} marketing />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

const StatCard = ({
  title,
  value,
}: {
  title: string
  value: number | string
}) => {
  return (
    <Column className="text-center">
      <Text className="font-medium text-gray-400">{title}</Text>
      <Text className="-mt-3 text-lg font-medium text-black">
        {typeof value === 'number' ? nFormatter(value, { full: true }) : value}
      </Text>
    </Column>
  )
}

const StatTable = ({
  title,
  value,
  workspaceSlug,
}: {
  title: string
  value: { item: string; count: number }[]
  workspaceSlug: string
}) => {
  return (
    <Section>
      <Text className="mb-0 font-medium text-gray-400">{title}</Text>
      {value.map(({ item, count }, index) => {
        const [domain, ...pathParts] = item.split('/')
        const path = pathParts.join('/') || '_root'
        return (
          <div
            key={`${index} - ${item} - ${Math.random()}`}
            className="text-sm"
          >
            <Row>
              {title === 'Top Countries' && (
                <Column width={24}>
                  <Img
                    src={`https://wsrv.nl/?url=https://hatscripts.github.io/circle-flags/flags/${item.toLowerCase()}.svg`}
                    height="16"
                  />
                </Column>
              )}
              <Column align="right" className="text-gray-600">
                {nFormatter(count, { full: count < 99999 })}
              </Column>
            </Row>
            {index !== value.length - 1 && (
              <Hr className="my-0 w-full border border-gray-200" />
            )}
          </div>
        )
      })}
    </Section>
  )
}

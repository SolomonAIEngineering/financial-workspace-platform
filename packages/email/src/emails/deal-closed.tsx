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
import { currencyFormatter } from '../utils/currency-formatter'

export default function DealClosed({
  email = 'panic@thedis.co',
  deal = {
    company: 'Acme Corp',
    value: 50000,
    type: 'New Business',
    salesRep: 'Jane Doe',
    closingDate: '2024-03-15',
  },
  workspace = {
    name: 'Sales Team',
    slug: 'sales',
  },
}: {
  email: string
  deal: {
    company: string
    value: number
    type: string
    salesRep: string
    closingDate: string
  }
  workspace: {
    name: string
    slug: string
  }
}) {
  const formattedValue = currencyFormatter(deal.value, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  return (
    <Html>
      <Head />
      <Preview>
        🎉 Deal Closed: {deal.company} - {formattedValue} 🌟
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
              🎉 Deal Closed Successfully! 🌟
            </Heading>
            <Text className="text-sm leading-6 text-black">
              Incredible achievement! 🎯 We're thrilled to announce another
              successful deal closure. This win not only strengthens our growing
              portfolio but also showcases the exceptional effectiveness of our
              sales strategy. The team's dedication and expertise have delivered
              outstanding results once again. Here are the exciting details:
            </Text>
            <Section className="my-8">
              <Text className="text-sm leading-6 text-black">
                <strong>Company:</strong> {deal.company}
                <br />
                <strong>Deal Value:</strong> {formattedValue}
                <br />
                <strong>Deal Type:</strong> {deal.type}
                <br />
                <strong>Sales Rep:</strong> {deal.salesRep}
                <br />
                <strong>Closing Date:</strong> {deal.closingDate}
              </Text>
            </Section>
            <Section className="mb-8 text-center">
              <Link
                className="rounded-full bg-black px-6 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={`${platform.platformUrl}/${workspace.slug}/deals`}
              >
                View Deal Details
              </Link>
            </Section>
            <Footer email={email} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

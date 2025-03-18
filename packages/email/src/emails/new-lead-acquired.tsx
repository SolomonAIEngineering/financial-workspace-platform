/**
 * New lead acquisition notification email template module.
 * Provides a professionally designed email for notifying sales teams about
 * newly identified leads with detailed information to facilitate timely follow-up.
 * @module new-lead-acquired
 */

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

import Footer from '@/components/footer'
import { Tailwind } from '@react-email/tailwind'
import { BusinessConfig as platform } from '@solomonai/platform-config'

/**
 * New lead acquisition notification email React component.
 * This email alerts sales teams about new leads captured through various channels,
 * providing comprehensive lead details, engagement metrics, areas of interest,
 * and suggested follow-up actions to maximize conversion opportunities.
 *
 * @param props - Component properties
 * @param props.email - Recipient's email address (defaults to 'panic@thedis.co')
 * @param props.workspace - Information about the workspace/team
 * @param props.workspace.name - Name of the workspace/team (defaults to 'Sales Team')
 * @param props.workspace.slug - URL-friendly identifier for the workspace (defaults to 'sales')
 * @param props.workspace.logo - URL of the workspace logo (optional, defaults to platform logo)
 * @param props.lead - Information about the newly acquired lead
 * @param props.lead.name - Full name of the lead (defaults to 'John Smith')
 * @param props.lead.title - Job title of the lead (defaults to 'VP of Engineering')
 * @param props.lead.company - Company name of the lead (defaults to 'Tech Innovators Inc.')
 * @param props.lead.email - Email address of the lead (defaults to 'john.smith@techinnovators.com')
 * @param props.lead.phone - Phone number of the lead (defaults to '+1 (555) 123-4567')
 * @param props.lead.source - Lead acquisition source (defaults to 'Website Contact Form')
 * @param props.lead.score - Lead score value indicating potential value (defaults to 85)
 * @param props.lead.interests - Array of interest areas expressed by the lead
 * @param props.lead.engagement - Object containing engagement metrics
 * @param props.lead.engagement.pagesViewed - Number of website pages viewed by the lead
 * @param props.lead.engagement.timeSpent - Amount of time spent on the website
 * @param props.lead.engagement.downloadedContent - Content downloaded by the lead
 * @param props.lead.engagement.lastVisit - Timestamp of the lead's last website visit
 * @param props.lead.suggestedActions - Array of recommended follow-up actions
 * @returns JSX component for the new lead acquisition notification email
 */
export default function NewLeadAcquired({
  email = 'panic@thedis.co',
  workspace = {
    name: 'Sales Team',
    slug: 'sales',
    logo: platform.assets.logo,
  },
  lead = {
    name: 'John Smith',
    title: 'VP of Engineering',
    company: 'Tech Innovators Inc.',
    email: 'john.smith@techinnovators.com',
    phone: '+1 (555) 123-4567',
    source: 'Website Contact Form',
    score: 85,
    interests: [
      'Enterprise Solutions',
      'API Integration',
      'Custom Development',
    ],
    engagement: {
      pagesViewed: 12,
      timeSpent: '15 minutes',
      downloadedContent: 'API Documentation',
      lastVisit: '2024-03-15 14:30 PST',
    },
    suggestedActions: [
      'Schedule initial discovery call',
      'Share relevant case studies',
      'Send product demo invitation',
      'Prepare custom solution proposal',
    ],
  },
}: {
  email: string
  workspace: {
    name: string
    slug: string
    logo?: string | null
  }
  lead: {
    name: string
    title: string
    company: string
    email: string
    phone: string
    source: string
    score: number
    interests: string[]
    engagement: {
      pagesViewed: number
      timeSpent: string
      downloadedContent: string
      lastVisit: string
    }
    suggestedActions: string[]
  }
}) {
  const stats = {
    'Lead Score': lead.score.toString(),
    'Pages Viewed': lead.engagement.pagesViewed.toString(),
    'Time Spent': lead.engagement.timeSpent,
  }

  return (
    <Html>
      <Head />
      <Preview>
        New Lead Alert: {lead.name} from {lead.company} - Lead Score:{' '}
        {lead.score.toString()}
      </Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-10 max-w-[500px] rounded border border-solid border-gray-200 px-10 py-5">
            <Section className="mt-8">
              <Img
                src={platform.assets.wordmark}
                height="32"
                alt={platform.company}
                className="my-0"
              />
            </Section>
            <Heading className="mx-0 mb-4 mt-8 p-0 text-xl font-semibold text-black">
              New Lead Acquired! 🎯
            </Heading>
            <Text className="text-sm leading-6 text-black">
              A promising new lead has been identified! Based on their
              engagement patterns and profile, this prospect shows strong
              potential for conversion. Here's everything you need to know to
              take action.
            </Text>

            <Section className="my-8 rounded-lg border border-solid border-gray-200 p-2">
              <div>
                <div className="text-center">
                  {workspace.logo && (
                    <Img
                      src={workspace.logo}
                      height="36"
                      alt={workspace.name}
                      className="mx-auto rounded-lg"
                    />
                  )}
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
            </Section>

            <Heading className="mx-0 mb-4 mt-8 p-0 text-xl font-semibold text-black">
              Lead Profile 👤
            </Heading>
            <Text className="mb-4 text-sm leading-6 text-black">
              Detailed information about the lead to help you understand their
              background and potential fit.
            </Text>
            <Section className="my-4">
              <div className="rounded-lg border border-solid border-gray-200 p-4">
                <Row>
                  <Column className="px-2">
                    <Text className="m-0 text-sm font-medium text-gray-500">
                      Name
                    </Text>
                    <Text className="m-0 text-base font-medium">
                      {lead.name}
                    </Text>
                  </Column>
                  <Column className="px-2">
                    <Text className="m-0 text-sm font-medium text-gray-500">
                      Title
                    </Text>
                    <Text className="m-0 text-base font-medium">
                      {lead.title}
                    </Text>
                  </Column>
                  <Column className="px-2">
                    <Text className="m-0 text-sm font-medium text-gray-500">
                      Company
                    </Text>
                    <Text className="m-0 text-base font-medium">
                      {lead.company}
                    </Text>
                  </Column>
                </Row>
                <Hr className="my-4 border-gray-200" />
                <Row>
                  <Column className="px-2">
                    <Text className="m-0 text-sm font-medium text-gray-500">
                      Email
                    </Text>
                    <Text className="m-0 text-base font-medium">
                      {lead.email}
                    </Text>
                  </Column>
                  <Column className="px-2">
                    <Text className="m-0 text-sm font-medium text-gray-500">
                      Phone
                    </Text>
                    <Text className="m-0 text-base font-medium">
                      {lead.phone}
                    </Text>
                  </Column>
                  <Column className="px-2">
                    <Text className="m-0 text-sm font-medium text-gray-500">
                      Source
                    </Text>
                    <Text className="m-0 text-base font-medium">
                      {lead.source}
                    </Text>
                  </Column>
                </Row>
              </div>
            </Section>

            <Heading className="mx-0 mb-4 mt-8 p-0 text-xl font-semibold text-black">
              Areas of Interest 🎯
            </Heading>
            <Text className="mb-4 text-sm leading-6 text-black">
              Based on their engagement, these are the key areas of interest
              that should guide your initial outreach strategy.
            </Text>
            <Section className="my-4">
              <div className="rounded-lg border border-solid border-gray-200 p-4">
                {lead.interests.map((interest, index) => (
                  <Text
                    key={`${index}-${interest}-${Math.random()}`}
                    className="m-0 mb-2 text-sm"
                  >
                    {index + 1}. {interest}
                  </Text>
                ))}
              </div>
            </Section>

            <Heading className="mx-0 mb-4 mt-8 p-0 text-xl font-semibold text-black">
              Engagement Details 📊
            </Heading>
            <Text className="mb-4 text-sm leading-6 text-black">
              Recent interactions and engagement metrics that indicate high
              interest and readiness for follow-up.
            </Text>
            <Section className="my-4">
              <div className="rounded-lg border border-solid border-gray-200 p-4">
                <Row>
                  <Column className="px-2">
                    <Text className="m-0 text-sm font-medium text-gray-500">
                      Pages Viewed
                    </Text>
                    <Text className="m-0 text-base font-medium">
                      {lead.engagement.pagesViewed}
                    </Text>
                  </Column>
                  <Column className="px-2">
                    <Text className="m-0 text-sm font-medium text-gray-500">
                      Time Spent
                    </Text>
                    <Text className="m-0 text-base font-medium">
                      {lead.engagement.timeSpent}
                    </Text>
                  </Column>
                </Row>
                <Hr className="my-4 border-gray-200" />
                <Row>
                  <Column className="px-2">
                    <Text className="m-0 text-sm font-medium text-gray-500">
                      Downloaded
                    </Text>
                    <Text className="m-0 text-base font-medium">
                      {lead.engagement.downloadedContent}
                    </Text>
                  </Column>
                  <Column className="px-2">
                    <Text className="m-0 text-sm font-medium text-gray-500">
                      Last Visit
                    </Text>
                    <Text className="m-0 text-base font-medium">
                      {lead.engagement.lastVisit}
                    </Text>
                  </Column>
                </Row>
              </div>
            </Section>

            <Heading className="mx-0 mb-4 mt-8 p-0 text-xl font-semibold text-black">
              Recommended Actions 📋
            </Heading>
            <Text className="mb-4 text-sm leading-6 text-black">
              Based on the lead's profile and engagement, here are the suggested
              next steps to maximize conversion potential.
            </Text>
            <Section className="my-4">
              <div className="rounded-lg border border-solid border-gray-200 p-4">
                {lead.suggestedActions.map((action, index) => (
                  <Text
                    key={`${index}-${action}-${Math.random()}`}
                    className="m-0 mb-2 text-sm"
                  >
                    {index + 1}. {action}
                  </Text>
                ))}
              </div>
            </Section>

            <Text className="mb-4 mt-8 text-sm leading-6 text-black">
              This lead shows strong potential based on their engagement
              patterns and profile. Quick follow-up is recommended to maintain
              momentum and maximize conversion chances.
            </Text>

            <Section className="mb-8 mt-8 text-center">
              <Link
                className="rounded-full bg-black px-6 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={`${platform.platformUrl}/${workspace.slug}/leads`}
              >
                View Lead Details
              </Link>
            </Section>
            <Footer email={email} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

/**
 * Stat card component for displaying lead statistics.
 * Renders a single statistic with an appropriate label.
 *
 * @param props - Component properties
 * @param props.title - Title/label of the statistic
 * @param props.value - Value of the statistic (formatted as a string)
 * @returns JSX component for a single stat card
 */
const StatCard = ({ title, value }: { title: string; value: string }) => {
  return (
    <Column className="text-center">
      <Text className="font-medium text-gray-400">{title}</Text>
      <Text className="-mt-3 text-lg font-medium text-black">{value}</Text>
    </Column>
  )
}

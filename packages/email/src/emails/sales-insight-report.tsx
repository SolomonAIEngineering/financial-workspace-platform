/**
 * Sales insight report email template module.
 * Provides a professionally designed email for delivering data-driven insights,
 * trend analysis, and strategic recommendations to optimize sales performance.
 * @module sales-insight-report
 */

import {
  Body,
  Column,
  Container,
  Head,
  Heading,
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
 * Sales insight report email React component.
 * This email provides sales teams with comprehensive analysis of their performance data,
 * highlighting key trends, success factors, product performance, common objections,
 * and actionable recommendations to improve sales effectiveness.
 *
 * @param props - Component properties
 * @param props.email - Recipient's email address (defaults to 'panic@thedis.co')
 * @param props.workspace - Information about the workspace/team
 * @param props.workspace.name - Name of the workspace/team (defaults to 'Sales Team')
 * @param props.workspace.slug - URL-friendly identifier for the workspace (defaults to 'sales')
 * @param props.workspace.logo - URL of the workspace logo (optional, defaults to platform logo)
 * @param props.report - Sales insight report data
 * @param props.report.period - Time period of the analysis (defaults to 'Last 30 Days')
 * @param props.report.summary - Object containing key performance metrics
 * @param props.report.summary.totalDeals - Total number of deals in the pipeline during the period
 * @param props.report.summary.closedWon - Number of successfully closed deals
 * @param props.report.summary.revenue - Total revenue generated from closed deals
 * @param props.report.summary.avgDealSize - Average monetary value of closed deals
 * @param props.report.summary.conversionRate - Percentage of deals that resulted in a win
 * @param props.report.trends - Object containing trend analysis data
 * @param props.report.trends.dealVelocity - Description of change in deal closing speed
 * @param props.report.trends.topProducts - Array of best-performing products/services
 * @param props.report.trends.commonObjections - Array of frequently encountered sales objections
 * @param props.report.trends.winFactors - Array of elements that contributed to successful deals
 * @param props.report.recommendations - Array of actionable suggestions based on the analysis
 * @returns JSX component for the sales insight report email
 */
export default function SalesInsightReport({
  email = 'panic@thedis.co',
  workspace = {
    name: 'Sales Team',
    slug: 'sales',
    logo: platform.assets.logo,
  },
  report = {
    period: 'Last 30 Days',
    summary: {
      totalDeals: 45,
      closedWon: 28,
      revenue: 125000,
      avgDealSize: 4464,
      conversionRate: '62%',
    },
    trends: {
      dealVelocity: 'Increased by 15%',
      topProducts: ['Enterprise Suite', 'Professional Plan', 'API Access'],
      commonObjections: [
        'Price point',
        'Implementation time',
        'Feature parity',
      ],
      winFactors: ['Product demo', 'ROI calculation', 'Technical review'],
    },
    recommendations: [
      'Focus on Enterprise Suite demos',
      'Highlight implementation support',
      'Emphasize ROI calculator in pitches',
      'Address price objections early',
    ],
  },
}: {
  email: string
  workspace: {
    name: string
    slug: string
    logo?: string | null
  }
  report: {
    period: string
    summary: {
      totalDeals: number
      closedWon: number
      revenue: number
      avgDealSize: number
      conversionRate: string
    }
    trends: {
      dealVelocity: string
      topProducts: string[]
      commonObjections: string[]
      winFactors: string[]
    }
    recommendations: string[]
  }
}) {
  const stats = {
    'Total Deals': report.summary.totalDeals.toString(),
    'Closed Won': report.summary.closedWon.toString(),
    Revenue: `$${report.summary.revenue.toLocaleString()}`,
    Conversion: report.summary.conversionRate,
  }

  const dealMetrics = {
    'Avg Deal Size': `$${report.summary.avgDealSize.toLocaleString()}`,
    'Deal Velocity': report.trends.dealVelocity,
  }

  return (
    <Html>
      <Head />
      <Preview>
        Sales Insights Report: {report.period} -{' '}
        {report.summary.closedWon.toString()} deals closed, $
        {report.summary.revenue.toLocaleString()} revenue
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
              Sales Insights Report 📊
            </Heading>
            <Text className="text-sm leading-6 text-black">
              We've analyzed your sales performance data for {report.period} and
              identified key trends, patterns, and opportunities. This report
              provides actionable insights to help optimize your sales strategy
              and improve outcomes.
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
              Deal Performance 📈
            </Heading>
            <Text className="mb-4 text-sm leading-6 text-black">
              Analysis of your deal metrics reveals important patterns in sales
              velocity and deal size. Understanding these metrics can help
              optimize your sales process and resource allocation.
            </Text>
            <Section className="my-4">
              <div className="rounded-lg border border-solid border-gray-200 p-4">
                <Row className="w-full">
                  {Object.entries(dealMetrics).map(([key, value]) => (
                    <Column key={key} className="px-2 text-center">
                      <Text className="m-0 text-sm font-medium text-gray-500">
                        {key}
                      </Text>
                      <Text className="m-0 text-base font-medium">{value}</Text>
                    </Column>
                  ))}
                </Row>
              </div>
            </Section>

            <Heading className="mx-0 mb-4 mt-8 p-0 text-xl font-semibold text-black">
              Key Success Factors 🎯
            </Heading>
            <Text className="mb-4 text-sm leading-6 text-black">
              We've identified the most effective elements in successful deals.
              These factors consistently contribute to higher win rates and
              should be emphasized in your sales approach.
            </Text>
            <Section className="my-4">
              <div className="rounded-lg border border-solid border-gray-200 p-4">
                {report.trends.winFactors.map((factor, index) => (
                  <Text
                    key={`${index}-${factor}-${Math.random()}`}
                    className="m-0 mb-2 text-sm"
                  >
                    {index + 1}. {factor}
                  </Text>
                ))}
              </div>
            </Section>

            <Heading className="mx-0 mb-4 mt-8 p-0 text-xl font-semibold text-black">
              Product Performance 📦
            </Heading>
            <Text className="mb-4 text-sm leading-6 text-black">
              Analysis of product performance shows clear preferences in your
              market. Understanding which solutions resonate most can help focus
              your sales efforts and messaging.
            </Text>
            <Section className="my-4">
              <div className="rounded-lg border border-solid border-gray-200 p-4">
                {report.trends.topProducts.map((product, index) => (
                  <Text
                    key={`${index}-${product}-${Math.random()}`}
                    className="m-0 mb-2 text-sm"
                  >
                    {index + 1}. {product}
                  </Text>
                ))}
              </div>
            </Section>

            <Heading className="mx-0 mb-4 mt-8 p-0 text-xl font-semibold text-black">
              Common Objections 🤔
            </Heading>
            <Text className="mb-4 text-sm leading-6 text-black">
              Understanding frequent objections helps prepare better responses
              and improve deal progression. These insights can inform your pitch
              refinement and objection handling strategies.
            </Text>
            <Section className="my-4">
              <div className="rounded-lg border border-solid border-gray-200 p-4">
                {report.trends.commonObjections.map((objection, index) => (
                  <Text
                    key={`${index}-${objection}-${Math.random()}`}
                    className="m-0 mb-2 text-sm"
                  >
                    {index + 1}. {objection}
                  </Text>
                ))}
              </div>
            </Section>

            <Heading className="mx-0 mb-4 mt-8 p-0 text-xl font-semibold text-black">
              Strategic Recommendations 💡
            </Heading>
            <Text className="mb-4 text-sm leading-6 text-black">
              Based on our analysis, we've developed targeted recommendations to
              enhance your sales effectiveness. Implementing these strategies
              can help improve win rates and accelerate deal closure.
            </Text>
            <Section className="my-4">
              <div className="rounded-lg border border-solid border-gray-200 p-4">
                {report.recommendations.map((recommendation, index) => (
                  <Text
                    key={`${index}-${recommendation}-${Math.random()}`}
                    className="m-0 mb-2 text-sm"
                  >
                    {index + 1}. {recommendation}
                  </Text>
                ))}
              </div>
            </Section>

            <Text className="mb-4 mt-8 text-sm leading-6 text-black">
              Regular review and implementation of these insights will help
              optimize your sales process and drive better outcomes. Focus on
              the identified success factors while proactively addressing common
              objections.
            </Text>

            <Section className="mb-8 mt-8 text-center">
              <Link
                className="rounded-full bg-black px-6 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={`${platform.platformUrl}/${workspace.slug}/insights`}
              >
                View Detailed Insights
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
 * Stat card component for displaying sales metrics.
 * Renders a single statistic with an appropriate label in a visually distinct format.
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

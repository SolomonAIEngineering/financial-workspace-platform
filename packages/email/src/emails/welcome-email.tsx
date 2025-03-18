/**
 * Welcome email template module for new user onboarding.
 * Provides a professionally designed welcome email with information about the platform,
 * key features, and support options.
 * @module welcome-email
 */

import {
  Body,
  Button,
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

import Footer from '@/components/footer'
import { Tailwind } from '@react-email/tailwind'
import { BusinessConfig as PlatformConfig } from '@solomonai/platform-config'

/**
 * Welcome email React component for new user onboarding.
 * This email introduces the platform to new users, highlights key features,
 * provides next steps, and offers support options.
 *
 * @param props - Component properties
 * @param props.email - Recipient's email address (defaults to 'user@example.com' if not provided)
 * @param props.name - Recipient's name for personalization (defaults to 'there' if not provided)
 * @returns JSX component for the welcome email
 */
export default function WelcomeEmail({
  email = 'user@example.com',
  name = 'there',
}: {
  email: string
  name?: string
}) {
  const previewText = `Welcome to ${PlatformConfig.company}!`
  const calLink = 'https://cal.com/solomonai/15min'

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-6 max-w-[600px] rounded-lg border border-solid border-gray-100 bg-white px-6 py-4 shadow-sm">
            {/* Header with logo */}
            <Section className="mt-4 text-center">
              <Img
                className="mx-auto"
                alt={`${PlatformConfig.company} logo`}
                height="140"
                src="https://assets.solomon-ai.app/logo.png"
                width="140"
              />
            </Section>

            <Section className="mt-5">
              <Heading className="mx-0 mb-4 p-0 text-center text-xl font-bold text-gray-900">
                Welcome to {PlatformConfig.company}!
              </Heading>

              {/* Personalized greeting */}
              <Text className="mb-3 mt-0 text-sm leading-5 text-gray-800">
                Hi <span className="font-semibold">{name}</span>,
              </Text>
              <Text className="mb-4 mt-0 text-sm leading-5 text-gray-800">
                Thanks for signing up for {PlatformConfig.company}. We're
                thrilled to have you on board!
              </Text>

              {/* About section */}
              <Text className="mb-2 mt-5 text-sm font-bold text-gray-900">
                About Solomon AI
              </Text>
              <Text className="mb-4 mt-0 text-sm leading-5 text-gray-700">
                Solomon AI is a comprehensive financial management platform
                designed specifically for small and medium-sized businesses. We
                empower organizations to gain complete visibility into their
                financial health, make data-driven decisions, and optimize their
                cash flow through advanced AI-powered analytics. Our intuitive
                platform transforms how you track expenses, manage budgets,
                forecast revenue, and identify growth opportunities, helping you
                take control of your financial future while reducing compliance
                risks.
              </Text>

              {/* Features section */}
              <Text className="mb-2 mt-5 text-sm font-bold text-gray-900">
                Here's what you can do now:
              </Text>
              <Section className="my-3 rounded border border-gray-100 bg-gray-50 p-3">
                <Text className="my-1 flex items-start text-sm leading-5 text-gray-700">
                  <span className="mr-2 font-bold text-green-600">✓</span>{' '}
                  Connect your financial accounts for real-time insights
                </Text>
                <Text className="my-1 flex items-start text-sm leading-5 text-gray-700">
                  <span className="mr-2 font-bold text-green-600">✓</span>{' '}
                  Generate custom financial reports and dashboards
                </Text>
                <Text className="my-1 flex items-start text-sm leading-5 text-gray-700">
                  <span className="mr-2 font-bold text-green-600">✓</span>{' '}
                  Leverage AI-powered forecasting and cash flow analysis
                </Text>
                <Text className="my-1 flex items-start text-sm leading-5 text-gray-700">
                  <span className="mr-2 font-bold text-green-600">✓</span>{' '}
                  Invite your finance team or accountant to collaborate
                </Text>
              </Section>

              {/* CTA button */}
              <Section className="my-6 text-center">
                <Button
                  className="rounded-md bg-black px-6 py-2.5 text-center text-sm font-medium text-white no-underline shadow-sm"
                  href={PlatformConfig.platformUrl}
                >
                  Get Started →
                </Button>
              </Section>

              <Hr className="my-5 border border-solid border-gray-100" />

              {/* Feedback section */}
              <Text className="mb-2 mt-5 text-sm font-bold text-gray-900">
                We Value Your Feedback
              </Text>
              <Text className="mb-3 mt-0 text-sm leading-5 text-gray-700">
                Your experience with {PlatformConfig.company} matters to us. If
                you have any feedback, suggestions, or if you encounter any
                issues while using our platform, we'd love to hear from you.
              </Text>

              <Section className="my-3 rounded border border-gray-100 bg-gray-50 p-3">
                <Text className="m-0 text-sm font-medium leading-5 text-gray-800">
                  Contact options:
                </Text>
                <Text className="mb-0 mt-2 text-sm leading-5 text-gray-700">
                  • Reply directly to this email
                </Text>
                <Text className="mb-0 mt-1 text-sm leading-5 text-gray-700">
                  • Email us at{' '}
                  <Link
                    className="text-black underline"
                    href={`mailto:support@${process.env.EMAIL_DOMAIN || 'solomon-ai.app'}`}
                  >
                    support@{process.env.EMAIL_DOMAIN || 'solomon-ai.app'}
                  </Link>
                </Text>
              </Section>

              <Text className="mb-2 mt-4 text-sm leading-5 text-gray-700">
                Prefer to talk directly with our team? Schedule a quick
                15-minute call:
              </Text>
              <Section className="my-3 text-center">
                <Button
                  className="rounded-md bg-black px-6 py-2.5 text-center text-sm font-medium text-white no-underline shadow-sm"
                  href={calLink}
                >
                  Schedule a 15-min Call
                </Button>
              </Section>

              {/* Closing message */}
              <Text className="my-5 border-l-2 border-black pl-3 text-sm italic leading-5 text-gray-700">
                We're committed to helping small and medium-sized businesses
                achieve financial clarity and growth through intelligent data
                analysis and actionable insights.
              </Text>

              <Text className="mt-4 text-sm leading-5 text-gray-700">
                Best regards,
                <br />
                <span className="font-semibold">
                  The {PlatformConfig.company} Team
                </span>
              </Text>
            </Section>
            <Footer email={email} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

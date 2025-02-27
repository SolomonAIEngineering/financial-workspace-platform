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
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';

import { platformConfig } from '@/lib/resend';

import Footer from './components/footer';

export default function WelcomeEmail({
  email = 'user@example.com',
  name = 'there',
}: {
  email: string;
  name?: string;
}) {
  const previewText = `Welcome to ${platformConfig.company}!`;
  const calLink = 'https://cal.com/solomonai/15min';

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
                alt={`${platformConfig.company} logo`}
                height="140"
                src="https://pub-d47f0072788247a387ec1ef09379a508.r2.dev/logo.png"
                width="140"
              />
            </Section>

            <Section className="mt-5">
              <Heading className="mx-0 mb-4 p-0 text-center text-xl font-bold text-gray-900">
                Welcome to {platformConfig.company}!
              </Heading>

              {/* Personalized greeting */}
              <Text className="mt-0 mb-3 text-sm leading-5 text-gray-800">
                Hi <span className="font-semibold">{name}</span>,
              </Text>
              <Text className="mt-0 mb-4 text-sm leading-5 text-gray-800">
                Thanks for signing up for {platformConfig.company}. We're
                thrilled to have you on board!
              </Text>

              {/* About section */}
              <Text className="mt-5 mb-2 text-sm font-bold text-gray-900">
                About Solomon AI
              </Text>
              <Text className="mt-0 mb-4 text-sm leading-5 text-gray-700">
                Solomon AI is a sophisticated contract management solution
                designed specifically for small businesses. We empower
                organizations to streamline their contract workflows, eliminate
                paperwork bottlenecks, and gain valuable insights through
                advanced AI analysis. Our intuitive platform transforms how you
                create, negotiate, sign, and manage agreements, saving you time
                and reducing legal risks.
              </Text>

              {/* Features section */}
              <Text className="mt-5 mb-2 text-sm font-bold text-gray-900">
                Here's what you can do now:
              </Text>
              <Section className="my-3 rounded border border-gray-100 bg-gray-50 p-3">
                <Text className="my-1 flex items-start text-sm leading-5 text-gray-700">
                  <span className="mr-2 font-bold text-green-600">✓</span>{' '}
                  Create your first document
                </Text>
                <Text className="my-1 flex items-start text-sm leading-5 text-gray-700">
                  <span className="mr-2 font-bold text-green-600">✓</span>{' '}
                  Explore Our various AI features
                </Text>
                <Text className="my-1 flex items-start text-sm leading-5 text-gray-700">
                  <span className="mr-2 font-bold text-green-600">✓</span>{' '}
                  Customize your workspace to match your workflow
                </Text>
                <Text className="my-1 flex items-start text-sm leading-5 text-gray-700">
                  <span className="mr-2 font-bold text-green-600">✓</span>{' '}
                  Invite team members to collaborate
                </Text>
              </Section>

              {/* CTA button */}
              <Section className="my-6 text-center">
                <Button
                  className="rounded-md bg-black px-6 py-2.5 text-center text-sm font-medium text-white no-underline shadow-sm"
                  href={platformConfig.platformUrl}
                >
                  Get Started →
                </Button>
              </Section>

              <Hr className="my-5 border border-solid border-gray-100" />

              {/* Feedback section */}
              <Text className="mt-5 mb-2 text-sm font-bold text-gray-900">
                We Value Your Feedback
              </Text>
              <Text className="mt-0 mb-3 text-sm leading-5 text-gray-700">
                Your experience with {platformConfig.company} matters to us. If
                you have any feedback, suggestions, or if you encounter any
                issues while using our platform, we'd love to hear from you.
              </Text>

              <Section className="my-3 rounded border border-gray-100 bg-gray-50 p-3">
                <Text className="m-0 text-sm leading-5 font-medium text-gray-800">
                  Contact options:
                </Text>
                <Text className="mt-2 mb-0 text-sm leading-5 text-gray-700">
                  • Reply directly to this email
                </Text>
                <Text className="mt-1 mb-0 text-sm leading-5 text-gray-700">
                  • Email us at{' '}
                  <Link
                    className="text-black underline"
                    href={`mailto:support@${process.env.EMAIL_DOMAIN || 'solomon-ai.app'}`}
                  >
                    support@{process.env.EMAIL_DOMAIN || 'solomon-ai.app'}
                  </Link>
                </Text>
              </Section>

              <Text className="mt-4 mb-2 text-sm leading-5 text-gray-700">
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
              <Text className="my-5 border-l-2 border-black pl-3 text-sm leading-5 text-gray-700 italic">
                We're committed to continuously improving our platform based on
                user feedback, and your input is invaluable to us.
              </Text>

              <Text className="mt-4 text-sm leading-5 text-gray-700">
                Best regards,
                <br />
                <span className="font-semibold">
                  The {platformConfig.company} Team
                </span>
              </Text>
            </Section>
            <Footer email={email} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

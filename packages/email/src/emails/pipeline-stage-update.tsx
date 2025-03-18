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

export default function PipelineStageUpdate({
  email = 'panic@thedis.co',
  workspace = {
    name: 'Sales Team',
    slug: 'sales',
    logo: platform.assets.logo,
  },
  lead = {
    name: 'John Smith',
    company: 'Acme Corp',
    previousStage: 'Initial Contact',
    newStage: 'Proposal Sent',
    updatedBy: 'Jane Doe',
    notes: 'Client very interested in enterprise features',
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
    company: string
    previousStage: string
    newStage: string
    updatedBy: string
    notes: string
  }
}) {
  const stats = {
    Lead: `${lead.name}`,
    Company: lead.company,
    'Previous Stage': lead.previousStage,
    'New Stage': lead.newStage,
  }

  return (
    <Html>
      <Head />
      <Preview>
        Pipeline Update: {lead.company} moved from {lead.previousStage} to{' '}
        {lead.newStage}
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
              Pipeline Stage Update 🔄
            </Heading>
            <Text className="text-sm leading-6 text-black">
              We're excited to share significant progress in your sales
              pipeline! A lead has advanced to a new stage, indicating positive
              momentum in the sales process. This movement reflects growing
              engagement and alignment with our solutions.
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
              This opportunity represents a key account in your pipeline.
              Understanding their profile and journey so far will help ensure
              smooth progression through subsequent stages and maintain positive
              momentum.
            </Text>
            <Section className="my-4">
              <Row>
                <Column className="px-2">
                  <div className="rounded-lg border border-solid border-gray-200 p-4">
                    <Text className="m-0 text-center text-sm font-medium text-gray-500">
                      Updated By
                    </Text>
                    <Text className="m-0 text-center text-lg font-bold">
                      {lead.updatedBy}
                    </Text>
                  </div>
                </Column>
              </Row>
              <Row className="mt-4">
                <Column className="px-2">
                  <div className="rounded-lg border border-solid border-gray-200 p-4">
                    <Text className="m-0 text-center text-sm font-medium text-gray-500">
                      Notes
                    </Text>
                    <Text className="m-0 text-center text-base">
                      {lead.notes}
                    </Text>
                  </div>
                </Column>
              </Row>
            </Section>

            <Heading className="mx-0 mb-4 mt-8 p-0 text-xl font-semibold text-black">
              Stage Transition Details 📋
            </Heading>
            <Text className="mb-4 text-sm leading-6 text-black">
              The lead has progressed from {lead.previousStage} to{' '}
              {lead.newStage}. This advancement indicates increasing engagement
              and readiness to move forward in the sales process. Understanding
              the context of this transition will help inform your next steps.
            </Text>
            <Section className="my-4">
              <Row>
                <Column className="px-2">
                  <div className="rounded-lg border border-solid border-gray-200 p-4">
                    <Text className="m-0 text-center text-sm font-medium text-gray-500">
                      Updated By
                    </Text>
                    <Text className="m-0 text-center text-lg font-bold">
                      {lead.updatedBy}
                    </Text>
                  </div>
                </Column>
              </Row>
              <Row className="mt-4">
                <Column className="px-2">
                  <div className="rounded-lg border border-solid border-gray-200 p-4">
                    <Text className="m-0 text-center text-sm font-medium text-gray-500">
                      Notes
                    </Text>
                    <Text className="m-0 text-center text-base">
                      {lead.notes}
                    </Text>
                  </div>
                </Column>
              </Row>
            </Section>

            <Heading className="mx-0 mb-4 mt-8 p-0 text-xl font-semibold text-black">
              Update Context 📝
            </Heading>
            <Text className="mb-4 text-sm leading-6 text-black">
              The following notes provide important context about this stage
              transition. These insights will help you understand the lead's
              current position and prepare for the next phase of engagement.
            </Text>
            <Section className="my-4">
              <div className="rounded-lg border border-solid border-gray-200 p-4">
                <Text className="m-0 text-sm">{lead.notes}</Text>
              </div>
            </Section>

            <Text className="mb-4 mt-8 text-sm leading-6 text-black">
              This stage transition represents a critical moment in the sales
              process. Quick follow-up with appropriate next steps will help
              maintain momentum and progress towards successful closure.
            </Text>

            <Section className="mb-8 mt-8 text-center">
              <Link
                className="rounded-full bg-black px-6 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={`${platform.platformUrl}/${workspace.slug}/pipeline`}
              >
                View Pipeline
              </Link>
            </Section>
            <Footer email={email} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

const StatCard = ({ title, value }: { title: string; value: string }) => {
  return (
    <Column className="text-center">
      <Text className="font-medium text-gray-400">{title}</Text>
      <Text className="-mt-3 text-lg font-medium text-black">{value}</Text>
    </Column>
  )
}

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

import Footer from '@/components/footer'
import { Tailwind } from '@react-email/tailwind'
import { BusinessConfig as platform } from '@solomonai/platform-config'

export default function CustomerFeedbackAlert({
  email = 'panic@thedis.co',
  feedback = {
    customer: {
      name: 'John Smith',
      company: 'Acme Corp',
      email: 'john@acme.co',
      plan: 'Enterprise',
    },
    rating: 2,
    message:
      'Having issues with the API integration. Response times are slower than expected.',
    category: 'Technical Issue',
    priority: 'High',
    submittedAt: '2024-03-15 14:30 PST',
    assignedTo: 'Technical Support Team',
  },
  workspace = {
    name: 'Sales Team',
    slug: 'sales',
  },
}: {
  email: string
  feedback: {
    customer: {
      name: string
      company: string
      email: string
      plan: string
    }
    rating: number
    message: string
    category: string
    priority: string
    submittedAt: string
    assignedTo: string
  }
  workspace: {
    name: string
    slug: string
  }
}) {
  const isNegativeFeedback = feedback.rating <= 3

  return (
    <Html>
      <Head />
      <Preview>
        {isNegativeFeedback ? '⚠️ ' : '💫 '}
        Customer Feedback: {feedback.customer.company}
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
              {isNegativeFeedback ? '⚠️ ' : '💫 '}Customer Feedback Alert
              {isNegativeFeedback ? ' ⚠️' : ' 🎯'}
            </Heading>
            <Text className="text-sm leading-6 text-black">
              Important feedback received! 📝 We've gathered valuable insights
              from one of our customers that will help us enhance our service
              quality and user experience. This feedback provides crucial
              information for our continuous improvement initiatives.
            </Text>

            <Text className="mt-4 text-sm font-semibold leading-6 text-black">
              Customer Details:
            </Text>
            <Text className="text-sm leading-6 text-black">
              • Name: {feedback.customer.name}
              <br />• Company: {feedback.customer.company}
              <br />• Email: {feedback.customer.email}
              <br />• Plan: {feedback.customer.plan}
            </Text>

            <Text className="mt-4 text-sm leading-6 text-black">
              <strong>Feedback Details:</strong>
            </Text>
            <Text className="text-sm leading-6 text-black">
              • Rating: {Array(feedback.rating).fill('★').join('')}
              {Array(5 - feedback.rating)
                .fill('☆')
                .join('')}
              <br />• Category: {feedback.category}
              <br />• Priority:{' '}
              <span
                className={
                  feedback.priority === 'High'
                    ? 'text-red-600'
                    : feedback.priority === 'Medium'
                      ? 'text-yellow-600'
                      : 'text-green-600'
                }
              >
                {feedback.priority}
              </span>
              <br />• Submitted: {feedback.submittedAt}
              <br />• Assigned To: {feedback.assignedTo}
            </Text>

            <Text className="mt-4 text-sm font-semibold leading-6 text-black">
              Message:
            </Text>
            <Text className="text-sm italic leading-6 text-gray-600">
              "{feedback.message}"
            </Text>

            <Section className="mb-8 mt-8 text-center">
              <Link
                className="rounded-full bg-black px-6 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={`${platform.platformUrl}/${workspace.slug}/feedback`}
              >
                View Feedback Details
              </Link>
            </Section>
            <Footer email={email} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

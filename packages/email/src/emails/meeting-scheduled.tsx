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

import Footer from '../components/footer'
import { Tailwind } from '@react-email/tailwind'
import { BusinessConfig as platform } from '@solomonai/platform-config'

export default function MeetingScheduled({
  email = 'panic@thedis.co',
  meeting = {
    title: 'Product Demo - Acme Corp',
    date: '2024-03-20',
    time: '10:00 AM PST',
    duration: '45 minutes',
    attendees: [
      { name: 'John Smith', email: 'john@acme.co', role: 'CTO' },
      { name: 'Jane Doe', email: 'jane@example.com', role: 'Sales Rep' },
    ],
    location: 'Google Meet',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    agenda: [
      'Introduction and company overview',
      'Product demonstration',
      'Q&A session',
      'Next steps discussion',
    ],
  },
  workspace = {
    name: 'Sales Team',
    slug: 'sales',
  },
}: {
  email: string
  meeting: {
    title: string
    date: string
    time: string
    duration: string
    attendees: Array<{
      name: string
      email: string
      role: string
    }>
    location: string
    meetingLink: string
    agenda: string[]
  }
  workspace: {
    name: string
    slug: string
  }
}) {
  return (
    <Html>
      <Head />
      <Preview>📅 Meeting Scheduled: {meeting.title} 🤝</Preview>
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
              📅 New Meeting Scheduled 🤝
            </Heading>
            <Text className="text-sm leading-6 text-black">
              Great news! 🎯 A new meeting has been successfully scheduled with
              your prospect. To ensure a productive discussion and help everyone
              prepare effectively, we've compiled all the essential details,
              including agenda points and participant information:
            </Text>
            <Section className="my-8">
              <Text className="text-sm leading-6 text-black">
                <strong>Title:</strong> {meeting.title}
                <br />
                <strong>Date:</strong> {meeting.date}
                <br />
                <strong>Time:</strong> {meeting.time}
                <br />
                <strong>Duration:</strong> {meeting.duration}
                <br />
                <strong>Location:</strong> {meeting.location}
              </Text>
            </Section>

            <Text className="text-sm font-semibold leading-6 text-black">
              Meeting Participants:
            </Text>
            {meeting.attendees.map((attendee, index) => (
              <Text
                key={`${index}-${attendee.name}-${attendee.role}-${Math.random()}`}
                className="text-sm leading-6 text-black"
              >
                • {attendee.name} ({attendee.role}) - {attendee.email}
              </Text>
            ))}

            <Text className="mt-4 text-sm font-semibold leading-6 text-black">
              Meeting Agenda 📝:
            </Text>
            {meeting.agenda.map((item, index) => (
              <Text
                key={`${index}-${item}-${Math.random()}`}
                className="text-sm leading-6 text-black"
              >
                {index + 1}. {item}
              </Text>
            ))}

            <Section className="mb-8 mt-8 text-center">
              <Link
                className="rounded-full bg-black px-6 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={meeting.meetingLink}
              >
                Join Meeting
              </Link>
            </Section>
            <Footer email={email} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

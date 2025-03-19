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
import {
  BusinessConfig,
  BusinessConfig as platform,
} from '@solomonai/platform-config'
import { Clock, ExternalLink, MessageSquare } from 'lucide-react'

import { Tailwind } from '@react-email/tailwind'
import Footer from '../components/footer'

interface InvoiceCommentEmailProps {
  invoiceNumber: string
  link: string
  email?: string
  commentAuthor?: string
  commentPreview?: string
  commentTime?: string
  invoiceAmount?: string
  dueDate?: string
  companyLogo?: string
  teamSlug: string
}

export default function InvoiceCommentEmail({
  invoiceNumber = 'INV-0001',
  link = 'https://app.example.com/invoices/1234567890',
  email = 'user@example.com',
  commentAuthor = 'Team Member',
  commentPreview = 'Please review the updated payment terms...',
  commentTime = '2 minutes ago',
  invoiceAmount = '$1,234.56',
  dueDate = 'March 25, 2024',
  companyLogo = BusinessConfig.assets.wordmark,
  teamSlug,
}: InvoiceCommentEmailProps) {
  const notificationSettingsUrl = `${platform.platformUrl}/${teamSlug}/settings/notifications`

  return (
    <Html>
      <Head />
      <Preview>
        New comment from {commentAuthor} on Invoice {invoiceNumber}
      </Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-10 max-w-[500px] rounded border border-solid border-gray-200 px-10 py-5">
            <Section className="mt-8 text-center">
              {companyLogo && (
                <Img
                  src={companyLogo}
                  width="140"
                  height="140"
                  alt="Company Logo"
                  className="mx-auto mb-4"
                />
              )}
              <Row className="mx-auto py-[5%]">
                <Column align="center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                    <MessageSquare className="h-6 w-6 text-black" />
                  </div>
                </Column>
              </Row>
            </Section>

            <Heading className="mx-0 my-7 p-0 text-center text-xl font-semibold text-black">
              New Comment on Invoice {invoiceNumber}
            </Heading>

            <Section className="mb-8">
              <Row>
                <Column className="px-4">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <Row>
                      <Column>
                        <Text className="m-0 text-sm font-medium text-gray-900">
                          Invoice Details:
                        </Text>
                        <Text className="m-0 mt-2 text-sm text-gray-700">
                          • Invoice Number: {invoiceNumber}
                          <br />• Amount: {invoiceAmount}
                          <br />• Due Date: {dueDate}
                        </Text>
                      </Column>
                    </Row>
                  </div>
                </Column>
              </Row>
            </Section>

            <Section className="mb-8">
              <Row>
                <Column className="px-4">
                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                    <Text className="m-0 text-sm text-gray-600">
                      <strong>{commentAuthor}</strong> commented:
                    </Text>
                    <Text className="m-0 mt-2 text-sm text-gray-800">
                      "{commentPreview}"
                    </Text>
                    <Text className="m-0 mt-2 flex items-center text-xs text-gray-500">
                      <Clock className="mr-1 inline h-3 w-3" />
                      {commentTime}
                    </Text>
                  </div>
                </Column>
              </Row>
            </Section>

            <Section className="my-8 text-center">
              <Link
                className="inline-flex items-center rounded-full bg-black px-6 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={link}
              >
                View Invoice and Reply
                <ExternalLink className="ml-1 h-3 w-3" />
              </Link>
            </Section>

            <Text className="text-sm leading-6 text-gray-600">
              You can reply to this comment directly by clicking the button
              above or by replying to this email.
            </Text>

            <Hr className="my-6 w-full border border-gray-200" />

            <Footer
              email={email}
              notificationSettingsUrl={notificationSettingsUrl}
            />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

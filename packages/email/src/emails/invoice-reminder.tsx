/**
 * Invoice payment reminder email template module.
 * Provides a professionally designed email for reminding customers about upcoming
 * invoice due dates or notifying them about slightly overdue payments.
 * @module invoice-reminder
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
import { Building, Calendar, Clock, CreditCard, DollarSign } from 'lucide-react'
import {
  BusinessConfig,
  BusinessConfig as platform,
} from '@solomonai/platform-config'

import Footer from '../components/footer'
import { Tailwind } from '@react-email/tailwind'

/**
 * Interface defining the properties for the InvoiceReminderEmail component.
 * @interface InvoiceReminderEmailProps
 * @property {string} companyName - Name of the customer company being reminded
 * @property {string} teamName - Name of the team/company that issued the invoice
 * @property {string} invoiceNumber - Unique identifier for the invoice
 * @property {string} link - URL to view and pay the invoice
 * @property {string} [email] - Customer's email address
 * @property {string} teamSlug - URL-friendly identifier for the team
 * @property {string} [companyLogo] - URL of the company logo
 * @property {string} [invoiceAmount] - Total amount due on the invoice
 * @property {string} [dueDate] - Due date of the invoice
 * @property {string[]} [paymentMethods] - Available payment methods
 * @property {string} [contactEmail] - Email address for invoice inquiries
 * @property {number} [daysPastDue] - Number of days the invoice is past due (0 if not overdue yet)
 * @property {string} [currency] - Currency code for the invoice amount
 */
interface InvoiceReminderEmailProps {
  companyName: string
  teamName: string
  invoiceNumber: string
  link: string
  email?: string
  teamSlug: string
  companyLogo?: string
  invoiceAmount?: string
  dueDate?: string
  paymentMethods?: string[]
  contactEmail?: string
  daysPastDue?: number
  currency?: string
}

/**
 * Invoice payment reminder email React component.
 * This email reminds customers about upcoming invoice due dates or alerts them
 * about slightly overdue payments. It adapts its content and styling based on whether
 * the invoice is currently due or overdue, and provides payment options.
 *
 * @param props - Component properties defined by InvoiceReminderEmailProps interface
 * @param props.companyName - Name of the customer company being reminded (defaults to 'Acme Inc')
 * @param props.teamName - Name of the team/company that issued the invoice (defaults to 'Solomon AI')
 * @param props.invoiceNumber - Unique identifier for the invoice (defaults to 'INV-0001')
 * @param props.link - URL to view and pay the invoice
 * @param props.email - Customer's email address (defaults to 'billing@example.com')
 * @param props.teamSlug - URL-friendly identifier for the team
 * @param props.companyLogo - URL of the company logo (defaults to BusinessConfig.assets.wordmark)
 * @param props.invoiceAmount - Total amount due on the invoice (defaults to '$1,234.56')
 * @param props.dueDate - Due date of the invoice (defaults to 'March 25, 2024')
 * @param props.paymentMethods - Available payment methods (defaults to ['Bank Transfer', 'Credit Card', 'PayPal'])
 * @param props.contactEmail - Email address for invoice inquiries (defaults to 'support@example.com')
 * @param props.daysPastDue - Number of days the invoice is past due (defaults to 0)
 * @param props.currency - Currency code for the invoice amount (defaults to 'USD')
 * @returns JSX component for the invoice payment reminder email
 */
export default function InvoiceReminderEmail({
  companyName = 'Acme Inc',
  teamName = 'Solomon AI',
  invoiceNumber = 'INV-0001',
  link = 'https://app.example.com/invoices/1234567890',
  email = 'billing@example.com',
  teamSlug,
  companyLogo = BusinessConfig.assets.wordmark,
  invoiceAmount = '$1,234.56',
  dueDate = 'March 25, 2024',
  paymentMethods = ['Bank Transfer', 'Credit Card', 'PayPal'],
  contactEmail = 'support@example.com',
  daysPastDue = 0,
  currency = 'USD',
}: InvoiceReminderEmailProps) {
  const notificationSettingsUrl = `${platform.platformUrl}/${teamSlug}/settings/notifications`
  const isOverdue = daysPastDue > 0

  return (
    <Html>
      <Head />
      <Preview>
        {isOverdue ? `Overdue Payment Reminder: ` : `Payment Reminder: `}
        Invoice {invoiceNumber} from {teamName} ({invoiceAmount})
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
                  <div
                    className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${isOverdue ? 'bg-orange-100' : 'bg-blue-100'
                      }`}
                  >
                    <Clock
                      className={`h-6 w-6 ${isOverdue ? 'text-orange-600' : 'text-blue-600'
                        }`}
                    />
                  </div>
                </Column>
              </Row>
            </Section>

            <Heading className="mx-0 my-7 p-0 text-center text-xl font-semibold text-black">
              {isOverdue ? 'Payment Overdue' : 'Payment Reminder'}
            </Heading>

            <Section className="mb-8">
              <Row>
                <Column className="px-4">
                  <div
                    className={`rounded-lg border p-4 ${isOverdue
                        ? 'border-orange-200 bg-orange-50'
                        : 'border-blue-200 bg-blue-50'
                      }`}
                  >
                    <Text className="m-0 text-sm text-gray-900">
                      <strong>Dear {companyName},</strong>
                      <br />
                      <br />
                      This is a{' '}
                      {isOverdue
                        ? 'reminder that payment is overdue'
                        : 'friendly reminder'}{' '}
                      for invoice <strong>{invoiceNumber}</strong> from{' '}
                      {teamName}.
                      {isOverdue &&
                        ` The payment is currently ${daysPastDue} days past due.`}
                    </Text>
                  </div>
                </Column>
              </Row>
            </Section>

            <Section className="mb-8">
              <Row>
                <Column className="px-4">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <Text className="m-0 text-sm font-medium text-gray-900">
                      Invoice Details:
                    </Text>
                    <div className="mt-2 space-y-2">
                      <Row>
                        <Column className="w-5">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                        </Column>
                        <Column>
                          <Text className="m-0 text-sm text-gray-700">
                            Amount Due: {invoiceAmount} {currency}
                          </Text>
                        </Column>
                      </Row>
                      <Row>
                        <Column className="w-5">
                          <Calendar className="h-4 w-4 text-gray-500" />
                        </Column>
                        <Column>
                          <Text className="m-0 text-sm text-gray-700">
                            Due Date: {dueDate}
                          </Text>
                        </Column>
                      </Row>
                      <Row>
                        <Column className="w-5">
                          <Building className="h-4 w-4 text-gray-500" />
                        </Column>
                        <Column>
                          <Text className="m-0 text-sm text-gray-700">
                            Billed To: {companyName}
                          </Text>
                        </Column>
                      </Row>
                    </div>
                  </div>
                </Column>
              </Row>
            </Section>

            <Section className="mb-8">
              <Row>
                <Column className="px-4">
                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <Text className="m-0 text-sm font-medium text-gray-900">
                      Payment Methods:
                    </Text>
                    <div className="mt-2">
                      {paymentMethods.map((method, index) => (
                        <Row key={method}>
                          <Column className="w-5">
                            <CreditCard className="h-4 w-4 text-gray-500" />
                          </Column>
                          <Column>
                            <Text className="m-0 text-sm text-gray-700">
                              {method}
                            </Text>
                          </Column>
                        </Row>
                      ))}
                    </div>
                  </div>
                </Column>
              </Row>
            </Section>

            <Section className="my-8 text-center">
              <Link
                className="rounded-full bg-black px-6 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={link}
              >
                View and Pay Invoice
              </Link>
            </Section>

            <Text className="text-sm leading-6 text-gray-600">
              If you have already processed this payment, please disregard this
              reminder. For any questions about the invoice or payment process,
              please contact us at{' '}
              <Link href={`mailto:${contactEmail}`} className="text-blue-600">
                {contactEmail}
              </Link>
              .
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

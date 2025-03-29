/**
 * Invoice overdue notification email template module.
 * Provides a professionally designed email for notifying customers about
 * overdue invoices and facilitating payment collection.
 * @module invoice-overdue
 */

import { AlertTriangle, Calendar, DollarSign, Send } from 'lucide-react'
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

import Footer from '../components/footer'
import { Tailwind } from '@react-email/tailwind'

/**
 * Interface defining the properties for the InvoiceOverdueEmail component.
 * @interface InvoiceOverdueEmailProps
 * @property {string} customerName - Name of the customer with the overdue invoice
 * @property {string} invoiceNumber - Unique identifier for the invoice
 * @property {string} link - URL to view the invoice details
 * @property {string} [email] - Customer's email address
 * @property {string} teamSlug - URL-friendly identifier for the team
 * @property {string} [companyLogo] - URL of the company logo
 * @property {string} [invoiceAmount] - Total amount due on the invoice
 * @property {string} [dueDate] - Original due date of the invoice
 * @property {number} [daysOverdue] - Number of days the invoice is past due
 * @property {string[]} [paymentMethods] - Available payment methods
 */
interface InvoiceOverdueEmailProps {
  customerName: string
  invoiceNumber: string
  link: string
  email?: string
  teamSlug: string
  companyLogo?: string
  invoiceAmount?: string
  dueDate?: string
  daysOverdue?: number
  paymentMethods?: string[]
}

/**
 * Invoice overdue notification email React component.
 * This email alerts customers about unpaid invoices that are past their due date,
 * provides payment options, and offers ways to verify or record payments.
 * It uses urgent visual styling to emphasize the importance of immediate action.
 *
 * @param props - Component properties defined by InvoiceOverdueEmailProps interface
 * @param props.customerName - Name of the customer with the overdue invoice (defaults to 'Customer')
 * @param props.invoiceNumber - Unique identifier for the invoice (defaults to 'INV-0001')
 * @param props.link - URL to view the invoice details
 * @param props.email - Customer's email address (defaults to 'user@example.com')
 * @param props.teamSlug - URL-friendly identifier for the team
 * @param props.companyLogo - URL of the company logo (defaults to BusinessConfig.assets.logo)
 * @param props.invoiceAmount - Total amount due on the invoice (defaults to '$1,234.56')
 * @param props.dueDate - Original due date of the invoice (defaults to 'March 1, 2024')
 * @param props.daysOverdue - Number of days the invoice is past due (defaults to 5)
 * @param props.paymentMethods - Available payment methods (defaults to ['Bank Transfer', 'Credit Card', 'PayPal'])
 * @returns JSX component for the invoice overdue notification email
 */
export default function InvoiceOverdueEmail({
  customerName = 'Customer',
  invoiceNumber = 'INV-0001',
  link = 'https://app.example.com/invoices/1234567890',
  email = 'user@example.com',
  teamSlug,
  companyLogo = BusinessConfig.assets.logo,
  invoiceAmount = '$1,234.56',
  dueDate = 'March 1, 2024',
  daysOverdue = 5,
  paymentMethods = ['Bank Transfer', 'Credit Card', 'PayPal'],
}: InvoiceOverdueEmailProps) {
  const notificationSettingsUrl = `${platform.platformUrl}/${teamSlug}/settings/notifications`

  return (
    <Html>
      <Head />
      <Preview>
        Important: Invoice {invoiceNumber} for {customerName} is{' '}
        {daysOverdue.toString()} days overdue
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
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </Column>
              </Row>
            </Section>

            <Heading className="mx-0 my-7 p-0 text-center text-xl font-semibold text-black">
              Invoice {invoiceNumber} is Overdue
            </Heading>

            <Section className="mb-8">
              <Row>
                <Column className="px-4">
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <Text className="m-0 text-sm text-gray-900">
                      Invoice <strong>{invoiceNumber}</strong> to{' '}
                      <strong>{customerName}</strong> is now{' '}
                      <strong>{daysOverdue} days overdue</strong>. We've checked
                      your account but haven't found a matching transaction.
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
                            Amount: {invoiceAmount}
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
                      {paymentMethods && (
                        <Text className="m-0 mt-2 text-sm text-gray-700">
                          Accepted Payment Methods: {paymentMethods.join(', ')}
                        </Text>
                      )}
                    </div>
                  </div>
                </Column>
              </Row>
            </Section>

            <Text className="text-sm leading-6 text-gray-700">
              Available actions:
            </Text>

            <Section className="my-4">
              <Row>
                <Column className="px-4">
                  <div className="space-y-3">
                    <Link
                      className="block rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700 no-underline transition-colors hover:bg-gray-50"
                      href={`${link}/verify-payment`}
                    >
                      ✓ Verify or record payment manually
                    </Link>
                    <Link
                      className="block rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700 no-underline transition-colors hover:bg-gray-50"
                      href={`${link}/send-reminder`}
                    >
                      <Row>
                        <Column className="w-5">
                          <Send className="h-4 w-4 text-gray-500" />
                        </Column>
                        <Column>Send payment reminder to {customerName}</Column>
                      </Row>
                    </Link>
                  </div>
                </Column>
              </Row>
            </Section>

            <Section className="my-8 text-center">
              <Link
                className="rounded-full bg-black px-6 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={link}
              >
                View Full Invoice Details
              </Link>
            </Section>

            <Text className="text-sm leading-6 text-gray-600">
              Need assistance? Our support team is here to help - just reply to
              this email.
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

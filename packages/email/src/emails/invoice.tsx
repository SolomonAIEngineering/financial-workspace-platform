/**
 * Invoice email template module.
 * Provides a professionally designed email template for sending invoices to customers,
 * with support for customizable fields, payment options, and branding.
 * @module invoice
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
import {
  BusinessConfig,
  BusinessConfig as platform,
} from '@solomonai/platform-config'
import {
  Building,
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
} from 'lucide-react'

import { Tailwind } from '@react-email/tailwind'
import Footer from '../components/footer'

/**
 * Interface defining the properties for the InvoiceEmail component.
 * @interface InvoiceEmailProps
 * @property {string} customerName - Name of the customer being invoiced
 * @property {string} teamName - Name of the team/company issuing the invoice
 * @property {string} link - URL to view and pay the invoice
 * @property {string} [email] - Customer's email address
 * @property {string} teamSlug - URL-friendly identifier for the team
 * @property {string} [companyLogo] - URL of the company logo
 * @property {string} [invoiceNumber] - Unique identifier for the invoice
 * @property {string} [invoiceAmount] - Total amount due on the invoice
 * @property {string} [dueDate] - Date by which the invoice should be paid
 * @property {string[]} [paymentMethods] - Available payment methods
 * @property {string} [contactEmail] - Email address for invoice inquiries
 * @property {string} [currency] - Currency code for the invoice amount
 * @property {string} [description] - Description of the invoiced goods or services
 * @property {string} [terms] - Payment terms and conditions
 */
interface InvoiceEmailProps {
  customerName: string
  teamName: string
  link: string
  email?: string
  teamSlug: string
  companyLogo?: string
  invoiceNumber?: string
  invoiceAmount?: string
  dueDate?: string
  paymentMethods?: string[]
  contactEmail?: string
  currency?: string
  description?: string
  terms?: string
}

/**
 * Invoice email React component.
 * This email provides customers with a detailed invoice, including payment
 * information, due date, and payment options. It features a professional design
 * with company branding and clear call-to-action buttons.
 *
 * @param props - Component properties defined by InvoiceEmailProps interface
 * @param props.customerName - Name of the customer being invoiced (defaults to 'Acme Inc')
 * @param props.teamName - Name of the team/company issuing the invoice (defaults to 'Solomon AI')
 * @param props.link - URL to view and pay the invoice
 * @param props.email - Customer's email address
 * @param props.teamSlug - URL-friendly identifier for the team
 * @param props.companyLogo - URL of the company logo (defaults to BusinessConfig.assets.wordmark)
 * @param props.invoiceNumber - Unique identifier for the invoice (defaults to 'INV-0001')
 * @param props.invoiceAmount - Total amount due on the invoice (defaults to '$1,234.56')
 * @param props.dueDate - Date by which the invoice should be paid (defaults to 'April 1, 2024')
 * @param props.paymentMethods - Available payment methods (defaults to ['Bank Transfer', 'Credit Card', 'PayPal'])
 * @param props.contactEmail - Email address for invoice inquiries (defaults to 'support@example.com')
 * @param props.currency - Currency code for the invoice amount (defaults to 'USD')
 * @param props.description - Description of the invoiced goods or services (defaults to 'Monthly Services - March 2024')
 * @param props.terms - Payment terms and conditions (defaults to 'Payment due within 30 days')
 * @returns JSX component for the invoice email
 */
export default function InvoiceEmail({
  customerName = 'Acme Inc',
  teamName = 'Solomon AI',
  link = 'https://app.example.com/invoices/1234567890',
  email = 'billing@example.com',
  teamSlug,
  companyLogo = BusinessConfig.assets.wordmark,
  invoiceNumber = 'INV-0001',
  invoiceAmount = '$1,234.56',
  dueDate = 'April 1, 2024',
  paymentMethods = ['Bank Transfer', 'Credit Card', 'PayPal'],
  contactEmail = 'support@example.com',
  currency = 'USD',
  description = 'Monthly Services - March 2024',
  terms = 'Payment due within 30 days',
}: InvoiceEmailProps) {
  const notificationSettingsUrl = `${platform.platformUrl}/${teamSlug}/settings/notifications`

  return (
    <Html>
      <Head />
      <Preview>
        New Invoice #{invoiceNumber} from {teamName} for {invoiceAmount}
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
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </Column>
              </Row>
            </Section>

            <Heading className="mx-0 my-7 p-0 text-center text-xl font-semibold text-black">
              New Invoice from {teamName}
            </Heading>

            <Section className="mb-8">
              <Row>
                <Column className="px-4">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <Text className="m-0 text-sm text-gray-900">
                      <strong>Dear {customerName},</strong>
                      <br />
                      <br />A new invoice has been issued for your account.
                      Please review the details below and process the payment
                      before the due date.
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
                          <FileText className="h-4 w-4 text-gray-500" />
                        </Column>
                        <Column>
                          <Text className="m-0 text-sm text-gray-700">
                            Invoice Number: {invoiceNumber}
                          </Text>
                        </Column>
                      </Row>
                      <Row>
                        <Column className="w-5">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                        </Column>
                        <Column>
                          <Text className="m-0 text-sm text-gray-700">
                            Amount: {invoiceAmount} {currency}
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
                            Billed To: {customerName}
                          </Text>
                        </Column>
                      </Row>
                      {description && (
                        <Text className="m-0 mt-2 text-sm text-gray-700">
                          Description: {description}
                        </Text>
                      )}
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
                      Payment Options:
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

            {terms && (
              <Text className="text-center text-xs leading-6 text-gray-500">
                {terms}
              </Text>
            )}

            <Text className="text-sm leading-6 text-gray-600">
              For any questions about this invoice or the payment process,
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

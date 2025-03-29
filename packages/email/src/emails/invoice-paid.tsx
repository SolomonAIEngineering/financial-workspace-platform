/**
 * Invoice payment confirmation email template module.
 * Provides a professionally designed email for confirming invoice payments
 * and delivering payment receipt details to customers.
 * @module invoice-paid
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
  Calendar,
  CheckCircle,
  CreditCard,
  DollarSign,
  FileText,
} from 'lucide-react'

import Footer from '../components/footer'
import { Tailwind } from '@react-email/tailwind'

/**
 * Interface defining the properties for the InvoicePaidEmail component.
 * @interface InvoicePaidEmailProps
 * @property {string} customerName - Name of the customer who paid the invoice
 * @property {string} teamName - Name of the team/company that issued the invoice
 * @property {string} link - URL to view the invoice details
 * @property {string} [email] - Customer's email address
 * @property {string} teamSlug - URL-friendly identifier for the team
 * @property {string} [companyLogo] - URL of the company logo
 * @property {string} [invoiceNumber] - Unique identifier for the invoice
 * @property {string} [invoiceAmount] - Total amount paid on the invoice
 * @property {string} [paymentDate] - Date when the payment was received
 * @property {string} [paymentMethod] - Method used to make the payment
 * @property {string} [transactionId] - Unique identifier for the payment transaction
 * @property {string} [currency] - Currency code for the invoice amount
 * @property {string} [description] - Description of the invoiced goods or services
 * @property {string} [contactEmail] - Email address for payment or invoice inquiries
 */
interface InvoicePaidEmailProps {
  customerName: string
  teamName: string
  link: string
  email?: string
  teamSlug: string
  companyLogo?: string
  invoiceNumber?: string
  invoiceAmount?: string
  paymentDate?: string
  paymentMethod?: string
  transactionId?: string
  currency?: string
  description?: string
  contactEmail?: string
}

/**
 * Invoice payment confirmation email React component.
 * This email notifies customers that their invoice payment has been received and processed,
 * providing payment details, receipt information, and links to view the full invoice.
 * It helps maintain clear financial communication with customers.
 *
 * @param props - Component properties defined by InvoicePaidEmailProps interface
 * @param props.customerName - Name of the customer who paid the invoice (defaults to 'Acme Inc')
 * @param props.teamName - Name of the team/company that issued the invoice (defaults to 'Solomon AI')
 * @param props.link - URL to view the invoice details
 * @param props.email - Customer's email address (defaults to 'billing@example.com')
 * @param props.teamSlug - URL-friendly identifier for the team
 * @param props.companyLogo - URL of the company logo (defaults to BusinessConfig.assets.logo)
 * @param props.invoiceNumber - Unique identifier for the invoice (defaults to 'INV-0001')
 * @param props.invoiceAmount - Total amount paid on the invoice (defaults to '$1,234.56')
 * @param props.paymentDate - Date when the payment was received (defaults to 'March 18, 2024')
 * @param props.paymentMethod - Method used to make the payment (defaults to 'Bank Transfer')
 * @param props.transactionId - Unique identifier for the payment transaction (defaults to 'TRX-123456')
 * @param props.currency - Currency code for the invoice amount (defaults to 'USD')
 * @param props.description - Description of the invoiced goods or services (defaults to 'Monthly Services - March 2024')
 * @param props.contactEmail - Email address for payment or invoice inquiries (defaults to 'support@example.com')
 * @returns JSX component for the invoice payment confirmation email
 */
export default function InvoicePaidEmail({
  customerName = 'Acme Inc',
  teamName = 'Solomon AI',
  link = 'https://app.example.com/invoices/1234567890',
  email = 'billing@example.com',
  teamSlug,
  companyLogo = BusinessConfig.assets.logo,
  invoiceNumber = 'INV-0001',
  invoiceAmount = '$1,234.56',
  paymentDate = 'March 18, 2024',
  paymentMethod = 'Bank Transfer',
  transactionId = 'TRX-123456',
  currency = 'USD',
  description = 'Monthly Services - March 2024',
  contactEmail = 'support@example.com',
}: InvoicePaidEmailProps) {
  const notificationSettingsUrl = `${platform.platformUrl}/${teamSlug}/settings/notifications`

  return (
    <Html>
      <Head />
      <Preview>
        Payment Received: Invoice {invoiceNumber} has been paid by{' '}
        {customerName}
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
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </Column>
              </Row>
            </Section>

            <Heading className="mx-0 my-7 p-0 text-center text-xl font-semibold text-black">
              Payment Received
            </Heading>

            <Section className="mb-8">
              <Row>
                <Column className="px-4">
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <Text className="m-0 text-sm text-gray-900">
                      <strong>Dear {customerName},</strong>
                      <br />
                      <br />
                      Great news! We've received payment for invoice{' '}
                      <strong>{invoiceNumber}</strong>. The payment has been
                      matched and recorded in your account.
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
                      Payment Details:
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
                            Payment Date: {paymentDate}
                          </Text>
                        </Column>
                      </Row>
                      <Row>
                        <Column className="w-5">
                          <CreditCard className="h-4 w-4 text-gray-500" />
                        </Column>
                        <Column>
                          <Text className="m-0 text-sm text-gray-700">
                            Payment Method: {paymentMethod}
                          </Text>
                        </Column>
                      </Row>
                      {description && (
                        <Text className="m-0 mt-2 text-sm text-gray-700">
                          Description: {description}
                          <br />
                          Transaction ID: {transactionId}
                        </Text>
                      )}
                    </div>
                  </div>
                </Column>
              </Row>
            </Section>

            <Text className="text-sm leading-6 text-gray-600">
              The invoice has been automatically linked to the transaction in
              your records. For any questions about this payment or invoice,
              please contact us at{' '}
              <Link href={`mailto:${contactEmail}`} className="text-blue-600">
                {contactEmail}
              </Link>
              .
            </Text>

            <Section className="my-8 text-center">
              <Link
                className="rounded-full bg-black px-6 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={link}
              >
                View Invoice Details
              </Link>
            </Section>

            <Section>
              <Row>
                <Column className="px-4">
                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                    <Text className="m-0 text-sm text-blue-900">
                      💡 Tip: You can customize your payment notifications and
                      auto-matching settings in your account preferences.
                    </Text>
                  </div>
                </Column>
              </Row>
            </Section>

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

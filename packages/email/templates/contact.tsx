/**
 * Contact form email template module.
 * Provides a standardized email template for contact form submissions.
 * @module templates/contact
 */

import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'

/**
 * Properties for the ContactTemplate component.
 *
 * @interface ContactTemplateProps
 * @property {string} name - The name of the person who submitted the contact form
 * @property {string} email - The email address of the person who submitted the contact form
 * @property {string} message - The message content from the contact form submission
 */
type ContactTemplateProps = {
  readonly name: string
  readonly email: string
  readonly message: string
}

/**
 * Email template for contact form submissions.
 * This component renders a professionally formatted email with the
 * contact form details including the sender's name, email, and message.
 *
 * @param props - Component properties
 * @param props.name - The name of the person who submitted the contact form
 * @param props.email - The email address of the person who submitted the contact form
 * @param props.message - The message content from the contact form submission
 * @returns JSX component for the contact form email
 */
export const ContactTemplate = ({
  name,
  email,
  message,
}: ContactTemplateProps) => (
  <Tailwind>
    <Html>
      <Head />
      <Preview>New email from {name}</Preview>
      <Body className="bg-zinc-50 font-sans">
        <Container className="mx-auto py-12">
          <Section className="mt-8 rounded-md bg-zinc-200 p-px">
            <Section className="rounded-[5px] bg-white p-8">
              <Text className="mb-4 mt-0 text-2xl font-semibold text-zinc-950">
                New email from {name}
              </Text>
              <Text className="m-0 text-zinc-500">
                {name} ({email}) has sent you a message:
              </Text>
              <Hr className="my-4" />
              <Text className="m-0 text-zinc-500">{message}</Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  </Tailwind>
)

/**
 * Example implementation of the ContactTemplate with sample data.
 * This serves as both documentation and a preview of how the template renders.
 *
 * @returns JSX component with sample contact form data
 */
const ExampleContactEmail = () => (
  <ContactTemplate
    name="Jane Smith"
    email="jane@example.com"
    message="Hello, how do I get started?"
  />
)

export default ExampleContactEmail

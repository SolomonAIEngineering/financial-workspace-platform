/**
 * Workspace invitation email template module.
 * Provides a professionally designed email for inviting users to join a workspace
 * within the platform.
 * @module workspace-invite
 */

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

/**
 * Workspace invitation email React component.
 * This email invites users to join a specific workspace in the platform,
 * providing a personalized invitation with the workspace details and a direct join link.
 *
 * @param props - Component properties
 * @param props.email - Recipient's email address (defaults to 'panic@thedis.co' if not provided)
 * @param props.appName - Name of the application (defaults to platform.company)
 * @param props.url - URL for joining the workspace
 * @param props.workspaceName - Name of the workspace the user is being invited to
 * @param props.workspaceUser - Name of the user who sent the invitation (can be null)
 * @param props.workspaceUserEmail - Email of the user who sent the invitation (can be null)
 * @returns JSX component for the workspace invitation email
 */
export default function WorkspaceInvite({
  email = 'panic@thedis.co',
  appName = platform.company,
  url = 'http://localhost:8888/api/auth/callback/email?callbackUrl=http%3A%2F%2Fapp.localhost%3A3000%2Flogin&token=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx&email=youremail@gmail.com',
  workspaceName = 'Acme',
  workspaceUser = 'Brendon Urie',
  workspaceUserEmail = 'panic@thedis.co',
}: {
  email: string
  appName: string
  url: string
  workspaceName: string
  workspaceUser: string | null
  workspaceUserEmail: string | null
}) {
  return (
    <Html>
      <Head />
      <Preview>
        Join {workspaceName} on {appName}
      </Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-10 max-w-[500px] rounded border border-solid border-gray-200 px-10 py-5">
            <Section className="mt-8">
              <Img
                src={platform.assets.logo}
                height="140"
                alt={appName}
                className="mx-auto my-0"
              />
            </Section>
            <Heading className="mx-0 my-7 p-0 text-center text-xl font-semibold text-black">
              Join {workspaceName} on {appName}
            </Heading>
            {workspaceUser && workspaceUserEmail ? (
              <Text className="text-sm leading-6 text-black">
                <strong>{workspaceUser}</strong> (
                <Link
                  className="text-blue-600 no-underline"
                  href={`mailto:${workspaceUserEmail}`}
                >
                  {workspaceUserEmail}
                </Link>
                ) has invited you to join the <strong>{workspaceName}</strong>{' '}
                workspace on {appName}!
              </Text>
            ) : (
              <Text className="text-sm leading-6 text-black">
                You have been invited to join the{' '}
                <strong>{workspaceName}</strong> workspace on {appName}!
              </Text>
            )}
            <Section className="mb-8 text-center">
              <Link
                className="rounded-full bg-black px-6 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={url}
              >
                Join Workspace
              </Link>
            </Section>
            <Text className="text-sm leading-6 text-black">
              or copy and paste this URL into your browser:
            </Text>
            <Text className="max-w-sm flex-wrap break-words font-medium text-purple-600 no-underline">
              {url.replace(/^https?:\/\//, '')}
            </Text>
            <Footer email={email} />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

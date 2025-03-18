import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

import Footer from '../components/footer'
import { Tailwind } from '@react-email/tailwind'
import { getPlanDetails } from '../utils/pricing'
import { BusinessConfig as platform } from '@solomonai/platform-config'

export default function UpgradeEmail({
  name = 'Brendon Urie',
  email = 'panic@thedis.co',
  plan = 'Pro',
}: {
  name: string | null
  email: string
  plan: string
}) {
  const planDetails = getPlanDetails(plan)
  return (
    <Html>
      <Head />
      <Preview>
        Thank you for upgrading to {platform.company} {plan}!
      </Preview>
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

            <Text className="text-sm leading-6 text-black">
              Hey{name && ` ${name}`}!
            </Text>
            <Text className="text-sm leading-6 text-black">
              🌟 My name is {platform.founderFirstName}, and I'm the founder of{' '}
              {platform.company}. I'm personally reaching out to express our
              sincere gratitude for your upgrade to{' '}
              <Link
                href={planDetails.link}
                className="font-medium text-blue-600 no-underline"
              >
                {platform.company} {plan}
              </Link>
              ! 🚀
            </Text>
            <Text className="text-sm leading-6 text-black">
              Your enhanced commitment to {platform.company} is incredibly
              meaningful to our entire team. Your trust and support drive us to
              continuously innovate and improve our platform. We're excited to
              provide you with an elevated experience through these premium
              features:
            </Text>
            <Text className="text-sm leading-6 text-black">
              On the {plan} plan, you now have access to:
            </Text>
            {planDetails.features.map((feature) => (
              <Text
                key={`${feature.text}-${Math.random()}`}
                className="ml-1 text-sm leading-4 text-black"
              >
                ◆{' '}
                {feature.footnote?.href ? (
                  <Link href={feature.footnote.href}>{feature.text}</Link>
                ) : (
                  feature.text
                )}
              </Text>
            ))}
            <Text className="text-sm leading-6 text-black">
              Let me know if you have any questions or feedback. I'm always
              happy to help!
            </Text>
            <Text className="text-sm font-light leading-6 text-gray-400">
              {platform.founderFirstName} from {platform.company}
            </Text>
            <Footer email={email} marketing />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

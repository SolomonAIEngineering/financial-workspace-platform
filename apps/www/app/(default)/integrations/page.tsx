export const metadata = {
  title: 'Integrations - Stellar',
  description: 'Page description',
}

import IntegrationsList from './integrations-list'
import IntegrationsSection from './integrations-section'

export default function Integrations() {
  return (
    <>
      <IntegrationsSection />
      <IntegrationsList />
    </>
  )
}

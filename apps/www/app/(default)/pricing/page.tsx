export const metadata = {
  title: 'Pricing - Stellar',
  description: 'Page description',
}

import Cta from '@/components/cta'
import Customers from '@/components/customers'
import Faqs from '@/components/faqs'
import Features from '@/components/features-05'
import PricingSection from './pricing-section'

export default function Pricing() {
  return (
    <>
      <PricingSection />
      <Features />
      <Customers />
      <Faqs />
      <Cta />
    </>
  )
}

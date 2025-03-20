export const metadata = {
  title: 'About - Stellar',
  description: 'Page description',
}

import Cta from '@/components/cta-02'
import Hero from '@/components/hero-about'
import Recruitment from '@/components/recruitment'
import Story from '@/components/story'
import Team from '@/components/team'
import Testimonials from '@/components/testimonials-02'

export default function About() {
  return (
    <>
      <Hero />
      <Story />
      <Team />
      <Recruitment />
      <Testimonials />
      <Cta />
    </>
  )
}

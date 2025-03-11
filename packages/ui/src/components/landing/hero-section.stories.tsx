import { Meta, StoryFn } from '@storybook/react'

import HeroSection from './hero-section'

export default {
  component: HeroSection,
  title: 'Landing/HeroSection',
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    ctaText: { control: 'text' },
    darkImageSrc: { control: 'text' },
    lightImageSrc: { control: 'text' },
    announcement: { control: 'text' },
  },
} as Meta

const Template: StoryFn = (args) => (
  <div className="w-full">
    <HeroSection
      title={''}
      subtitle={''}
      ctaText={''}
      darkImageSrc={''}
      lightImageSrc={''}
      announcement={''}
      {...args}
    />
  </div>
)

export const Default = Template.bind({})
Default.args = {
  title: 'Financial intelligence for your business',
  subtitle:
    'Unlock insights, manage finances, and scale your business with smart financial solutions.',
  ctaText: 'Get Started',
  darkImageSrc:
    'https://placehold.co/800x600/1a1a1a/ffffff?text=Dashboard+Dark',
  lightImageSrc:
    'https://placehold.co/800x600/ffffff/1a1a1a?text=Dashboard+Light',
  announcement: 'New: Financial Planning Tools Now Available',
}

export const WithoutAnnouncement = Template.bind({})
WithoutAnnouncement.args = {
  ...Default.args,
  announcement: undefined,
}

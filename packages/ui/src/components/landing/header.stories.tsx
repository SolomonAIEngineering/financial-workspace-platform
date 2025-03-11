import { Meta, StoryFn } from '@storybook/react'

import { HeaderSection } from './header'

export default {
  component: HeaderSection,
  title: 'Landing/HeaderSection',
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

const Template: StoryFn = () => (
  <div className="w-full">
    <HeaderSection />
  </div>
)

export const Default = Template.bind({})
Default.args = {}

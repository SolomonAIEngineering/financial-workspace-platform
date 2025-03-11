import { Meta, StoryFn } from '@storybook/react'

import ClientSection from './client-section'

export default {
  component: ClientSection,
  title: 'Landing/ClientSection',
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

const Template: StoryFn = () => (
  <div className="w-full">
    <ClientSection />
  </div>
)

export const Default = Template.bind({})
Default.args = {}

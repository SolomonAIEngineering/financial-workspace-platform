import { Meta, StoryFn } from '@storybook/react'

import { FooterSection } from './footer-section'

export default {
  component: FooterSection,
  title: 'Landing/FooterSection',
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
  },
} as Meta

const Template: StoryFn = (args) => (
  <div className="w-full">
    <FooterSection title={''} description={''} {...args} />
  </div>
)

export const Default = Template.bind({})
Default.args = {
  title: 'Solomon AI',
  description:
    'Financial intelligence platform for small and medium businesses',
}

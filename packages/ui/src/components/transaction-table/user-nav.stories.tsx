import { Meta, StoryFn } from '@storybook/react'

import { UserNav } from './user-nav'

export default {
  component: UserNav,
  title: 'TransactionTable/UserNav',
  parameters: {
    layout: 'centered',
  },
} as Meta

const Template: StoryFn = () => (
  <div className="flex justify-end p-4">
    <UserNav />
  </div>
)

export const Default = Template.bind({})
Default.args = {}

import { Meta, StoryObj } from '@storybook/react'

import { ModeToggle } from './mode-toggle'

const meta: Meta<typeof ModeToggle> = {
  title: 'Navigation/CollapsibleSidebar/ModeToggle',
  component: ModeToggle,
  parameters: {
    layout: 'centered',
  },
  // tags: ["autodocs"], // Removed to fix conflict with MDX docs
  argTypes: {
    className: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof ModeToggle>

export const Default: Story = {
  args: {
    className: '',
  },
}

export const WithCustomStyle: Story = {
  args: {
    className: 'border border-gray-200 p-2 rounded-md',
  },
}

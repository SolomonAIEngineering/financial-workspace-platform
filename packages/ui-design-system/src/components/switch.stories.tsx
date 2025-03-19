import type { Meta, StoryObj } from '@storybook/react'

import { Switch } from './switch'

const meta: Meta<typeof Switch> = {
  component: Switch,
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof Switch>

export const Default: Story = {
  render: () => <Switch />,
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <label
        htmlFor="airplane-mode"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Airplane Mode
      </label>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="disabled-switch" disabled />
      <label
        htmlFor="disabled-switch"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Disabled
      </label>
    </div>
  ),
}

export const Checked: Story = {
  render: () => <Switch defaultChecked />,
}

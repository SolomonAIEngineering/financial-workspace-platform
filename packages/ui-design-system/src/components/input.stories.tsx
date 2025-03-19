import type { Meta, StoryObj } from '@storybook/react'

import { SearchIcon } from 'lucide-react'
import { Input } from './input'

const meta: Meta<typeof Input> = {
  component: Input,
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof Input>

export const Default: Story = {
  render: () => <Input placeholder="Email" />,
}

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <label htmlFor="email" className="text-sm font-medium">
        Email
      </label>
      <Input id="email" placeholder="Enter your email" />
    </div>
  ),
}

export const Disabled: Story = {
  render: () => <Input disabled placeholder="Disabled input" />,
}

export const WithIcon: Story = {
  render: () => (
    <div className="relative w-full max-w-sm">
      <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
      <Input className="pl-8" placeholder="Search..." />
    </div>
  ),
}

export const WithError: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <label htmlFor="error-input" className="text-sm font-medium">
        Username
      </label>
      <Input
        id="error-input"
        className="border-red-500"
        placeholder="Invalid username"
      />
      <p className="text-sm text-red-500">Username already taken</p>
    </div>
  ),
}

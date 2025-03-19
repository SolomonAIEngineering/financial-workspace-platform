import type { Meta, StoryObj } from '@storybook/react'

import { Spinner } from './spinner'

const meta: Meta<typeof Spinner> = {
  component: Spinner,
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof Spinner>

export const Default: Story = {
  render: () => <Spinner />,
}

export const Small: Story = {
  render: () => <Spinner size={16} />,
}

export const Large: Story = {
  render: () => <Spinner size={32} />,
}

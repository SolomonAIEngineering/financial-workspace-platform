import type { Meta, StoryObj } from '@storybook/react'
import { Status } from './status'

const meta = {
  title: 'Templates/OG/Components/Status',
  component: Status,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Status>

export default meta
type Story = StoryObj<typeof meta>

export const Draft: Story = {
  args: {
    status: 'draft',
  },
}

export const Paid: Story = {
  args: {
    status: 'paid',
  },
}

export const Unpaid: Story = {
  args: {
    status: 'unpaid',
  },
}

export const Overdue: Story = {
  args: {
    status: 'overdue',
  },
}

export const Canceled: Story = {
  args: {
    status: 'canceled',
  },
}

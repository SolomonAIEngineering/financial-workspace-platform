import type { Meta, StoryObj } from '@storybook/react'
import { Header } from './header'

const meta = {
  title: 'Templates/OG/Components/Header',
  component: Header,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Header>

export default meta
type Story = StoryObj<typeof meta>

export const WithLogo: Story = {
  args: {
    customerName: 'Acme Inc.',
    status: 'paid',
    logoUrl: 'https://placehold.co/100x100.png',
    isValidLogo: true,
  },
}

export const WithInitial: Story = {
  args: {
    customerName: 'Acme Inc.',
    status: 'unpaid',
    isValidLogo: false,
  },
}

export const Draft: Story = {
  args: {
    customerName: 'Acme Inc.',
    status: 'draft',
    isValidLogo: false,
  },
}

export const Overdue: Story = {
  args: {
    customerName: 'Acme Inc.',
    status: 'overdue',
    isValidLogo: false,
  },
}

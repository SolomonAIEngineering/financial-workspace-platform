import type { Meta, StoryObj } from '@storybook/react'
import { Avatar } from './avatar'

const meta = {
  title: 'Templates/OG/Components/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const WithLogo: Story = {
  args: {
    logoUrl: 'https://placehold.co/100x100.png',
    isValidLogo: true,
    customerName: 'Acme Inc.',
  },
}

export const WithInitial: Story = {
  args: {
    isValidLogo: false,
    customerName: 'Acme Inc.',
  },
}

export const WithLogoButInvalid: Story = {
  args: {
    logoUrl: 'https://placehold.co/100x100.png',
    isValidLogo: false,
    customerName: 'Acme Inc.',
  },
}

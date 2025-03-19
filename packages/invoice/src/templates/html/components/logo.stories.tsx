import type { Meta, StoryObj } from '@storybook/react'
import { Logo } from './logo'

const meta = {
  title: 'Templates/HTML/Components/Logo',
  component: Logo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Logo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    logo: 'https://placehold.co/150x80.png',
    customerName: 'Acme Inc.',
  },
}

export const TallLogo: Story = {
  args: {
    logo: 'https://placehold.co/100x150.png',
    customerName: 'Tall Logo Company',
  },
}

export const WideLogo: Story = {
  args: {
    logo: 'https://placehold.co/200x50.png',
    customerName: 'Wide Logo Company',
  },
}

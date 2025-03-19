import type { Meta, StoryObj } from '@storybook/react'
import { QRCode } from './qr-code'

const meta = {
  title: 'Templates/PDF/Components/QRCode',
  component: QRCode,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof QRCode>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    data: 'https://placehold.co/50x50.png',
    size: 50,
  },
}

export const Larger: Story = {
  args: {
    data: 'https://placehold.co/100x100.png',
    size: 100,
  },
}

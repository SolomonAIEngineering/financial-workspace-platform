import type { Meta, StoryObj } from '@storybook/react'
import { LineItems } from './line-items'

const meta = {
  title: 'Templates/PDF/Components/LineItems',
  component: LineItems,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LineItems>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    lineItems: [
      {
        name: 'Professional Services',
        quantity: 10,
        price: 100,
        unit: 'hours',
      },
      {
        name: 'Software License',
        quantity: 1,
        price: 499,
        unit: 'license',
      },
    ],
    currency: 'USD',
    descriptionLabel: 'Description',
    quantityLabel: 'Qty',
    priceLabel: 'Price',
    totalLabel: 'Total',
    locale: 'en-US',
    includeDecimals: true,
    includeUnits: true,
  },
}

export const WithoutDecimals: Story = {
  args: {
    ...Default.args,
    includeDecimals: false,
  },
}

export const WithoutUnits: Story = {
  args: {
    ...Default.args,
    includeUnits: false,
  },
}

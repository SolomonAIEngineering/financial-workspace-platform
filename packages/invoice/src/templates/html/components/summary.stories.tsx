import type { Meta, StoryObj } from '@storybook/react'
import { Summary } from './summary'

const meta = {
  title: 'Templates/HTML/Components/Summary',
  component: Summary,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Summary>

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
    locale: 'en-US',
    includeDecimals: true,
    includeVAT: false,
    includeTax: false,
    includeDiscount: false,
    taxRate: 0,
    vatRate: 0,
    vatLabel: 'VAT',
    taxLabel: 'Tax',
    totalLabel: 'Total Due',
    subtotalLabel: 'Subtotal',
    discountLabel: 'Discount',
  },
}

export const WithTax: Story = {
  args: {
    ...Default.args,
    includeTax: true,
    taxRate: 10,
  },
}

export const WithVAT: Story = {
  args: {
    ...Default.args,
    includeVAT: true,
    vatRate: 5,
  },
}

export const WithDiscount: Story = {
  args: {
    ...Default.args,
    includeDiscount: true,
    discount: 100,
  },
}

export const WithAllItems: Story = {
  args: {
    ...Default.args,
    includeDiscount: true,
    discount: 100,
    includeTax: true,
    taxRate: 10,
    includeVAT: true,
    vatRate: 5,
  },
}

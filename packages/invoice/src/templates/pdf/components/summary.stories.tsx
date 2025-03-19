import type { Meta, StoryObj } from '@storybook/react'
import { Summary } from './summary'

const meta = {
  title: 'Templates/PDF/Components/Summary',
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
    amount: 1650,
    currency: 'USD',
    totalLabel: 'Total Due',
    taxLabel: 'Tax',
    vatLabel: 'VAT',
    locale: 'en-US',
    discountLabel: 'Discount',
    includeDiscount: false,
    includeVAT: false,
    includeTax: false,
    includeDecimals: true,
    subtotalLabel: 'Subtotal',
    subtotal: 1500,
  },
}

export const WithTax: Story = {
  args: {
    ...Default.args,
    includeTax: true,
    tax: 150,
    taxRate: 10,
  },
}

export const WithVAT: Story = {
  args: {
    ...Default.args,
    includeVAT: true,
    vat: 75,
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
    includeTax: true,
    tax: 150,
    taxRate: 10,
    includeVAT: true,
    vat: 75,
    vatRate: 5,
    includeDiscount: true,
    discount: 100,
  },
}

import { Meta, StoryObj } from '@storybook/react'

import { TransactionCard } from './transaction-card'

const meta: Meta<typeof TransactionCard> = {
  title: 'Cards/TransactionCard',
  component: TransactionCard,
  parameters: {
    layout: 'centered',
  },
  // tags: ["autodocs"], // Removed to fix conflict with MDX docs
  argTypes: {
    transaction: { control: 'object' },
    enableSimpleView: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof TransactionCard>

export const Default: Story = {
  args: {
    transaction: {
      id: 'tx-123',
      transactionId: 'tx-123',
      amount: -245.5,
      merchantName: 'Staples',
    },
    enableSimpleView: false,
  },
}

export const SimpleView: Story = {
  args: {
    transaction: {
      id: 'tx-123',
      transactionId: 'tx-123',
      amount: -245.5,
      merchantName: 'Staples',
    },
    enableSimpleView: true,
  },
}

export const LargeTransaction: Story = {
  args: {
    transaction: {
      id: 'tx-456',
      transactionId: 'tx-456',
      amount: 5840.25,
      merchantName: 'ABC Corporation',
    },
    enableSimpleView: false,
  },
}

export const PendingTransaction: Story = {
  args: {
    transaction: {
      id: 'tx-789',
      transactionId: 'tx-789',
      amount: -89.99,
      merchantName: 'Adobe Inc.',
    },
    enableSimpleView: false,
  },
}

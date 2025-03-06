import type { Meta, StoryObj } from '@storybook/react'
import { MessageInput } from './message-input'

const meta = {
  title: 'Chat/MessageInput',
  component: MessageInput,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MessageInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onSubmit: (message) => console.log('Message submitted:', message),
    placeholder: 'Type a message...',
  },
}

export const Disabled: Story = {
  args: {
    onSubmit: (message) => console.log('Message submitted:', message),
    placeholder: 'Type a message...',
    disabled: true,
  },
}

export const CustomPlaceholder: Story = {
  args: {
    onSubmit: (message) => console.log('Message submitted:', message),
    placeholder: 'Ask me anything...',
  },
}

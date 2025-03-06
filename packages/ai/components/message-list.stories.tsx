import type { Meta, StoryObj } from '@storybook/react'
import { type Message } from 'ai'
import { MessageList } from './message-list'

const meta = {
  title: 'Chat/MessageList',
  component: MessageList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MessageList>

export default meta
type Story = StoryObj<typeof meta>

const mockMessages: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'Hello!',
    createdAt: new Date(),
  },
  {
    id: '2',
    role: 'assistant',
    content: 'Hi! How can I help you today?',
    createdAt: new Date(),
  },
  {
    id: '3',
    role: 'user',
    content: 'I need help with React',
    createdAt: new Date(),
  },
  {
    id: '4',
    role: 'assistant',
    content:
      'Sure! What specific aspect of React would you like to learn about?',
    createdAt: new Date(),
  },
]

export const Default: Story = {
  args: {
    messages: mockMessages,
  },
}

export const Loading: Story = {
  args: {
    messages: mockMessages,
    isLoading: true,
  },
}

export const Empty: Story = {
  args: {
    messages: [],
  },
}

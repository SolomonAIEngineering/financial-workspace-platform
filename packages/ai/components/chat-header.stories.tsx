import type { Meta, StoryObj } from '@storybook/react'
import { ChatHeader } from './chat-header'

const meta = {
  title: 'Chat/ChatHeader',
  component: ChatHeader,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ChatHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'AI Assistant',
  },
}

export const WithSubtitle: Story = {
  args: {
    title: 'AI Assistant',
    subtitle: 'Online',
  },
}

export const WithActions: Story = {
  args: {
    title: 'AI Assistant',
    subtitle: 'Online',
    actions: (
      <div className="flex gap-2">
        <button
          type="button"
          className="bg-primary rounded-md px-3 py-1 text-white"
        >
          Clear
        </button>
        <button
          type="button"
          className="bg-primary rounded-md px-3 py-1 text-white"
        >
          Settings
        </button>
      </div>
    ),
  },
}

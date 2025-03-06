import type { Meta, StoryObj } from '@storybook/react'
import { Message } from './message'

const meta = {
  title: 'Chat/Message',
  component: Message,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Message>

export default meta
type Story = StoryObj<typeof meta>

export const UserMessage: Story = {
  args: {
    data: {
      id: '1',
      role: 'user',
      content: 'Hello, how can you help me today?',
      createdAt: new Date(),
    },
  },
}

export const AssistantMessage: Story = {
  args: {
    data: {
      id: '2',
      role: 'assistant',
      content: "Hi! I'm here to help you with any questions you might have.",
      createdAt: new Date(),
    },
  },
}

export const MarkdownContent: Story = {
  args: {
    data: {
      id: '3',
      role: 'assistant',
      content: `
# Markdown Support
Here's what I can render:
- **Bold text**
- *Italic text*
- \`inline code\`
\`\`\`typescript
// Code blocks
function hello() {
    console.log('Hello, world!');
}
\`\`\`
            `,
      createdAt: new Date(),
    },
  },
}

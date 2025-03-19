import type { Meta, StoryObj } from '@storybook/react'
import { Description } from './description'

const meta = {
  title: 'Templates/PDF/Components/Description',
  component: Description,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Description>

export default meta
type Story = StoryObj<typeof meta>

export const PlainText: Story = {
  args: {
    content: 'Simple text description',
  },
}

export const JSONContent: Story = {
  args: {
    content: JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Rich text description',
            },
          ],
        },
      ],
    }),
  },
}

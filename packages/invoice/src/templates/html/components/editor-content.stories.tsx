import type { Meta, StoryObj } from '@storybook/react'
import { EditorDoc } from '../../types'
import { EditorContent } from './editor-content'

const meta = {
  title: 'Templates/HTML/Components/EditorContent',
  component: EditorContent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof EditorContent>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Sample editor content',
            },
          ],
        },
      ],
    } as EditorDoc,
  },
}

export const WithMultipleParagraphs: Story = {
  args: {
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'First paragraph',
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Second paragraph',
            },
          ],
        },
      ],
    } as EditorDoc,
  },
}

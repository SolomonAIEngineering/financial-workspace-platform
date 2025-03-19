import type { Meta, StoryObj } from '@storybook/react'
import { useRef } from 'react'
import { Editor } from '../../index'

// We need to use a wrapper component because BubbleMenu requires an editor instance
const BubbleMenuDemo = ({
  initialContent,
  placeholder,
}: {
  initialContent?: string
  placeholder?: string
}) => {
  const editorRef = useRef<HTMLDivElement>(null)

  // The bubble menu is included within the Editor component
  return (
    <div className="border-border min-h-[300px] w-full max-w-[800px] rounded-md border p-4">
      <p className="mb-4 text-sm text-gray-500">
        Type some text and select it to see the bubble menu
      </p>
      <Editor
        initialContent={
          initialContent ||
          '<p>Select this text to see the BubbleMenu appear. You can format it as <strong>bold</strong>, <em>italic</em>, <s>strikethrough</s>, or add a link.</p>'
        }
        placeholder={placeholder}
        className="min-h-[200px]"
      />
    </div>
  )
}

const meta = {
  title: 'Components/Editor/BubbleMenu',
  component: BubbleMenuDemo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    initialContent: { control: 'text' },
    placeholder: { control: 'text' },
  },
} satisfies Meta<typeof BubbleMenuDemo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const WithCustomContent: Story = {
  args: {
    initialContent:
      '<p>Select this customized text to activate the bubble menu and try the formatting options.</p>',
  },
}

export const WithPlaceholder: Story = {
  args: {
    initialContent: '',
    placeholder: 'Type and select text to see formatting options...',
  },
}

import type { Meta, StoryObj } from '@storybook/react'
import { Editor } from '../index'

// This component is for documentation purposes
const EditorExtensionsDemo = () => {
  return (
    <div className="w-full max-w-[800px] space-y-6">
      <div className="border-border rounded-md border p-4">
        <h2 className="mb-4 text-lg font-medium">Editor Extensions System</h2>
        <p className="mb-4">
          The editor is built on top of TiptapJS and uses a modular extension
          system. The current extensions include:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>StarterKit</strong>: Provides basic editor functionality
            (paragraphs, headings, lists, etc.)
          </li>
          <li>
            <strong>Underline</strong>: Adds underline formatting
          </li>
          <li>
            <strong>Link</strong>: Enables adding and editing links with
            auto-linking capability
          </li>
          <li>
            <strong>Placeholder</strong>: Shows placeholder text when the editor
            is empty
          </li>
        </ul>

        <h3 className="text-md mb-2 mt-6 font-medium">AI Extensions</h3>
        <p className="mb-4">
          The editor also includes AI capabilities through the bubble menu:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong>Grammar Check</strong>: Fixes grammatical errors
          </li>
          <li>
            <strong>Improve</strong>: Enhances clarity and professionalism
          </li>
          <li>
            <strong>Condense</strong>: Makes text more concise
          </li>
          <li>
            <strong>Custom Prompts</strong>: Allows for custom AI instructions
          </li>
        </ul>
      </div>

      <div className="border-border rounded-md border p-4">
        <h3 className="mb-2 font-medium">Live Editor Example</h3>
        <p className="mb-4 text-sm text-gray-500">
          Try out the editor with all extensions enabled:
        </p>
        <Editor
          initialContent="<p>This editor demonstrates all the available extensions.</p><p>Try <strong>bold</strong>, <em>italic</em>, <s>strikethrough</s>, and <u>underline</u> formatting.</p><p>You can also add <a href='https://example.com'>links</a> and use the AI features by selecting text.</p>"
          className="min-h-[200px]"
        />
      </div>

      <div className="border-border rounded-md border p-4">
        <h3 className="mb-2 font-medium">Adding Custom Extensions</h3>
        <p className="mb-2">
          Extensions are registered in <code>registerExtensions.ts</code>:
        </p>
        <pre className="overflow-auto rounded bg-gray-100 p-2 text-sm">
          {`// Add your extensions here
const extensions = [
  StarterKit,
  Underline,
  Link.configure({
    openOnClick: false,
    autolink: true,
    defaultProtocol: "https",
  }),
];

export function registerExtensions(options) {
  const { placeholder } = options ?? {};
  return [...extensions, Placeholder.configure({ placeholder })];
}`}
        </pre>
        <p className="mt-4 text-sm">
          To add a new extension, import it and add it to the extensions array.
        </p>
      </div>
    </div>
  )
}

const meta = {
  title: 'Components/Editor/Extensions',
  component: EditorExtensionsDemo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "Documentation for the Editor's extension system, which allows for modular functionality.",
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof EditorExtensionsDemo>

export default meta
type Story = StoryObj<typeof meta>

export const Documentation: Story = {}

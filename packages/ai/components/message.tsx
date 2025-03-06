import type { Message as MessageType } from 'ai'
import type { ComponentProps } from 'react'
import Markdown from 'react-markdown'
import { twMerge } from 'tailwind-merge'

/**
 * Props for the Message component
 * @interface MessageProps
 * @property {MessageType} data - The message data containing role and content
 * @property {ComponentProps<typeof Markdown>} [markdown] - Optional props to pass to the Markdown component
 */
type MessageProps = {
  data: MessageType
  markdown?: ComponentProps<typeof Markdown>
}

/**
 * Message component that renders a chat message with different styles based on the sender's role
 *
 * @component
 * @example
 * ```tsx
 * const message = {
 *   role: 'user',
 *   content: 'Hello, how are you?'
 * };
 *
 * <Message data={message} />
 * ```
 *
 * @description
 * The Message component displays chat messages with different styling for user and assistant messages.
 * It supports markdown content rendering and automatically adjusts its appearance based on the message role.
 *
 * Features:
 * - Different styling for user and assistant messages
 * - Markdown support for message content
 * - Maximum width constraint (80% of container)
 * - Responsive layout with proper alignment
 * - Rounded corners and padding for better visual appearance
 *
 * @param props - Component props
 * @param props.data - The message data containing role and content
 * @param props.markdown - Optional props to pass to the Markdown renderer
 *
 * @returns A styled message component with markdown support
 */
export const Message = ({ data, markdown }: MessageProps) => (
  <div
    className={twMerge(
      'flex max-w-[80%] flex-col gap-2 rounded-xl px-4 py-2',
      data.role === 'user'
        ? 'bg-foreground text-background self-end'
        : 'bg-muted self-start',
    )}
  >
    <Markdown {...markdown}>{data.content}</Markdown>
  </div>
)

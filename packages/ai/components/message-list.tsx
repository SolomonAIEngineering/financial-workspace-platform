import { useEffect, useRef } from 'react'

import type { Message as MessageType } from 'ai'
import { twMerge } from 'tailwind-merge'
import { Message } from './message'

/**
 * Props for the MessageList component
 * @interface MessageListProps
 * @property {MessageType[]} messages - Array of messages to display
 * @property {boolean} [isLoading] - Whether new messages are being loaded
 * @property {string} [className] - Additional CSS classes
 */
type MessageListProps = {
  messages: MessageType[]
  isLoading?: boolean
  className?: string
}

/**
 * Component to display a scrollable list of messages
 *
 * @component
 * @example
 * ```tsx
 * <MessageList
 *   messages={messages}
 *   isLoading={true}
 * />
 * ```
 *
 * @description
 * Renders a scrollable list of messages with automatic scroll-to-bottom
 * behavior when new messages arrive. Supports loading states and
 * custom styling.
 */
export const MessageList = ({
  messages,
  isLoading,
  className,
}: MessageListProps) => {
  const bottomRef = useRef<HTMLDivElement>(null)

  // We only need to scroll when the bottomRef is available
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const scrollToBottom = () => {
      bottomRef.current?.scrollIntoView?.({ behavior: 'smooth' })
    }
    scrollToBottom()
  }, [messages.length]) // Only depend on messages.length for scrolling

  return (
    <ul
      className={twMerge(
        'flex flex-1 flex-col gap-4 overflow-y-auto p-4',
        className,
      )}
    >
      {messages.map((message) => (
        <li key={message.id}>
          <Message data={message} />
        </li>
      ))}
      {isLoading && (
        <output aria-label="Loading message" className="self-start">
          <Message
            data={{
              id: 'loading',
              role: 'assistant',
              content: '',
              createdAt: new Date(),
            }}
          />
        </output>
      )}
      <div ref={bottomRef} className="h-0 w-0" aria-hidden="true" />
    </ul>
  )
}

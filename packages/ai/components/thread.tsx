import type { HTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

/**
 * Props interface extending HTMLDivElement attributes for the Thread component
 */
type ThreadProps = HTMLAttributes<HTMLDivElement>

/**
 * Thread component that creates a vertically scrollable container for chat/message threads
 *
 * @component
 * @example
 * ```tsx
 * <Thread>
 *   <Message>Hello</Message>
 *   <Message>How are you?</Message>
 * </Thread>
 * ```
 *
 * @description
 * The Thread component serves as a container for chat or message threads.
 * It provides a scrollable area with flex layout and consistent spacing between child elements.
 *
 * Key features:
 * - Vertical scrolling with overflow-y-auto
 * - Flex layout with column direction
 * - Consistent gap spacing between children (1rem/16px)
 * - Left-aligned content
 * - Padding on all sides except bottom
 *
 * @param props - Component props
 * @param props.children - Child elements to be rendered within the thread
 * @param props.className - Additional CSS classes to be merged with default styles
 * @param props.props - Any additional HTML div element props
 *
 * @returns A div element configured for thread-like content display
 */
export const Thread = ({ children, className, ...props }: ThreadProps) => (
  <div
    className={twMerge(
      'flex flex-1 flex-col items-start gap-4 overflow-y-auto p-8 pb-0',
      className,
    )}
    {...props}
  >
    {children}
  </div>
)

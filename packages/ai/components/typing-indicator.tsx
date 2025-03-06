import { twMerge } from 'tailwind-merge'

/**
 * Props for the TypingIndicator component
 * @interface TypingIndicatorProps
 * @property {boolean} [isTyping] - Whether to show the typing indicator
 * @property {string} [className] - Additional CSS classes
 */
type TypingIndicatorProps = {
  isTyping?: boolean
  className?: string
}

/**
 * Animated typing indicator for AI responses
 *
 * @component
 * @example
 * ```tsx
 * <TypingIndicator isTyping={true} />
 * ```
 *
 * @description
 * Displays an animated indicator when the AI is "typing" a response.
 * Includes accessibility announcements and smooth transitions.
 */
export const TypingIndicator = ({
  isTyping,
  className,
}: TypingIndicatorProps) => {
  if (!isTyping) return null

  return (
    <div
      className={twMerge(
        'bg-muted flex gap-2 self-start rounded-xl px-4 py-2',
        className,
      )}
      // biome-ignore lint/a11y/useSemanticElements: <explanation>
      role="status"
      aria-label="AI is typing"
    >
      {[1, 2, 3].map((dot) => (
        <div
          key={dot}
          className={twMerge(
            'bg-foreground/50 h-2 w-2 rounded-full',
            'animate-bounce',
            dot === 2 && 'animation-delay-200',
            dot === 3 && 'animation-delay-400',
          )}
        />
      ))}
    </div>
  )
}

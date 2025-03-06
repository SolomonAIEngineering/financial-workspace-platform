import type { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

/**
 * Props for the ChatHeader component
 * @interface ChatHeaderProps
 * @property {string} title - The title of the chat
 * @property {string} [subtitle] - Optional subtitle or status text
 * @property {ReactNode} [actions] - Optional actions/buttons to display
 * @property {string} [className] - Additional CSS classes
 */
type ChatHeaderProps = {
  title: string
  subtitle?: string
  actions?: ReactNode
  className?: string
}

/**
 * Header component for the chat interface
 *
 * @component
 * @example
 * ```tsx
 * <ChatHeader
 *   title="AI Assistant"
 *   subtitle="Online"
 *   actions={<SettingsButton />}
 * />
 * ```
 *
 * @description
 * Displays a header with title, optional subtitle, and action buttons.
 * Provides consistent styling and layout for the chat interface.
 */
export const ChatHeader = ({
  title,
  subtitle,
  actions,
  className,
}: ChatHeaderProps) => (
  <header
    className={twMerge(
      'flex items-center justify-between',
      'bg-background border-b px-4 py-3',
      'sticky top-0 z-10',
      className,
    )}
  >
    <div className="flex flex-col">
      <h1 className="text-lg font-semibold">{title}</h1>
      {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </header>
)

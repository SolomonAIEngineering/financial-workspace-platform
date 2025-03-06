import type { ButtonHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

/**
 * Props for individual suggestion chips
 * @interface ChipProps
 * @extends ButtonHTMLAttributes<HTMLButtonElement>
 * @property {string} label - Text to display in the chip
 */
type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
}

/**
 * Props for the SuggestionChips component
 * @interface SuggestionChipsProps
 * @property {string[]} suggestions - Array of suggestion texts
 * @property {(suggestion: string) => void} onSelect - Callback when a suggestion is selected
 */
type SuggestionChipsProps = {
  suggestions: string[]
  onSelect: (suggestion: string) => void
}

/**
 * Individual suggestion chip component
 */
const Chip = ({ label, className, ...props }: ChipProps) => (
  <button
    type="button"
    className={twMerge(
      'rounded-full px-4 py-2 text-sm',
      'bg-muted hover:bg-muted/80',
      'transition-colors duration-200',
      className,
    )}
    {...props}
  >
    {label}
  </button>
)

/**
 * Suggestion chips component for quick response options
 *
 * @component
 * @example
 * ```tsx
 * <SuggestionChips
 *   suggestions={['Tell me more', 'Why?', 'How does it work?']}
 *   onSelect={(text) => handleSuggestion(text)}
 * />
 * ```
 *
 * @description
 * Displays a row of clickable suggestion chips that users can select
 * for quick responses or common queries.
 */
export const SuggestionChips = ({
  suggestions,
  onSelect,
}: SuggestionChipsProps) => (
  <div
    className="flex flex-wrap gap-2"
    // biome-ignore lint/a11y/useSemanticElements: <explanation>
    role="group"
    aria-label="Suggested responses"
  >
    {suggestions.map((suggestion) => (
      <Chip
        key={suggestion}
        label={suggestion}
        onClick={() => onSelect(suggestion)}
      />
    ))}
  </div>
)

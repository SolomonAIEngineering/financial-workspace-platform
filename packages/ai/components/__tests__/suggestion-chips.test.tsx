import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { SuggestionChips } from '../suggestion-chips'

describe('SuggestionChips', () => {
  const mockSuggestions = ['Tell me more', 'Why?', 'How does it work?']
  const mockOnSelect = vi.fn()

  beforeEach(() => {
    mockOnSelect.mockClear()
  })

  it('renders all suggestion chips', () => {
    render(
      <SuggestionChips suggestions={mockSuggestions} onSelect={mockOnSelect} />,
    )

    // biome-ignore lint/complexity/noForEach: <explanation>
    mockSuggestions.forEach((suggestion) => {
      expect(screen.getByText(suggestion)).toBeInTheDocument()
    })
  })

  it('calls onSelect with correct suggestion when clicked', () => {
    render(
      <SuggestionChips suggestions={mockSuggestions} onSelect={mockOnSelect} />,
    )

    const firstChip = screen.getByText(mockSuggestions[0])
    fireEvent.click(firstChip)

    expect(mockOnSelect).toHaveBeenCalledTimes(1)
    expect(mockOnSelect).toHaveBeenCalledWith(mockSuggestions[0])
  })

  it('renders chips as buttons', () => {
    render(
      <SuggestionChips suggestions={mockSuggestions} onSelect={mockOnSelect} />,
    )

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(mockSuggestions.length)
  })

  it('applies correct styling to chips', () => {
    render(
      <SuggestionChips suggestions={mockSuggestions} onSelect={mockOnSelect} />,
    )

    const firstChip = screen.getByText(mockSuggestions[0])
    expect(firstChip).toHaveClass('rounded-full')
    expect(firstChip).toHaveClass('bg-muted')
    expect(firstChip).toHaveClass('text-sm')
  })

  it('renders with correct accessibility attributes', () => {
    render(
      <SuggestionChips suggestions={mockSuggestions} onSelect={mockOnSelect} />,
    )

    const container = screen.getByRole('group')
    expect(container).toHaveAttribute('aria-label', 'Suggested responses')
  })

  it('handles empty suggestions array', () => {
    render(<SuggestionChips suggestions={[]} onSelect={mockOnSelect} />)

    const container = screen.getByRole('group')
    expect(container).toBeEmptyDOMElement()
  })
})

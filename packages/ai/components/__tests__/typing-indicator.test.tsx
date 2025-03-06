import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TypingIndicator } from '../typing-indicator'

describe('TypingIndicator', () => {
  it('renders nothing when not typing', () => {
    const { container } = render(<TypingIndicator isTyping={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders indicator when typing', () => {
    render(<TypingIndicator isTyping={true} />)
    const indicator = screen.getByRole('status')
    expect(indicator).toBeInTheDocument()
    expect(indicator).toHaveAttribute('aria-label', 'AI is typing')
  })

  it('renders three animated dots', () => {
    const { container } = render(<TypingIndicator isTyping={true} />)
    const dots = container.querySelectorAll('.animate-bounce')
    expect(dots).toHaveLength(3)
  })

  it('applies custom className correctly', () => {
    const { container } = render(
      <TypingIndicator isTyping={true} className="custom-class" />,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('maintains base styling with custom className', () => {
    const { container } = render(
      <TypingIndicator isTyping={true} className="custom-class" />,
    )
    const element = container.firstChild as HTMLElement
    expect(element).toHaveClass('flex')
    expect(element).toHaveClass('gap-2')
    expect(element).toHaveClass('self-start')
    expect(element).toHaveClass('rounded-xl')
    expect(element).toHaveClass('bg-muted')
  })
})

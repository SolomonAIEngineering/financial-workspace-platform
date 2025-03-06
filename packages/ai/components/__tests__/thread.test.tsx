import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Thread } from '../thread'

describe('Thread', () => {
  it('renders children correctly', () => {
    render(
      <Thread>
        <div data-testid="child-1">Message 1</div>
        <div data-testid="child-2">Message 2</div>
      </Thread>,
    )

    expect(screen.getByTestId('child-1')).toBeInTheDocument()
    expect(screen.getByTestId('child-2')).toBeInTheDocument()
  })

  it('merges custom className with default styles', () => {
    const { container } = render(
      <Thread className="custom-class">
        <div>Content</div>
      </Thread>,
    )

    const threadElement = container.firstChild as HTMLElement
    expect(threadElement).toHaveClass('custom-class')
    expect(threadElement).toHaveClass('flex')
    expect(threadElement).toHaveClass('flex-1')
    expect(threadElement).toHaveClass('flex-col')
    expect(threadElement).toHaveClass('items-start')
    expect(threadElement).toHaveClass('gap-4')
    expect(threadElement).toHaveClass('overflow-y-auto')
    expect(threadElement).toHaveClass('p-8')
    expect(threadElement).toHaveClass('pb-0')
  })

  it('passes through additional HTML attributes', () => {
    const { container } = render(
      <Thread data-custom="test" aria-label="chat thread">
        <div>Content</div>
      </Thread>,
    )

    const threadElement = container.firstChild as HTMLElement
    expect(threadElement).toHaveAttribute('data-custom', 'test')
    expect(threadElement).toHaveAttribute('aria-label', 'chat thread')
  })

  it('maintains correct layout structure', () => {
    const { container } = render(
      <Thread>
        <div>Message 1</div>
        <div>Message 2</div>
      </Thread>,
    )

    const threadElement = container.firstChild as HTMLElement

    // Check for layout classes instead of computed styles
    expect(threadElement).toHaveClass('flex')
    expect(threadElement).toHaveClass('flex-col')
    expect(threadElement.children.length).toBe(2)
  })
})

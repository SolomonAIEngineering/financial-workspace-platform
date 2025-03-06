import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AccessibilityAnnouncer } from '../a11y-announcer'

describe('AccessibilityAnnouncer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders with correct ARIA attributes', () => {
    render(<AccessibilityAnnouncer message="Test message" />)

    const announcer = screen.getByRole('status')
    expect(announcer).toHaveAttribute('aria-live', 'polite')
    expect(announcer).toHaveAttribute('aria-atomic', 'true')
  })

  it('displays the provided message', () => {
    render(<AccessibilityAnnouncer message="Test message" />)
    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('clears message after timeout', async () => {
    render(<AccessibilityAnnouncer message="Test message" timeout={1000} />)

    expect(screen.getByText('Test message')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.queryByText('Test message')).not.toBeInTheDocument()
  })

  it('updates message when prop changes', () => {
    const { rerender } = render(
      <AccessibilityAnnouncer message="Initial message" />,
    )
    expect(screen.getByText('Initial message')).toBeInTheDocument()

    rerender(<AccessibilityAnnouncer message="Updated message" />)
    expect(screen.getByText('Updated message')).toBeInTheDocument()
  })

  it('respects custom timeout', () => {
    render(<AccessibilityAnnouncer message="Test message" timeout={2000} />)

    expect(screen.getByText('Test message')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.getByText('Test message')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.queryByText('Test message')).not.toBeInTheDocument()
  })

  it('handles assertive aria-live', () => {
    render(
      <AccessibilityAnnouncer message="Test message" ariaLive="assertive" />,
    )

    const announcer = screen.getByRole('status')
    expect(announcer).toHaveAttribute('aria-live', 'assertive')
  })

  it('applies correct visibility classes', () => {
    const { container } = render(
      <AccessibilityAnnouncer message="Test message" />,
    )

    const element = container.firstChild as HTMLElement
    expect(element).toHaveClass('sr-only')
    expect(element).toHaveClass('pointer-events-none')
    expect(element).toHaveClass('fixed')
  })

  it('cleans up timeout on unmount', () => {
    const { unmount } = render(
      <AccessibilityAnnouncer message="Test message" />,
    )

    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')
    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
  })
})

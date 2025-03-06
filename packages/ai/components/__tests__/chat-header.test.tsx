import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ChatHeader } from '../chat-header'

describe('ChatHeader', () => {
  it('renders title correctly', () => {
    render(<ChatHeader title="Test Chat" />)
    expect(screen.getByText('Test Chat')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(<ChatHeader title="Test Chat" subtitle="Online" />)
    expect(screen.getByText('Online')).toBeInTheDocument()
  })

  it('renders actions when provided', () => {
    render(
      <ChatHeader
        title="Test Chat"
        actions={<button type="button">Settings</button>}
      />,
    )
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <ChatHeader title="Test Chat" className="custom-class" />,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('maintains semantic header structure', () => {
    render(<ChatHeader title="Test Chat" subtitle="Online" />)
    const header = screen.getByRole('banner')
    const heading = screen.getByRole('heading', { level: 1 })

    expect(header).toBeInTheDocument()
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Test Chat')
  })
})

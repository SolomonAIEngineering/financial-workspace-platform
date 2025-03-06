import { render, screen } from '@testing-library/react'
import { type Message } from 'ai'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { MessageList } from '../message-list'

describe('MessageList', () => {
  const mockMessages: Message[] = [
    {
      id: '1',
      role: 'user',
      content: 'Hello',
      createdAt: new Date(),
    },
    {
      id: '2',
      role: 'assistant',
      content: 'Hi there!',
      createdAt: new Date(),
    },
  ]

  // Mock scrollIntoView before each test
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn()
  })

  it('renders all messages', () => {
    render(<MessageList messages={mockMessages} />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('Hi there!')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<MessageList messages={mockMessages} isLoading={true} />)
    const loadingMessage = screen.getByLabelText('Loading message')
    expect(loadingMessage).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <MessageList messages={mockMessages} className="custom-class" />,
    )
    const listElement = container.firstChild as HTMLElement
    expect(listElement).toHaveClass('custom-class')
  })

  it('scrolls to bottom when messages change', () => {
    render(<MessageList messages={mockMessages} />)
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
    })
  })

  it('handles empty message list', () => {
    render(<MessageList messages={[]} />)
    const listElement = screen.getByRole('list')
    // Check that it only contains the hidden scroll anchor
    expect(listElement.children).toHaveLength(1)
    expect(listElement.children[0]).toHaveAttribute('aria-hidden', 'true')
  })

  it('updates scroll position when new messages arrive', () => {
    const { rerender } = render(<MessageList messages={mockMessages} />)

    const newMessages: Message[] = [
      ...mockMessages,
      {
        id: '3',
        role: 'user',
        content: 'New message',
        createdAt: new Date(),
      },
    ]

    rerender(<MessageList messages={newMessages} />)
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(2)
  })

  it('renders loading state without messages', () => {
    render(<MessageList messages={[]} isLoading={true} />)
    const loadingMessage = screen.getByLabelText('Loading message')
    expect(loadingMessage).toBeInTheDocument()
  })

  it('uses semantic list elements', () => {
    render(<MessageList messages={mockMessages} />)
    const list = screen.getByRole('list')
    const items = screen.getAllByRole('listitem')

    expect(list).toBeInTheDocument()
    expect(items).toHaveLength(mockMessages.length)
  })
})

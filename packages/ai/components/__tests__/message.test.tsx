import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { Message as MessageType } from 'ai'
import { ComponentPropsWithoutRef } from 'react'
import Markdown from 'react-markdown'
import { Message } from '../message'

describe('Message', () => {
  const userMessage: MessageType = {
    id: '1',
    role: 'user',
    content: 'Hello world',
    createdAt: new Date(),
  }

  const assistantMessage: MessageType = {
    id: '2',
    role: 'assistant',
    content: 'Hello! How can I help you?',
    createdAt: new Date(),
  }

  it('renders user message with correct styling', () => {
    const { container } = render(<Message data={userMessage} />)
    const messageElement = container.firstChild as HTMLElement

    expect(messageElement).toHaveClass('self-end')
    expect(messageElement).toHaveClass('bg-foreground')
    expect(messageElement).toHaveClass('text-background')
    expect(messageElement).toHaveTextContent('Hello world')
  })

  it('renders assistant message with correct styling', () => {
    const { container } = render(<Message data={assistantMessage} />)
    const messageElement = container.firstChild as HTMLElement

    expect(messageElement).toHaveClass('self-start')
    expect(messageElement).toHaveClass('bg-muted')
    expect(messageElement).toHaveTextContent('Hello! How can I help you?')
  })

  it('renders markdown content correctly', () => {
    const markdownMessage: MessageType = {
      id: '3',
      role: 'assistant',
      content: '**Bold** and *italic* text',
      createdAt: new Date(),
    }

    render(<Message data={markdownMessage} />)

    const boldText = screen.getByText('Bold')
    const italicText = screen.getByText('italic')

    expect(boldText.tagName).toBe('STRONG')
    expect(italicText.tagName).toBe('EM')
  })

  it('applies common styling to all messages', () => {
    const { container } = render(<Message data={userMessage} />)
    const messageElement = container.firstChild as HTMLElement

    expect(messageElement).toHaveClass('flex')
    expect(messageElement).toHaveClass('max-w-[80%]')
    expect(messageElement).toHaveClass('flex-col')
    expect(messageElement).toHaveClass('gap-2')
    expect(messageElement).toHaveClass('rounded-xl')
    expect(messageElement).toHaveClass('px-4')
    expect(messageElement).toHaveClass('py-2')
  })

  it('passes markdown props correctly', () => {
    const markdownProps: ComponentPropsWithoutRef<typeof Markdown> = {
      className: 'custom-markdown',
      components: {
        p: function CustomParagraph(props) {
          return <p className="custom-paragraph">{props.children}</p>
        },
      },
    }

    const { container } = render(
      <Message data={userMessage} markdown={markdownProps} />,
    )

    const paragraph = container.querySelector('.custom-paragraph')
    expect(paragraph).toBeInTheDocument()
    expect(paragraph).toHaveTextContent('Hello world')
  })
})

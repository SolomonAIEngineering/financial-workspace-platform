import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { MessageInput } from '../message-input'

describe('MessageInput', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  it('submits message on button click', () => {
    render(<MessageInput onSubmit={mockOnSubmit} />)

    const textarea = screen.getByRole('textbox')
    const button = screen.getByRole('button')

    fireEvent.change(textarea, { target: { value: 'Test message' } })
    fireEvent.click(button)

    expect(mockOnSubmit).toHaveBeenCalledWith('Test message')
    expect(textarea).toHaveValue('')
  })

  it('submits message on Enter key', () => {
    render(<MessageInput onSubmit={mockOnSubmit} />)

    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Test message' } })
    fireEvent.keyDown(textarea, { key: 'Enter' })

    expect(mockOnSubmit).toHaveBeenCalledWith('Test message')
    expect(textarea).toHaveValue('')
  })

  it('does not submit empty messages', () => {
    render(<MessageInput onSubmit={mockOnSubmit} />)

    const textarea = screen.getByRole('textbox')
    const button = screen.getByRole('button')

    fireEvent.change(textarea, { target: { value: '   ' } })
    fireEvent.click(button)

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('respects disabled state', () => {
    render(<MessageInput onSubmit={mockOnSubmit} disabled={true} />)

    const textarea = screen.getByRole('textbox')
    const button = screen.getByRole('button')

    expect(textarea).toBeDisabled()
    expect(button).toBeDisabled()
  })

  it('shows custom placeholder', () => {
    render(
      <MessageInput onSubmit={mockOnSubmit} placeholder="Custom placeholder" />,
    )

    const textarea = screen.getByPlaceholderText('Custom placeholder')
    expect(textarea).toBeInTheDocument()
  })
})

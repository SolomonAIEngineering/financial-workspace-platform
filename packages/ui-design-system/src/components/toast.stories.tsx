import type { Meta, StoryObj } from '@storybook/react'
import {
  Toast,
  ToastAction,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from './toast'

import { useState } from 'react'
import { Button } from './button'

const meta: Meta<typeof Toast> = {
  component: Toast,
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof Toast>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)

    return (
      <ToastProvider>
        <Button onClick={() => setOpen(true)}>Show Toast</Button>
        <Toast open={open} onOpenChange={setOpen}>
          <ToastTitle>Notification</ToastTitle>
          <ToastDescription>Your message has been sent.</ToastDescription>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    )
  },
}

export const WithAction: Story = {
  render: () => {
    const [open, setOpen] = useState(false)

    return (
      <ToastProvider>
        <Button onClick={() => setOpen(true)}>Show Toast with Action</Button>
        <Toast open={open} onOpenChange={setOpen}>
          <ToastTitle>Scheduled</ToastTitle>
          <ToastDescription>Your meeting has been scheduled.</ToastDescription>
          <ToastAction altText="View">View</ToastAction>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    )
  },
}

export const Destructive: Story = {
  render: () => {
    const [open, setOpen] = useState(false)

    return (
      <ToastProvider>
        <Button onClick={() => setOpen(true)}>Show Destructive Toast</Button>
        <Toast open={open} onOpenChange={setOpen} variant="destructive">
          <ToastTitle>Error</ToastTitle>
          <ToastDescription>
            There was a problem with your request.
          </ToastDescription>
          <ToastAction altText="Try again">Try again</ToastAction>
        </Toast>
        <ToastViewport />
      </ToastProvider>
    )
  },
}

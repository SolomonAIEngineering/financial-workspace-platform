import type { Meta, StoryObj } from '@storybook/react'
import { AccessibilityAnnouncer } from './a11y-announcer'

const meta = {
  title: 'Accessibility/Announcer',
  component: AccessibilityAnnouncer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AccessibilityAnnouncer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    message: 'This message will be announced to screen readers',
  },
}

export const AssertiveAnnouncement: Story = {
  args: {
    message: 'Important announcement!',
    ariaLive: 'assertive',
  },
}

export const CustomTimeout: Story = {
  args: {
    message: 'This message will clear after 5 seconds',
    timeout: 5000,
  },
}

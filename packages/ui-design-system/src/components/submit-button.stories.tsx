import type { Meta, StoryObj } from '@storybook/react'

import { SubmitButton } from './submit-button'

const meta: Meta<typeof SubmitButton> = {
  component: SubmitButton,
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof SubmitButton>

export const Default: Story = {
  render: () => <SubmitButton isSubmitting={false}>Submit</SubmitButton>,
}

export const Loading: Story = {
  render: () => <SubmitButton isSubmitting>Submit</SubmitButton>,
}

export const Disabled: Story = {
  render: () => (
    <SubmitButton disabled isSubmitting={false}>
      Submit
    </SubmitButton>
  ),
}

export const WithVariant: Story = {
  render: () => (
    <div className="flex flex-col space-y-4">
      <SubmitButton variant="default" isSubmitting={false}>
        Default
      </SubmitButton>
      <SubmitButton variant="destructive" isSubmitting={false}>
        Destructive
      </SubmitButton>
      <SubmitButton variant="outline" isSubmitting={false}>
        Outline
      </SubmitButton>
      <SubmitButton variant="secondary" isSubmitting={false}>
        Secondary
      </SubmitButton>
      <SubmitButton variant="ghost" isSubmitting={false}>
        Ghost
      </SubmitButton>
      <SubmitButton variant="link" isSubmitting={false}>
        Link
      </SubmitButton>
    </div>
  ),
}

export const WithSize: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <SubmitButton size="sm" isSubmitting={false}>
        Small
      </SubmitButton>
      <SubmitButton size="default" isSubmitting={false}>
        Default
      </SubmitButton>
      <SubmitButton size="lg" isSubmitting={false}>
        Large
      </SubmitButton>
    </div>
  ),
}

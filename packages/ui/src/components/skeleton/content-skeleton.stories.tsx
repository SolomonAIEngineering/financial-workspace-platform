import type { Meta, StoryObj } from '@storybook/react'
import { ContentPlaceholder } from './content-skeleton'

const meta: Meta<typeof ContentPlaceholder> = {
  component: ContentPlaceholder,
  // tags: ["autodocs"], // Removed to fix conflict with MDX docs
}

export default meta
type Story = StoryObj<typeof ContentPlaceholder>

export const Default: Story = {}

export const CustomHeight: Story = {
  render: () => (
    <div>
      <ContentPlaceholder chartType="bar" enableStats={true} />
    </div>
  ),
}

export const CustomLineChart: Story = {
  render: () => <ContentPlaceholder chartType="line" enableStats={true} />,
}

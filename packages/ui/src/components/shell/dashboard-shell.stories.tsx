import { Meta, StoryFn } from '@storybook/react'
import { DashboardHeader, DashboardShell } from './dashboard-shell'

import { Button } from '../button'

export default {
  title: 'Shell/DashboardShell',
  component: DashboardShell,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta

const Template: StoryFn = (args) => (
  <div className="container mx-auto p-6">
    <DashboardShell {...args}>
      <DashboardHeader heading={args.heading} text={args.text}>
        {args.showButton && <Button variant="outline">Action Button</Button>}
      </DashboardHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm"
          >
            <div className="flex flex-col space-y-1.5 pb-4">
              <h3 className="text-lg font-semibold">Card {i + 1}</h3>
              <p className="text-muted-foreground text-sm">
                Sample content for dashboard item
              </p>
            </div>
            <div className="bg-muted flex h-32 items-center justify-center rounded-md">
              Content Area
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  </div>
)

export const Default = Template.bind({})
Default.args = {
  heading: 'Dashboard',
  text: 'Welcome to your dashboard overview.',
  showButton: true,
}

export const WithoutText = Template.bind({})
WithoutText.args = {
  heading: 'Dashboard',
  showButton: true,
}

export const WithoutButton = Template.bind({})
WithoutButton.args = {
  heading: 'Dashboard',
  text: 'Welcome to your dashboard overview.',
  showButton: false,
}

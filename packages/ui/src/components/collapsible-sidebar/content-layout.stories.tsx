import { Meta, StoryObj } from '@storybook/react'

import { ContentLayout } from './content-layout'

const meta: Meta<typeof ContentLayout> = {
  title: 'Navigation/CollapsibleSidebar/ContentLayout',
  component: ContentLayout,
  parameters: {
    layout: 'padded',
  },
  // tags: ["autodocs"], // Removed to fix conflict with MDX docs
  argTypes: {
    className: { control: 'text' },
    children: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof ContentLayout>

export const Default: Story = {
  args: {
    className: 'min-h-[500px] border border-gray-200 rounded-md',
    children: (
      <div className="p-6">
        <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>
        <p className="mb-4">
          Welcome to your dashboard. Here's an overview of your account
          activity.
        </p>
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="mb-2 font-medium">Total Revenue</h3>
            <p className="text-2xl font-bold">$24,512.00</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="mb-2 font-medium">New Customers</h3>
            <p className="text-2xl font-bold">25</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="mb-2 font-medium">Pending Orders</h3>
            <p className="text-2xl font-bold">12</p>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="mb-4 font-bold">Recent Activity</h2>
          <div className="space-y-2">
            <div className="border-b p-2">New order received - #12345</div>
            <div className="border-b p-2">Customer feedback - 5 stars</div>
            <div className="border-b p-2">
              Inventory alert - Product XYZ low stock
            </div>
            <div className="p-2">Payment received - $1,250.00</div>
          </div>
        </div>
      </div>
    ),
  },
}

export const WithSidebarCollapsed: Story = {
  args: {
    className: 'min-h-[500px] border border-gray-200 rounded-md',
    children: (
      <div className="p-6">
        <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>
        <p className="mb-4">
          Welcome to your dashboard. Here's an overview of your account
          activity.
        </p>
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="mb-2 font-medium">Total Revenue</h3>
            <p className="text-2xl font-bold">$24,512.00</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="mb-2 font-medium">New Customers</h3>
            <p className="text-2xl font-bold">25</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="mb-2 font-medium">Pending Orders</h3>
            <p className="text-2xl font-bold">12</p>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="mb-4 font-bold">Recent Activity</h2>
          <div className="space-y-2">
            <div className="border-b p-2">New order received - #12345</div>
            <div className="border-b p-2">Customer feedback - 5 stars</div>
            <div className="border-b p-2">
              Inventory alert - Product XYZ low stock
            </div>
            <div className="p-2">Payment received - $1,250.00</div>
          </div>
        </div>
      </div>
    ),
  },
}

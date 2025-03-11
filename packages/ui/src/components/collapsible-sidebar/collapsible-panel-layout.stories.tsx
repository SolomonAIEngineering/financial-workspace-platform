import { Meta, StoryObj } from '@storybook/react'

import CollapsiblePanelLayout from './collapsible-panel-layout'

const meta: Meta<typeof CollapsiblePanelLayout> = {
  title: 'Navigation/CollapsibleSidebar/CollapsiblePanelLayout',
  component: CollapsiblePanelLayout,
  parameters: {
    layout: 'fullscreen',
  },
  // tags: ["autodocs"], // Removed to fix conflict with MDX docs
  argTypes: {
    defaultCollapsed: { control: 'boolean' },
    sidebarContent: { control: 'text' },
    mainContent: { control: 'text' },
    className: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof CollapsiblePanelLayout>

const SidebarContent = () => (
  <div className="flex h-full flex-col">
    <div className="border-b p-4">
      <h2 className="text-lg font-semibold">Application</h2>
    </div>
    <div className="flex-grow p-4">
      <ul className="space-y-2">
        <li className="rounded bg-gray-100 p-2">Dashboard</li>
        <li className="p-2">Analytics</li>
        <li className="p-2">Customers</li>
        <li className="p-2">Products</li>
        <li className="p-2">Settings</li>
      </ul>
    </div>
    <div className="border-t p-4">
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-full bg-gray-200"></div>
        <div>
          <div className="font-medium">John Doe</div>
          <div className="text-sm text-gray-500">Administrator</div>
        </div>
      </div>
    </div>
  </div>
)

const MainContent = () => (
  <div className="p-6">
    <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>
    <p className="mb-4">
      Welcome to your dashboard. Here's an overview of your account activity.
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
)

export const Default: Story = {
  args: {
    defaultCollapsed: false,
    sidebarContent: <SidebarContent />,
    mainContent: <MainContent />,
    className: 'min-h-screen',
  },
}

export const InitiallyCollapsed: Story = {
  args: {
    defaultCollapsed: true,
    sidebarContent: <SidebarContent />,
    mainContent: <MainContent />,
    className: 'min-h-screen',
  },
}

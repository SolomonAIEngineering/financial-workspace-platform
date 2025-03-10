import { Meta, StoryObj } from "@storybook/react";

import CollapsiblePanelLayout from "./collapsible-panel-layout";

const meta: Meta<typeof CollapsiblePanelLayout> = {
    title: "Navigation/CollapsibleSidebar/CollapsiblePanelLayout",
    component: CollapsiblePanelLayout,
    parameters: {
        layout: "fullscreen",
    },
    // tags: ["autodocs"], // Removed to fix conflict with MDX docs
    argTypes: {
        defaultCollapsed: { control: "boolean" },
        sidebarContent: { control: "text" },
        mainContent: { control: "text" },
        className: { control: "text" },
    },
};

export default meta;
type Story = StoryObj<typeof CollapsiblePanelLayout>;

const SidebarContent = () => (
    <div className="h-full flex flex-col">
        <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Application</h2>
        </div>
        <div className="p-4 flex-grow">
            <ul className="space-y-2">
                <li className="p-2 bg-gray-100 rounded">Dashboard</li>
                <li className="p-2">Analytics</li>
                <li className="p-2">Customers</li>
                <li className="p-2">Products</li>
                <li className="p-2">Settings</li>
            </ul>
        </div>
        <div className="p-4 border-t">
            <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div>
                    <div className="font-medium">John Doe</div>
                    <div className="text-sm text-gray-500">Administrator</div>
                </div>
            </div>
        </div>
    </div>
);

const MainContent = () => (
    <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="mb-4">Welcome to your dashboard. Here's an overview of your account activity.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-white shadow rounded-lg">
                <h3 className="font-medium mb-2">Total Revenue</h3>
                <p className="text-2xl font-bold">$24,512.00</p>
            </div>
            <div className="p-4 bg-white shadow rounded-lg">
                <h3 className="font-medium mb-2">New Customers</h3>
                <p className="text-2xl font-bold">25</p>
            </div>
            <div className="p-4 bg-white shadow rounded-lg">
                <h3 className="font-medium mb-2">Pending Orders</h3>
                <p className="text-2xl font-bold">12</p>
            </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
            <h2 className="font-bold mb-4">Recent Activity</h2>
            <div className="space-y-2">
                <div className="p-2 border-b">New order received - #12345</div>
                <div className="p-2 border-b">Customer feedback - 5 stars</div>
                <div className="p-2 border-b">Inventory alert - Product XYZ low stock</div>
                <div className="p-2">Payment received - $1,250.00</div>
            </div>
        </div>
    </div>
);

export const Default: Story = {
    args: {
        defaultCollapsed: false,
        sidebarContent: <SidebarContent />,
        mainContent: <MainContent />,
        className: "min-h-screen",
    },
};

export const InitiallyCollapsed: Story = {
    args: {
        defaultCollapsed: true,
        sidebarContent: <SidebarContent />,
        mainContent: <MainContent />,
        className: "min-h-screen",
    },
}; 
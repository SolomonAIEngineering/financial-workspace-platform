import { Meta, StoryObj } from "@storybook/react";

import { ContentLayout } from "./content-layout";

const meta: Meta<typeof ContentLayout> = {
    title: "Navigation/CollapsibleSidebar/ContentLayout",
    component: ContentLayout,
    parameters: {
        layout: "padded",
    },
    // tags: ["autodocs"], // Removed to fix conflict with MDX docs
    argTypes: {
        className: { control: "text" },
        children: { control: "text" },
    },
};

export default meta;
type Story = StoryObj<typeof ContentLayout>;

export const Default: Story = {
    args: {
        className: "min-h-[500px] border border-gray-200 rounded-md",
        children: (
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
        ),
    },
};

export const WithSidebarCollapsed: Story = {
    args: {
        className: "min-h-[500px] border border-gray-200 rounded-md",
        children: (
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
        ),
    },
}; 
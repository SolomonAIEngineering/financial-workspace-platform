import { Meta, StoryObj } from "@storybook/react";

import { Menu } from "./menu";

const meta: Meta<typeof Menu> = {
    title: "Navigation/CollapsibleSidebar/Menu",
    component: Menu,
    parameters: {
        layout: "centered",
    },
    // tags: ["autodocs"], // Removed to fix conflict with MDX docs
    argTypes: {
        className: { control: "text" },
    },
};

export default meta;
type Story = StoryObj<typeof Menu>;

const defaultItems = [
    {
        title: "Dashboard",
        icon: "HomeIcon",
        href: "/dashboard",
        active: true
    },
    {
        title: "Analytics",
        icon: "BarChartIcon",
        href: "/analytics"
    },
    {
        title: "Customers",
        icon: "UsersIcon",
        href: "/customers"
    },
    {
        title: "Products",
        icon: "PackageIcon",
        href: "/products"
    },
    {
        title: "Settings",
        icon: "SettingsIcon",
        href: "/settings"
    }
];

export const Default: Story = {
    args: {
        className: "w-64 p-4 bg-white shadow rounded-md",
    },
};

export const Collapsed: Story = {
    args: {
        className: "w-16 p-4 bg-white shadow rounded-md",
    },
};

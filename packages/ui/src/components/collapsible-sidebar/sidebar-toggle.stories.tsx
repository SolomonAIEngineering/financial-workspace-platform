import { Meta, StoryObj } from "@storybook/react";

import { SidebarToggle } from "./sidebar-toggle";

const meta: Meta<typeof SidebarToggle> = {
    title: "Navigation/CollapsibleSidebar/SidebarToggle",
    component: SidebarToggle,
    parameters: {
        layout: "centered",
    },
    // tags: ["autodocs"], // Removed to fix conflict with MDX docs
    argTypes: {
        isOpen: { control: "boolean" },
        setIsOpen: { action: "clicked" },
    },
};

export default meta;
type Story = StoryObj<typeof SidebarToggle>;

export const Default: Story = {
    args: {
        isOpen: true,
    },
};

export const Collapsed: Story = {
    args: {
        isOpen: false,
    },
};

export const CustomStyle: Story = {
    args: {
        isOpen: true,
    },
}; 
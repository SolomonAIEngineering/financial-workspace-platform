import { Meta, StoryObj } from "@storybook/react";

import { CollapseMenuButton } from "./collapse-menu-button";

const meta: Meta<typeof CollapseMenuButton> = {
    title: "Navigation/CollapsibleSidebar/CollapseMenuButton",
    component: CollapseMenuButton,
    parameters: {
        layout: "centered",
    },
    // tags: ["autodocs"], // Removed to fix conflict with MDX docs
    argTypes: {
        className: { control: "text" },
    },
};

export default meta;
type Story = StoryObj<typeof CollapseMenuButton>;

export const Default: Story = {
    args: {
        collapsed: false,
        className: "my-2",
    },
};

export const Collapsed: Story = {
    args: {
        collapsed: true,
        className: "my-2",
    },
};

export const CustomStyle: Story = {
    args: {
        collapsed: false,
        className: "my-4 bg-blue-100 p-2 rounded-md hover:bg-blue-200",
    },
}; 
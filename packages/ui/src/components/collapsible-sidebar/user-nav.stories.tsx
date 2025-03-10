import { Meta, StoryObj } from "@storybook/react";

import { UserNav } from "./user-nav";

const meta: Meta<typeof UserNav> = {
    title: "Navigation/CollapsibleSidebar/UserNav",
    component: UserNav,
    parameters: {
        layout: "centered",
    },
    // tags: ["autodocs"], // Removed to fix conflict with MDX docs
    argTypes: {
        user: { control: "object" },
        className: { control: "text" },
    },
};

export default meta;
type Story = StoryObj<typeof UserNav>;

export const Default: Story = {
    args: {
        user: {
            name: "John Doe",
            email: "john.doe@example.com",
            avatar: "https://placehold.co/40x40"
        },
        className: "",
    },
};

export const WithCustomClass: Story = {
    args: {
        user: {
            name: "Jane Smith",
            email: "jane.smith@example.com",
            avatar: "https://placehold.co/40x40"
        },
        className: "border p-2 rounded-md",
    },
};

export const NoAvatar: Story = {
    args: {
        user: {
            name: "Alex Johnson",
            email: "alex.johnson@example.com"
        },
        className: "",
    },
}; 
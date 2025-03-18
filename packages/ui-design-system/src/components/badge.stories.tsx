import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
    component: Badge,
    tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {
    render: () => <Badge>Badge</Badge>,
};

export const Secondary: Story = {
    render: () => <Badge variant="secondary">Secondary</Badge>,
};

export const Destructive: Story = {
    render: () => <Badge variant="destructive">Destructive</Badge>,
};

export const Outline: Story = {
    render: () => <Badge variant="outline">Outline</Badge>,
};

export const Tag: Story = {
    render: () => <Badge variant="tag">Tag</Badge>,
};

export const WithIcon: Story = {
    render: () => (
        <Badge>
            <span className="mr-1">●</span>
            <span>Status</span>
        </Badge>
    ),
}; 
import type { Meta, StoryObj } from "@storybook/react";

import { Spinner } from "./spinner";

const meta: Meta<typeof Spinner> = {
    component: Spinner,
    tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
    render: () => <Spinner />,
};

export const Small: Story = {
    render: () => <Spinner className="h-4 w-4" />,
};

export const Large: Story = {
    render: () => <Spinner className="h-12 w-12" />,
};

export const CustomColor: Story = {
    render: () => <Spinner className="text-blue-500" />,
}; 
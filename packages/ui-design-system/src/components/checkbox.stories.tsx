import type { Meta, StoryObj } from "@storybook/react";

import { Checkbox } from "./checkbox";

const meta: Meta<typeof Checkbox> = {
    component: Checkbox,
    tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
    render: () => <Checkbox />,
};

export const WithLabel: Story = {
    render: () => (
        <div className="flex items-center space-x-2">
            <Checkbox id="terms" />
            <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
                Accept terms and conditions
            </label>
        </div>
    ),
};

export const Disabled: Story = {
    render: () => (
        <div className="flex items-center space-x-2">
            <Checkbox id="disabled" disabled />
            <label
                htmlFor="disabled"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
                Disabled checkbox
            </label>
        </div>
    ),
};

export const Checked: Story = {
    render: () => <Checkbox defaultChecked />,
}; 
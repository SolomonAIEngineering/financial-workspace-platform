import type { Meta, StoryObj } from "@storybook/react";

import { SubmitButton } from "./submit-button";

const meta: Meta<typeof SubmitButton> = {
    component: SubmitButton,
    tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof SubmitButton>;

export const Default: Story = {
    render: () => <SubmitButton>Submit</SubmitButton>,
};

export const Loading: Story = {
    render: () => <SubmitButton isLoading>Submit</SubmitButton>,
};

export const Disabled: Story = {
    render: () => <SubmitButton disabled>Submit</SubmitButton>,
};

export const WithVariant: Story = {
    render: () => (
        <div className="flex flex-col space-y-4">
            <SubmitButton variant="default">Default</SubmitButton>
            <SubmitButton variant="destructive">Destructive</SubmitButton>
            <SubmitButton variant="outline">Outline</SubmitButton>
            <SubmitButton variant="secondary">Secondary</SubmitButton>
            <SubmitButton variant="ghost">Ghost</SubmitButton>
            <SubmitButton variant="link">Link</SubmitButton>
        </div>
    ),
};

export const WithSize: Story = {
    render: () => (
        <div className="flex items-center space-x-4">
            <SubmitButton size="sm">Small</SubmitButton>
            <SubmitButton size="default">Default</SubmitButton>
            <SubmitButton size="lg">Large</SubmitButton>
        </div>
    ),
}; 
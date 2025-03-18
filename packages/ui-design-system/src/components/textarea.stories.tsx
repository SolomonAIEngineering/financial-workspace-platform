import type { Meta, StoryObj } from "@storybook/react";

import { Label } from "./label";
import { Textarea } from "./textarea";

const meta: Meta<typeof Textarea> = {
    component: Textarea,
    tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
    render: () => <Textarea placeholder="Type your message here." />,
};

export const WithLabel: Story = {
    render: () => (
        <div className="grid w-full gap-1.5">
            <Label htmlFor="message">Your message</Label>
            <Textarea id="message" placeholder="Type your message here." />
        </div>
    ),
};

export const Disabled: Story = {
    render: () => <Textarea disabled placeholder="This textarea is disabled." />,
};

export const WithValue: Story = {
    render: () => (
        <Textarea
            defaultValue="I really enjoyed working with your team. The project was delivered on time and with great quality."
            placeholder="Type your message here."
        />
    ),
};

export const WithCustomHeight: Story = {
    render: () => (
        <Textarea
            className="min-h-[150px]"
            placeholder="Type your detailed feedback here."
        />
    ),
};

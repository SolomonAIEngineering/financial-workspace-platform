import type { Meta, StoryObj } from "@storybook/react";

import { Slider } from "./slider";
import { useState } from "react";

const meta = {
    component: Slider,
    tags: ["autodocs"],
} satisfies Meta<typeof Slider>;

export default meta;

type Story = StoryObj<typeof Slider>;

export const Default: Story = {
    render: () => <Slider defaultValue={[50]} max={100} step={1} />,
};

export const Range: Story = {
    render: () => <Slider defaultValue={[25, 75]} max={100} step={1} />,
};

export const WithLabels: Story = {
    render: () => {
        const [value, setValue] = useState([33]);
        return (
            <div className="space-y-4">
                <div className="flex justify-between">
                    <span className="text-sm">Min</span>
                    <span className="text-sm">Current: {value[0]}%</span>
                    <span className="text-sm">Max</span>
                </div>
                <Slider defaultValue={value} max={100} step={1} onValueChange={setValue} />
            </div>
        );
    },
};

export const Disabled: Story = {
    render: () => <Slider defaultValue={[50]} max={100} step={1} disabled />,
};

export const CustomMarks: Story = {
    render: () => (
        <div className="relative w-full max-w-md">
            <Slider defaultValue={[25]} max={100} step={25} />
            <div className="flex justify-between mt-1 px-1">
                <span className="text-sm">0%</span>
                <span className="text-sm">25%</span>
                <span className="text-sm">50%</span>
                <span className="text-sm">75%</span>
                <span className="text-sm">100%</span>
            </div>
        </div>
    ),
}; 
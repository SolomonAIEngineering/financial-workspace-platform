import type { Meta, StoryObj } from "@storybook/react";

import { Separator } from "./separator";

const meta: Meta<typeof Separator> = {
    component: Separator,
    tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Separator>;

export const Default: Story = {
    render: () => (
        <div>
            <div className="space-y-1">
                <h4 className="text-sm font-medium leading-none">Top Section</h4>
                <p className="text-sm text-muted-foreground">
                    This is the top section content
                </p>
            </div>
            <Separator className="my-4" />
            <div className="space-y-1">
                <h4 className="text-sm font-medium leading-none">Bottom Section</h4>
                <p className="text-sm text-muted-foreground">
                    This is the bottom section content
                </p>
            </div>
        </div>
    ),
};

export const Vertical: Story = {
    render: () => (
        <div className="flex h-5 items-center space-x-4 text-sm">
            <div>Left</div>
            <Separator orientation="vertical" />
            <div>Middle</div>
            <Separator orientation="vertical" />
            <div>Right</div>
        </div>
    ),
};

export const WithDifferentColor: Story = {
    render: () => (
        <div>
            <div className="space-y-1">
                <h4 className="text-sm font-medium leading-none">Custom Color</h4>
                <p className="text-sm text-muted-foreground">
                    This separator has a custom color
                </p>
            </div>
            <Separator className="my-4 bg-primary" />
            <div className="space-y-1">
                <h4 className="text-sm font-medium leading-none">Bottom Section</h4>
                <p className="text-sm text-muted-foreground">
                    This is the bottom section content
                </p>
            </div>
        </div>
    ),
}; 
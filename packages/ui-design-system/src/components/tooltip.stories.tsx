import { HelpCircleIcon, InfoIcon, PlusIcon } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./tooltip";

import { Button } from "./button";

const meta: Meta<typeof Tooltip> = {
    component: Tooltip,
    tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
    render: () => (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" className="w-10 h-10 p-0">
                        <PlusIcon className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Add to library</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    ),
};

export const WithDifferentSides: Story = {
    render: () => (
        <div className="flex items-center space-x-4">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline">Top</Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p>This tooltip appears on the top</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline">Right</Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>This tooltip appears on the right</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline">Bottom</Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <p>This tooltip appears on the bottom</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline">Left</Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        <p>This tooltip appears on the left</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    ),
};

export const HelpTooltip: Story = {
    render: () => (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <HelpCircleIcon className="h-4 w-4 text-gray-500" />
                </TooltipTrigger>
                <TooltipContent>
                    <p>This feature helps you organize your files.</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    ),
}; 
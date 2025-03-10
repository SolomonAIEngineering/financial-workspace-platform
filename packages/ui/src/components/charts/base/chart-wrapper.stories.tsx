import { ChartWrapper, ChartWrapperProps, } from "./chart-wrapper";
import { Meta, StoryFn } from "@storybook/react";

import React from "react";

export default {
    component: ChartWrapper,
    parameters: {
        layout: "centered",
    },
    argTypes: {
        buttonText: {
            control: "text",
        },
        openButtonText: {
            control: "text",
        },
        initiallyOpen: {
            control: "boolean",
        },
        animationDuration: {
            control: { type: "range", min: 100, max: 1000, step: 50 },
        },
    },
} as Meta;

const Template: StoryFn<ChartWrapperProps> = (args) => (
    <div className="w-[600px]">
        <ChartWrapper {...args}>
            <div className="p-4 border rounded bg-slate-100">
                <h3 className="text-lg font-medium">Chart Content</h3>
                <p className="text-sm text-gray-500">
                    This is example content that would be wrapped by the ChartWrapper component.
                    It can include charts, tables, or any other React components.
                </p>
                <div className="h-40 mt-4 bg-white rounded flex items-center justify-center">
                    Sample chart visualization area
                </div>
            </div>
        </ChartWrapper>
    </div>
);

export const Default = Template.bind({});
Default.args = {
    buttonText: "Show Chart",
    openButtonText: "Hide Chart",
    initiallyOpen: false,
    animationDuration: 300,
};

export const InitiallyOpen = Template.bind({});
InitiallyOpen.args = {
    ...Default.args,
    initiallyOpen: true,
};

export const SlowAnimation = Template.bind({});
SlowAnimation.args = {
    ...Default.args,
    animationDuration: 800,
    buttonText: "Slow Reveal",
}; 
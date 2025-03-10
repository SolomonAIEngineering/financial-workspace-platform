import { Meta, StoryFn } from "@storybook/react";

import { Button } from "../button";
import { CallToActionSection } from "./call-to-action-section";
import React from "react";

export default {
    title: "Landing/CallToActionSection",
    component: CallToActionSection,
    parameters: {
        layout: "fullscreen",
    },
} as Meta;

const Template: StoryFn<{
    title: string;
    description: string;
    children?: React.ReactNode;
}> = (args) => <CallToActionSection {...args} />;

export const Default = Template.bind({});
Default.args = {
    title: "Ready to Take Control of Your Financial Future?",
    description: "Join thousands of businesses that are using our platform to streamline their financial management process.",
    children: (
        <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <Button variant="default" size="lg">
                Get Started
            </Button>
            <Button variant="outline" size="lg">
                Learn More
            </Button>
        </div>
    ),
};

export const WithCustomButtons = Template.bind({});
WithCustomButtons.args = {
    title: "Revolutionize Your Business Finance",
    description: "Our AI-powered platform helps you make smarter financial decisions with real-time insights and analytics.",
    children: (
        <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <Button variant="default" size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600">
                Start Free Trial
            </Button>
            <Button variant="outline" size="lg" className="border-purple-600 text-purple-600 hover:bg-purple-100">
                Schedule Demo
            </Button>
        </div>
    ),
}; 
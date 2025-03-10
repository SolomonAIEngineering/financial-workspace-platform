import { DashboardHeader, DashboardShell } from "./dashboard-shell";
import { Meta, StoryFn } from "@storybook/react";

import { Button } from "../button";
import React from "react";

export default {
    title: "Shell/DashboardShell",
    component: DashboardShell,
    parameters: {
        layout: "fullscreen",
    },
} as Meta;

const Template: StoryFn = (args) => (
    <div className="container mx-auto p-6">
        <DashboardShell {...args}>
            <DashboardHeader
                heading={args.heading}
                text={args.text}
            >
                {args.showButton && (
                    <Button variant="outline">Action Button</Button>
                )}
            </DashboardHeader>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                        <div className="flex flex-col space-y-1.5 pb-4">
                            <h3 className="text-lg font-semibold">Card {i + 1}</h3>
                            <p className="text-sm text-muted-foreground">Sample content for dashboard item</p>
                        </div>
                        <div className="h-32 bg-muted rounded-md flex items-center justify-center">
                            Content Area
                        </div>
                    </div>
                ))}
            </div>
        </DashboardShell>
    </div>
);

export const Default = Template.bind({});
Default.args = {
    heading: "Dashboard",
    text: "Welcome to your dashboard overview.",
    showButton: true,
};

export const WithoutText = Template.bind({});
WithoutText.args = {
    heading: "Dashboard",
    showButton: true,
};

export const WithoutButton = Template.bind({});
WithoutButton.args = {
    heading: "Dashboard",
    text: "Welcome to your dashboard overview.",
    showButton: false,
}; 
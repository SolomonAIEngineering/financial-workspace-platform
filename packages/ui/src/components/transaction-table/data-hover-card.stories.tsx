import { Meta, StoryFn } from "@storybook/react";

import { DataHoverCard } from "./data-hover-card";
import React from "react";

// Import the component's props types directly
type DataHoverCardProps = {
    triggerLabel: string;
    title: string;
    items: string[];
    avatarSrc?: string;
    avatarFallbackText?: string;
};

export default {
    component: DataHoverCard,
    title: "TransactionTable/DataHoverCard",
    parameters: {
        layout: "centered",
    },
    argTypes: {
        triggerLabel: { control: { type: "text" } },
        title: { control: { type: "text" } },
        items: { control: { type: "object" } },
        avatarSrc: { control: { type: "text" } },
        avatarFallbackText: { control: { type: "text" } },
    },
} as Meta<typeof DataHoverCard>;

const Template: StoryFn<DataHoverCardProps> = (args) => (
    <div className="p-10">
        <DataHoverCard {...args} />
    </div>
);

export const Default = Template.bind({});
Default.args = {
    triggerLabel: "View Details",
    title: "Transaction Details",
    items: [
        "Date: Jan 15, 2023",
        "Amount: $250.00",
        "Category: Office Supplies",
        "Vendor: Office Depot",
    ],
    avatarFallbackText: "OD",
};

export const WithAvatar = Template.bind({});
WithAvatar.args = {
    triggerLabel: "Customer Info",
    title: "John Smith",
    items: [
        "Email: john.smith@example.com",
        "Phone: (555) 123-4567",
        "Customer since: 2021",
        "Status: Active",
    ],
    avatarSrc: "https://i.pravatar.cc/150?img=3",
    avatarFallbackText: "JS",
}; 
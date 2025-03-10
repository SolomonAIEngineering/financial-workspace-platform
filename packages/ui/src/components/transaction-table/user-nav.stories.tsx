import { Meta, StoryFn } from "@storybook/react";

import React from "react";
import { UserNav } from "./user-nav";

export default {
    component: UserNav,
    title: "TransactionTable/UserNav",
    parameters: {
        layout: "centered",
    },
} as Meta;

const Template: StoryFn = () => (
    <div className="p-4 flex justify-end">
        <UserNav />
    </div>
);

export const Default = Template.bind({});
Default.args = {}; 
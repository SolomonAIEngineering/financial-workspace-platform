import { Meta, StoryFn } from "@storybook/react";

import { PricingSection } from "./pricing-section";
import React from "react";

export default {
    component: PricingSection,
    title: "Landing/PricingSection",
    parameters: {
        layout: "fullscreen",
    },
} as Meta;

const Template: StoryFn = (args) => (
    <div className="w-full">
        <PricingSection pricingPlans={[]} {...args} />
    </div>
);

export const Default = Template.bind({});
Default.args = {}; 
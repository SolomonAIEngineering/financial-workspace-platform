import { Meta, StoryFn } from "@storybook/react";
import { TopMerchantChart, TopMerchantChartProps } from "./top-merchant-chart";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { FinancialDataGenerator } from "../../../../lib/random/financial-data-generator";
import { JSX } from "react/jsx-runtime";
import React from "react";
import { SpendingPeriod } from "../../../../types/merchant";
import { useAssistant } from "@ai-sdk/react";
import { useVercelUseAssistantRuntime } from "@assistant-ui/react-ai-sdk";

/**
 * A wrapper component that provides the necessary context for the AssistantModalWrapper.
 *
 * @component
 */
const AssistantProviderWrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const assistant = useAssistant({
        api: "/api/assistant", // Adjust this if your API endpoint is different
    });

    const runtime = useVercelUseAssistantRuntime(assistant);

    return (
        <AssistantRuntimeProvider runtime={runtime}>
            {children}
        </AssistantRuntimeProvider>
    );
};

export default {
    component: TopMerchantChart,
    parameters: {
        layout: "centered",
    },
    argTypes: {
        selectedSpendingPeriod: {
            control: "select",
        },
    },
    decorators: [
        (Story) => (
            <AssistantProviderWrapper>
                <Story />
            </AssistantProviderWrapper>
        ),
    ],
} as Meta;

const records = FinancialDataGenerator.generateRandomMerchantMetricsFinancialSubProfile(
    150,
    2023,
);

const Template: StoryFn<TopMerchantChartProps> = (
    args: JSX.IntrinsicAttributes & TopMerchantChartProps,
) => (
    <div className="w-[900px]">
        <TopMerchantChart {...args} />
    </div>
);

export const Default = Template.bind({});
Default.args = {
    merchants: ["Amazon", "Walmart", "Target", "Best Buy", "Costco"],
    records: records,
};

export const QuarterlyView = Template.bind({});
QuarterlyView.args = {
    ...Default.args,
};

export const YearlyView = Template.bind({});
YearlyView.args = {
    ...Default.args,
}; 
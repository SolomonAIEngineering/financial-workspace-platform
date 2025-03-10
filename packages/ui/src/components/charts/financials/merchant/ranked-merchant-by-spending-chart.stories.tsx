import { Meta, StoryFn } from "@storybook/react";
import {
    RankedMerchantsBySpendingChart,
    RankedMerchantsBySpendingChartProps,
} from "./ranked-merchant-by-spending-chart";

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
    component: RankedMerchantsBySpendingChart,
    parameters: {
        layout: "centered",
    },
    argTypes: {
        selectedSpendingPeriod: {
            control: "select",
        },
        currency: {
            control: "select",
            options: ["USD", "EUR", "GBP", "JPY"],
        },
        height: {
            control: { type: "range", min: 200, max: 600, step: 10 },
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

const Template: StoryFn<RankedMerchantsBySpendingChartProps> = (
    args: JSX.IntrinsicAttributes & RankedMerchantsBySpendingChartProps,
) => (
    <div className="w-[900px]">
        <RankedMerchantsBySpendingChart {...args} />
    </div>
);

export const Default = Template.bind({});
Default.args = {
    records: records,
    currency: "USD",
    height: 400,
    locale: "en-US",
    enableAssistantMode: true,
};

export const QuarterlyView = Template.bind({});
QuarterlyView.args = {
    ...Default.args,
};

export const YearlyView = Template.bind({});
YearlyView.args = {
    ...Default.args,
}; 
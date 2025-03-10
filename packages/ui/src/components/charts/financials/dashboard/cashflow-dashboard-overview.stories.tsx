import {
  CashflowDashboardOverview,
  CashflowDashboardOverviewProps,
} from "./cashflow-dashboard-overview";
import { Meta, StoryFn } from "@storybook/react";

import AssistantProviderWrapper from "../../../../wrapper/assistant-provider-wrapper";
import { FinancialDataGenerator } from "../../../../lib/random/financial-data-generator";
import { JSX } from "react";

export default {
  component: CashflowDashboardOverview,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    className: {
      control: "text",
    },
    title: {
      control: "text",
    },
    disabled: {
      control: "boolean",
    },
    incomeMetrics: {
      control: "object",
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

const Template: StoryFn<CashflowDashboardOverviewProps> = (
  args: JSX.IntrinsicAttributes & CashflowDashboardOverviewProps,
) => (
  <div className="w-[900px]">
    <CashflowDashboardOverview {...args} />
  </div>
);

const data = FinancialDataGenerator.generateIncomeMetricsAcrossManyYears(
  2022,
  2024,
);

const expenseData =
  FinancialDataGenerator.generateExpenseMetricsAcrossManyYears(2022, 2024);

export const Default = Template.bind({});
Default.args = {
  className: "w-[900px]",
  title: "Cashflow Dashboard Overview",
  disabled: false,
  incomeMetrics: data,
  expenseMetrics: expenseData,
};

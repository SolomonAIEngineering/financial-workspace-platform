import { BarChartMulti, BarChartMultiProps } from "./bar-chart-multi";
import { Meta, StoryFn } from "@storybook/react";

import { BarChartMultiDataPoint } from "../../../types/chart";
import { JSX } from "react/jsx-runtime";
import React from "react";
import { generatePayloadArray } from "../../../lib/random/generator";
import { useAssistant } from "@ai-sdk/react";
import { useVercelUseAssistantRuntime } from "@assistant-ui/react-ai-sdk";

export default {
  component: BarChartMulti,
  parameters: {
    layout: "centered",
  },
  argTypes: {
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
      <Story />
    ),
  ],
} as Meta;

const payloads = generatePayloadArray({
  count: 5,
  minValue: 100,
  maxValue: 500,
}).map((value, index) => {
  // create a hashma

  const dataPoint: BarChartMultiDataPoint = {
    date: value.date,
    current: value.value,
    previous: index * 100,
  };

  return dataPoint;
});

const Template: StoryFn<BarChartMultiProps> = (
  args: JSX.IntrinsicAttributes & BarChartMultiProps,
) => (
  <div className="w-[900px]">
    <BarChartMulti {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  currency: "USD",
  data: payloads,
  height: 290,
  locale: "en-US",
  enableAssistantMode: true,
};

export const Group = Template.bind({});
Group.args = {
  ...Default.args,
  currency: "EUR",
  enableAssistantMode: true,
};

export const Stack = Template.bind({});
Stack.args = {
  ...Default.args,
  currency: "EUR",
  enableAssistantMode: true,
  chartType: "stack",
};

export const LargeDataset = Template.bind({});
LargeDataset.args = {
  ...Default.args,
  data: payloads,
};

export const SmallHeight = Template.bind({});
SmallHeight.args = {
  ...Default.args,
  height: 200,
};

export const LargeHeight = Template.bind({});
LargeHeight.args = {
  ...Default.args,
  height: 500,
};

export const VolatileData = Template.bind({});
VolatileData.args = {
  ...Default.args,
  data: payloads,
};

export const DataWithComparison = Template.bind({});
DataWithComparison.args = {
  ...Default.args,
  data: payloads,
};

export const SingleDataPoint = Template.bind({});
SingleDataPoint.args = {
  ...Default.args,
  data: payloads,
};

export const EmptyDataset = Template.bind({});
EmptyDataset.args = {
  ...Default.args,
  data: [],
};

export const Disabled = Template.bind({});
Disabled.args = {
  ...Default.args,
  disabled: true,
};

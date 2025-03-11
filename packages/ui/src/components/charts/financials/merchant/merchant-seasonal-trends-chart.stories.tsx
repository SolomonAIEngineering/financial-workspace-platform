import { Meta, StoryFn } from '@storybook/react'
import {
  MerchantSeasonalTrendsChart,
  MerchantSeasonalTrendsChartProps,
} from './merchant-seasonal-trends-chart'

import { useAssistant } from '@ai-sdk/react'
import { AssistantRuntimeProvider } from '@assistant-ui/react'
import { useVercelUseAssistantRuntime } from '@assistant-ui/react-ai-sdk'
import React from 'react'
import { JSX } from 'react/jsx-runtime'
import { FinancialDataGenerator } from '../../../../lib/random/financial-data-generator'

/**
 * A wrapper component that provides the necessary context for the AssistantModalWrapper.
 *
 * @component
 */
const AssistantProviderWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const assistant = useAssistant({
    api: '/api/assistant', // Adjust this if your API endpoint is different
  })

  const runtime = useVercelUseAssistantRuntime(assistant)

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  )
}

export default {
  component: MerchantSeasonalTrendsChart,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    selectedSpendingPeriod: {
      control: 'select',
    },
    currency: {
      control: 'select',
      options: ['USD', 'EUR', 'GBP', 'JPY'],
    },
    height: {
      control: { type: 'range', min: 200, max: 600, step: 10 },
    },
  },
  decorators: [
    (Story) => (
      <AssistantProviderWrapper>
        <Story />
      </AssistantProviderWrapper>
    ),
  ],
} as Meta

const records =
  FinancialDataGenerator.generateRandomMerchantMetricsFinancialSubProfile(
    150,
    2023,
  )

const Template: StoryFn<MerchantSeasonalTrendsChartProps> = (
  args: JSX.IntrinsicAttributes & MerchantSeasonalTrendsChartProps,
) => (
  <div className="w-[900px]">
    <MerchantSeasonalTrendsChart {...args} />
  </div>
)

export const Default = Template.bind({})
Default.args = {
  merchants: ['Amazon', 'Walmart', 'Target', 'Best Buy', 'Costco'],
  records: records,
  currency: 'USD',
  height: 400,
  locale: 'en-US',
  enableAssistantMode: true,
}

export const QuarterlyView = Template.bind({})
QuarterlyView.args = {
  ...Default.args,
}

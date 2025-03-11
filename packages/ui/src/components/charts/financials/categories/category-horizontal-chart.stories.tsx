import { Meta, StoryFn } from '@storybook/react'

import { CategoryChart } from './category-horizontal-chart'

export default {
  component: CategoryChart,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    title: {
      control: 'text',
    },
    description: {
      control: 'text',
    },
    data: {
      control: 'object',
    },
  },
} as Meta

const Template: StoryFn = (args) => (
  <div className="w-[600px]">
    <CategoryChart data={[]} title={''} description={''} {...args} />
  </div>
)

export const Default = Template.bind({})
Default.args = {
  title: 'Top Expense Categories',
  description: 'Your biggest spending areas in the last quarter',
  data: [
    { category: 'Restaurants', value: 1250 },
    { category: 'Groceries', value: 980 },
    { category: 'Transportation', value: 750 },
    { category: 'Entertainment', value: 650 },
    { category: 'Shopping', value: 580 },
    { category: 'Utilities', value: 420 },
    { category: 'Healthcare', value: 380 },
  ],
}

export const CustomCategories = Template.bind({})
CustomCategories.args = {
  title: 'Business Expenses',
  description: 'Business-related spending by category',
  data: [
    { category: 'Software', value: 2100 },
    { category: 'Office Supplies', value: 1450 },
    { category: 'Consulting', value: 1200 },
    { category: 'Marketing', value: 950 },
    { category: 'Travel', value: 850 },
  ],
}

export const ShortList = Template.bind({})
ShortList.args = {
  title: 'Top 3 Categories',
  description: 'Your biggest expense categories',
  data: [
    { category: 'Restaurants', value: 1250 },
    { category: 'Groceries', value: 980 },
    { category: 'Transportation', value: 750 },
  ],
}

import type { Meta, StoryObj } from '@storybook/react';

import { MiniMetricChartBox } from './mini-metric-chart-box';

const meta = {
    title: 'Charts/MiniMetricChartBox',
    component: MiniMetricChartBox,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
} satisfies Meta<typeof MiniMetricChartBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Currency: Story = {
    args: {
        title: 'Total Revenue',
        metric: {
            slug: 'revenue',
            type: 'currency',
        },
        value: 12500,
    },
};

export const Scalar: Story = {
    args: {
        title: 'Active Users',
        metric: {
            slug: 'users',
            type: 'scalar',
        },
        value: 4325,
    },
};

export const LargeNumber: Story = {
    args: {
        title: 'Page Views',
        metric: {
            slug: 'pageviews',
            type: 'scalar',
        },
        value: 1250000,
    },
};

export const NoTitle: Story = {
    args: {
        metric: {
            slug: 'users',
            type: 'scalar',
        },
        value: 4325,
    },
}; 
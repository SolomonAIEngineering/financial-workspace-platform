import { Meta, StoryObj } from '@storybook/react';
import { addDays, subDays } from 'date-fns';

import MetricChart from './metric-chart';
import { ParsedMetricPeriod } from './types';
import React from 'react';

const meta: Meta<typeof MetricChart> = {
    title: 'Charts/MetricChart',
    component: MetricChart,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MetricChart>;

// Sample data generator
const generateMetricData = (days: number, startValue: number, volatility: number): ParsedMetricPeriod[] => {
    const data: ParsedMetricPeriod[] = [];
    const startDate = subDays(new Date(), days);

    for (let i = 0; i <= days; i++) {
        const random = Math.random() * volatility - (volatility / 2);
        const value = startValue + (i * (startValue * 0.01)) + random;

        data.push({
            MetricPeriod: Math.max(0, value).toString(),
            Timestamp: addDays(startDate, i).toISOString(),
        });
    }

    return data;
};

export const CurrencyMetricChart: Story = {
    args: {
        data: generateMetricData(30, 1000, 50),
        interval: 'day',
        metric: {
            slug: 'revenue',
            type: 'currency',
        },
        height: 200,
    },
    render: (args) => (
        <div className="w-[800px]">
            <MetricChart {...args} />
        </div>
    ),
};

export const ScalarMetricChart: Story = {
    args: {
        data: generateMetricData(30, 500, 100),
        interval: 'day',
        metric: {
            slug: 'active_users',
            type: 'scalar',
        },
        height: 200,
    },
    render: (args) => (
        <div className="w-[800px]">
            <MetricChart {...args} />
        </div>
    ),
};

export const WeeklyMetricChart: Story = {
    args: {
        data: generateMetricData(10, 2000, 200),
        interval: 'week',
        metric: {
            slug: 'conversions',
            type: 'scalar',
        },
        height: 200,
    },
    render: (args) => (
        <div className="w-[800px]">
            <MetricChart {...args} />
        </div>
    ),
};

export const WithDataHover: Story = {
    args: {
        data: generateMetricData(30, 1000, 50),
        interval: 'day',
        metric: {
            slug: 'revenue',
            type: 'currency',
        },
        height: 200,
        onDataIndexHover: (index) => console.log('Hovering over index:', index),
    },
    render: (args) => (
        <div className="w-[800px]">
            <MetricChart {...args} />
        </div>
    ),
}; 
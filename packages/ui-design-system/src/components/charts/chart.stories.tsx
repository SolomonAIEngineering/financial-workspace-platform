import { Meta, StoryObj } from '@storybook/react';
import { addDays, addHours, subDays, subMonths } from 'date-fns';

import { Chart } from './chart';
import React from 'react';

const meta: Meta<typeof Chart> = {
    title: 'Charts/Chart',
    component: Chart,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Chart>;

// Sample data generator
const generateDailyData = (days: number, startValue: number, volatility: number) => {
    const data: { timestamp: Date; value: number }[] = [];
    const startDate = subDays(new Date(), days);

    for (let i = 0; i <= days; i++) {
        const random = Math.random() * volatility - (volatility / 2);
        const value = startValue + (i * (startValue * 0.01)) + random;

        data.push({
            timestamp: addDays(startDate, i),
            value: Math.max(0, value),
        });
    }

    return data;
};

const generateHourlyData = (hours: number, startValue: number, volatility: number) => {
    const data: { timestamp: Date; value: number }[] = [];
    const startDate = subDays(new Date(), Math.floor(hours / 24));

    for (let i = 0; i <= hours; i++) {
        const random = Math.random() * volatility - (volatility / 2);
        const value = startValue + (i * (startValue * 0.002)) + random;

        data.push({
            timestamp: addHours(startDate, i),
            value: Math.max(0, value),
        });
    }

    return data;
};

export const DailyChart: Story = {
    args: {
        data: generateDailyData(30, 1000, 50),
        interval: 'day',
        metric: {
            slug: 'revenue',
            type: 'currency',
        },
        height: 300,
    },
    render: (args) => (
        <div className="w-[800px]">
            <Chart {...args} />
        </div>
    ),
};

export const HourlyChart: Story = {
    args: {
        data: generateHourlyData(48, 100, 20),
        interval: 'hour',
        metric: {
            slug: 'active_users',
            type: 'scalar',
        },
        height: 300,
    },
    render: (args) => (
        <div className="w-[800px]">
            <Chart {...args} />
        </div>
    ),
};

export const WithDataHover: Story = {
    args: {
        data: generateDailyData(30, 1000, 50),
        interval: 'day',
        metric: {
            slug: 'revenue',
            type: 'currency',
        },
        height: 300,
        onDataIndexHover: (index) => console.log('Hovering over index:', index),
    },
    render: (args) => (
        <div className="w-[800px]">
            <Chart {...args} />
        </div>
    ),
}; 
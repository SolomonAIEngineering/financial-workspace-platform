import { Meta, StoryObj } from '@storybook/react';
import { addDays, addHours, subDays } from 'date-fns';

import { MeterChart } from './meter-chart';
import React from 'react';

const meta: Meta<typeof MeterChart> = {
    title: 'Charts/MeterChart',
    component: MeterChart,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MeterChart>;

// Sample data generator
const generateDailyData = (days: number, startQuantity: number, volatility: number) => {
    const data: { timestamp: Date; quantity: number }[] = [];
    const startDate = subDays(new Date(), days);

    for (let i = 0; i <= days; i++) {
        const random = Math.random() * volatility - (volatility / 2);
        const quantity = startQuantity + (i * (startQuantity * 0.01)) + random;

        data.push({
            timestamp: addDays(startDate, i),
            quantity: Math.max(0, quantity),
        });
    }

    return data;
};

const generateHourlyData = (hours: number, startQuantity: number, volatility: number) => {
    const data: { timestamp: Date; quantity: number }[] = [];
    const startDate = subDays(new Date(), Math.floor(hours / 24));

    for (let i = 0; i <= hours; i++) {
        const random = Math.random() * volatility - (volatility / 2);
        const quantity = startQuantity + (i * (startQuantity * 0.002)) + random;

        data.push({
            timestamp: addHours(startDate, i),
            quantity: Math.max(0, quantity),
        });
    }

    return data;
};

export const DailyMeterChart: Story = {
    args: {
        data: generateDailyData(30, 1000, 50),
        interval: 'day',
        height: 400,
    },
    render: (args) => (
        <div className="w-[800px]">
            <MeterChart {...args} />
        </div>
    ),
};

export const HourlyMeterChart: Story = {
    args: {
        data: generateHourlyData(48, 500, 100),
        interval: 'hour',
        height: 400,
    },
    render: (args) => (
        <div className="w-[800px]">
            <MeterChart {...args} />
        </div>
    ),
};

export const WithDataHover: Story = {
    args: {
        data: generateDailyData(30, 1000, 50),
        interval: 'day',
        height: 400,
        onDataIndexHover: (index) => console.log('Hovering over index:', index),
    },
    render: (args) => (
        <div className="w-[800px]">
            <MeterChart {...args} />
        </div>
    ),
}; 
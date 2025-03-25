// Import the component directly
import * as DateRangePickerFile from './date-range-picker';

import { Meta, StoryObj } from '@storybook/react';
import { addDays, subDays, subMonths } from 'date-fns';

import { DateRange } from '../calendar';
import React from 'react';
import { useState } from 'react';

// Get the default export component
const DateRangePicker = DateRangePickerFile.default;

const meta = {
    title: 'Charts/DateRangePicker',
    // Cast as needed for compatibility
    component: DateRangePicker as any,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<any>;

// Interactive component that maintains its own state
const DateRangePickerWithState = () => {
    const [date, setDate] = useState<DateRange>({
        from: subDays(new Date(), 14),
        to: new Date(),
    });

    return (
        <div className="w-80">
            <DateRangePicker
                date={date}
                onDateChange={setDate}
            />
        </div>
    );
};

export const Default: Story = {
    render: () => <DateRangePickerWithState />
};

export const WithMaxDaysRange: Story = {
    args: {
        date: {
            from: subDays(new Date(), 7),
            to: new Date(),
        },
        onDateChange: () => { },
        maxDaysRange: 30,
    },
};

export const WithMinDate: Story = {
    args: {
        date: {
            from: subDays(new Date(), 14),
            to: new Date(),
        },
        onDateChange: () => { },
        minDate: subMonths(new Date(), 3),
    },
}; 
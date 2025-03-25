// Import the component directly
import * as IntervalPickerFile from './interval-picker';

import { Meta, StoryObj } from '@storybook/react';

import React from 'react';
import { SchemasType } from './types';
import { useState } from 'react';

// Get the default export component
const IntervalPicker = IntervalPickerFile.default;

const meta = {
    title: 'Charts/IntervalPicker',
    component: IntervalPicker as any,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<any>;

// Interactive component that maintains its own state
const IntervalPickerWithState = () => {
    const [interval, setInterval] = useState<SchemasType['TimeInterval']>('day');

    return (
        <div className="w-64">
            <IntervalPicker
                interval={interval}
                onChange={setInterval}
            />
        </div>
    );
};

export const Default: Story = {
    render: () => <IntervalPickerWithState />
};

export const WithPreselectedInterval: Story = {
    args: {
        interval: 'month',
        onChange: () => { },
    },
}; 
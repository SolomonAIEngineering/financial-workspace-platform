import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import AdvancedChart, { type AdvancedChartProps } from './advanced-chart'
import { format } from 'date-fns'
import '../../../src/globals.css'

const meta: Meta<typeof AdvancedChart> = {
    title: 'Charts/AdvancedChart',
    component: AdvancedChart,
    parameters: {
        layout: 'centered',
        themes: ['light', 'dark'],
    },
    argTypes: {
        data: { control: 'object' },
        type: { control: 'radio', options: ['bar', 'scatter'] },
        height: { control: 'number' },
        width: { control: 'number' },
        maxTicks: { control: 'number' },
        xLabel: { control: 'text' },
        yLabel: { control: 'text' },
        color: { control: 'color' },
    },
    decorators: [
        (Story) => (
            <div style={{ width: '600px', padding: '1rem' }}>
                <Story />
            </div>
        ),
    ],
}

export default meta
type Story = StoryObj<typeof AdvancedChart>

// Sample data
const numericData = Array.from({ length: 12 }, (_, i) => ({
    x: i + 1,
    y: Math.random() * 100,
    category: i % 2 === 0 ? 'A' : 'B',
}))

const temporalData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return {
        x: date,
        y: Math.random() * 100 + 50,
        category: i % 3 === 0 ? 'High' : i % 3 === 1 ? 'Medium' : 'Low',
    }
})

// Basic Bar Chart
export const BasicBarChart: Story = {
    args: {
        type: 'bar',
        data: numericData,
        xLabel: 'Month',
        yLabel: 'Value',
        height: 400,
        color: '#000000',
    },
}

// Temporal Bar Chart
export const TemporalBarChart: Story = {
    args: {
        type: 'bar',
        data: temporalData,
        xLabel: 'Date',
        yLabel: 'Value',
        height: 400,
        formatY: (value) => `$${value.toFixed(2)}`,
        color: '#000000',
    },
}

// Categorical Bar Chart
export const CategoricalBarChart: Story = {
    args: {
        type: 'bar',
        data: numericData,
        xLabel: 'Category',
        yLabel: 'Value',
        height: 400,
        color: (d) => (d.category === 'A' ? '#000000' : '#FFFFFF'),
    },
}

// Basic Scatter Plot
export const BasicScatterPlot: Story = {
    args: {
        type: 'scatter',
        data: numericData,
        xLabel: 'X Value',
        yLabel: 'Y Value',
        height: 400,
        color: '#000000',
    },
}

// Temporal Scatter Plot
export const TemporalScatterPlot: Story = {
    args: {
        type: 'scatter',
        data: temporalData,
        xLabel: 'Date',
        yLabel: 'Value',
        height: 400,
        color: (d) => {
            switch (d.category) {
                case 'High':
                    return '#000000'
                case 'Medium':
                    return '#666666'
                default:
                    return '#FFFFFF'
            }
        },
    },
}

// Categorical Scatter Plot
export const CategoricalScatterPlot: Story = {
    args: {
        type: 'scatter',
        data: numericData.map(d => ({
            ...d,
            x: Math.random() * 100,
            y: Math.random() * 100,
        })),
        xLabel: 'X Axis',
        yLabel: 'Y Axis',
        height: 400,
        color: (d) => (d.category === 'A' ? '#000000' : '#FFFFFF'),
    },
} 
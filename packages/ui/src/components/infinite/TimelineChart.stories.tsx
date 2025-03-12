import type { Meta, StoryObj } from '@storybook/react';

import React from 'react';
import { TimelineChart } from './TimelineChart';

const meta: Meta<typeof TimelineChart> = {
    title: 'Components/Infinite/TimelineChart',
    component: TimelineChart,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: 'A timeline chart component for visualizing time-series data with level-based categorization.',
            },
        },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TimelineChart>;

// Helper function to create test data
const createTimelineData = (hours: number, pattern: 'random' | 'spikes' | 'gradual' | 'alternating' = 'random') => {
    const now = new Date();
    const data = [];

    for (let i = 0; i < hours; i++) {
        const date = new Date(now);
        date.setHours(date.getHours() - i);

        let info = 0;
        let error = 0;
        let warn = 0;
        let debug = 0;
        let success = 0;

        switch (pattern) {
            case 'spikes':
                // Create spikes at regular intervals
                if (i % 6 === 0) {
                    error = Math.floor(Math.random() * 50) + 30;
                    warn = Math.floor(Math.random() * 20) + 10;
                } else {
                    info = Math.floor(Math.random() * 15) + 5;
                    debug = Math.floor(Math.random() * 10) + 2;
                    success = Math.floor(Math.random() * 5);
                }
                break;

            case 'gradual':
                // Gradual increase and decrease pattern
                const position = i % 12;
                const multiplier = position < 6 ? position / 5 : (10 - position) / 5;
                info = Math.floor((Math.random() * 20 + 10) * multiplier);
                warn = Math.floor((Math.random() * 10 + 5) * multiplier);
                error = Math.floor((Math.random() * 5 + 2) * multiplier);
                debug = Math.floor((Math.random() * 15 + 5) * multiplier);
                success = Math.floor((Math.random() * 8 + 2) * multiplier);
                break;

            case 'alternating':
                // Alternating pattern between different levels
                if (i % 3 === 0) {
                    info = Math.floor(Math.random() * 30) + 20;
                    success = Math.floor(Math.random() * 15) + 5;
                } else if (i % 3 === 1) {
                    warn = Math.floor(Math.random() * 25) + 15;
                    debug = Math.floor(Math.random() * 20) + 10;
                } else {
                    error = Math.floor(Math.random() * 20) + 10;
                }
                break;

            case 'random':
            default:
                // Random distribution across all levels
                info = Math.floor(Math.random() * 30) + 5;
                error = Math.floor(Math.random() * 10);
                warn = Math.floor(Math.random() * 15);
                debug = Math.floor(Math.random() * 20);
                success = Math.floor(Math.random() * 8);
                break;
        }

        data.push({
            date,
            count: info + error + warn + debug + success,
            info,
            error,
            warn,
            debug,
            success,
        });
    }

    return data.reverse(); // Reverse to make most recent data last
};

export const Basic: Story = {
    render: () => (
        <div className="w-[800px]">
            <TimelineChart data={createTimelineData(24)} />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Basic usage of the TimelineChart component with 24 hours of random data.',
            },
        },
    },
};

export const WithCustomTitle: Story = {
    render: () => (
        <div className="w-[800px]">
            <TimelineChart
                data={createTimelineData(24)}
                title="Application Logs - Last 24 Hours"
            />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'TimelineChart with a custom title.',
            },
        },
    },
};

export const WithCustomHeight: Story = {
    render: () => (
        <div className="w-[800px]">
            <TimelineChart
                data={createTimelineData(24)}
                height="300px"
            />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'TimelineChart with a custom height of 300px for better visualization.',
            },
        },
    },
};

export const WithSpikePattern: Story = {
    render: () => (
        <div className="w-[800px]">
            <TimelineChart
                data={createTimelineData(24, 'spikes')}
                title="Error Spikes Pattern"
            />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'TimelineChart showing a pattern with regular error spikes.',
            },
        },
    },
};

export const WithGradualPattern: Story = {
    render: () => (
        <div className="w-[800px]">
            <TimelineChart
                data={createTimelineData(24, 'gradual')}
                title="Gradual Traffic Pattern"
                height="250px"
            />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'TimelineChart showing a gradual increase and decrease in activity over time.',
            },
        },
    },
};

export const WithAlternatingPattern: Story = {
    render: () => (
        <div className="w-[800px]">
            <TimelineChart
                data={createTimelineData(24, 'alternating')}
                title="Alternating Level Pattern"
            />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'TimelineChart showing an alternating pattern between different log levels.',
            },
        },
    },
};

export const With48Hours: Story = {
    render: () => (
        <div className="w-[800px]">
            <TimelineChart
                data={createTimelineData(48, 'random')}
                title="48-Hour Timeline"
            />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'TimelineChart with an extended 48-hour timeline for longer-term analysis.',
            },
        },
    },
};

export const WithCustomStyling: Story = {
    render: () => (
        <div className="w-[800px]">
            <TimelineChart
                data={createTimelineData(24, 'spikes')}
                title="Custom Styled Timeline"
                className="border-2 border-primary rounded-xl shadow-lg"
            />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'TimelineChart with custom styling applied via className.',
            },
        },
    },
}; 
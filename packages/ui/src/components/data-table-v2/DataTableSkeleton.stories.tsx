import type { Meta, StoryObj } from '@storybook/react';

import { DataTableSkeleton } from './DataTableSkeleton';
import React from 'react';

// Define the story metadata
const meta: Meta<typeof DataTableSkeleton> = {
    title: 'Components/DataTable/V2/DataTableSkeleton',
    component: DataTableSkeleton,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: 'A skeleton loading component for data tables',
            },
        },
    },
    decorators: [
        (Story) => (
            <div className="border rounded p-4">
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof DataTableSkeleton>;

// Basic story
export const Basic: Story = {
    args: {
        rows: 5,
    },
    parameters: {
        docs: {
            description: {
                story: 'The basic skeleton component with default settings.',
            },
        },
    },
};

// Custom columns
export const CustomColumns: Story = {
    args: {
        rows: 3,
        columns: 3,
        columnVisibility: ["table-cell", "hidden sm:table-cell", "table-cell"],
        cellWidths: ["max-w-[8rem]", "max-w-[12rem]", "w-20"],
    },
    parameters: {
        docs: {
            description: {
                story: 'Skeleton with custom column configuration.',
            },
        },
    },
};

// Without header
export const WithoutHeader: Story = {
    args: {
        rows: 4,
        showHeader: false,
    },
    parameters: {
        docs: {
            description: {
                story: 'Skeleton without the header row.',
            },
        },
    },
};

// Custom styling
export const CustomStyling: Story = {
    args: {
        rows: 3,
        headerClassName: "bg-gray-100 dark:bg-gray-800",
        rowClassName: "border-b border-gray-200 dark:border-gray-700",
        cellClassName: "p-3",
    },
    parameters: {
        docs: {
            description: {
                story: 'Skeleton with custom styling for header, rows, and cells.',
            },
        },
    },
};

// Many rows
export const ManyRows: Story = {
    args: {
        rows: 20,
        columns: 4,
    },
    parameters: {
        docs: {
            description: {
                story: 'Skeleton with many rows to simulate a large dataset.',
            },
        },
    },
}; 
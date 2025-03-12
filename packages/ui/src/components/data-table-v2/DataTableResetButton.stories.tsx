import { Filter, RefreshCw, RotateCcw } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';

import { DataTableProvider } from './core/DataTableProvider';
import { DataTableResetButton } from './DataTableResetButton';
import { createColumnHelper } from '@tanstack/react-table';

const meta: Meta<typeof DataTableResetButton> = {
    title: 'Components/DataTable/V2/DataTableResetButton',
    component: DataTableResetButton,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: 'A button component that resets all column filters in a data table.',
            },
        },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DataTableResetButton>;

// Define a sample data interface
interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    status: 'available' | 'low' | 'out_of_stock';
}

// Sample data
const data: Product[] = Array.from({ length: 20 }, (_, index) => ({
    id: `p${index + 1}`,
    name: `Product ${index + 1}`,
    category: index % 3 === 0 ? 'Electronics' : index % 3 === 1 ? 'Clothing' : 'Food',
    price: Math.floor(Math.random() * 100) + 10,
    stock: Math.floor(Math.random() * 50),
    status: index % 3 === 0 ? 'available' : index % 3 === 1 ? 'low' : 'out_of_stock',
}));

// Column helper
const columnHelper = createColumnHelper<Product>();

// Column definitions
const columns = [
    columnHelper.accessor('id', {
        header: 'ID',
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('name', {
        header: 'Name',
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('category', {
        header: 'Category',
        cell: info => info.getValue(),
        filterFn: 'equals',
    }),
    columnHelper.accessor('price', {
        header: 'Price',
        cell: info => `$${info.getValue()}`,
    }),
    columnHelper.accessor('stock', {
        header: 'Stock',
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('status', {
        header: 'Status',
        cell: info => info.getValue(),
        filterFn: 'equals',
    }),
];

// Wrapper component for stories
const ResetButtonWithProvider = (props: React.ComponentProps<typeof DataTableResetButton>) => {
    return (
        <DataTableProvider
            data={data}
            columns={columns}
            initialState={{
                columnFilters: [
                    {
                        id: 'category',
                        value: 'Electronics',
                    },
                ],
            }}
        >
            <div className="flex items-center justify-center p-4 border rounded-md">
                <DataTableResetButton {...props} />
            </div>
        </DataTableProvider>
    );
};

// Basic story
export const Basic: Story = {
    render: () => <ResetButtonWithProvider />,
    parameters: {
        docs: {
            description: {
                story: 'The basic reset button with default styling.',
            },
        },
    },
};

// Different variants
export const Variants: Story = {
    render: () => (
        <div className="flex space-x-2">
            <ResetButtonWithProvider variant="ghost" text="Ghost" />
            <ResetButtonWithProvider variant="default" text="Default" />
            <ResetButtonWithProvider variant="outline" text="Outline" />
            <ResetButtonWithProvider variant="destructive" text="Destructive" />
            <ResetButtonWithProvider variant="secondary" text="Secondary" />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'The reset button with different variant styles.',
            },
        },
    },
};

// Custom icons
export const CustomIcons: Story = {
    render: () => (
        <div className="flex space-x-2">
            <ResetButtonWithProvider icon={<Filter className="mr-2 h-4 w-4" />} text="Clear Filters" />
            <ResetButtonWithProvider icon={<RotateCcw className="mr-2 h-4 w-4" />} text="Reset" />
            <ResetButtonWithProvider icon={<RefreshCw className="mr-2 h-4 w-4" />} text="Refresh" />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'The reset button with custom icons.',
            },
        },
    },
};

// Without tooltip
export const WithoutTooltip: Story = {
    render: () => <ResetButtonWithProvider showTooltip={false} />,
    parameters: {
        docs: {
            description: {
                story: 'The reset button without the keyboard shortcut tooltip.',
            },
        },
    },
};

// Custom tooltip
export const CustomTooltip: Story = {
    render: () => (
        <div className="flex space-x-2">
            <ResetButtonWithProvider tooltipText="Clear all applied filters" tooltipSide="top" />
            <ResetButtonWithProvider tooltipText="Press Escape to reset" tooltipSide="bottom" />
            <ResetButtonWithProvider tooltipText="Start fresh" tooltipSide="right" />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'The reset button with custom tooltip text and positions.',
            },
        },
    },
};

// With callback
export const WithCallback: Story = {
    render: () => {
        const [resetCount, setResetCount] = useState(0);

        return (
            <div className="space-y-4">
                <div className="text-sm text-center p-2 bg-muted rounded-md">
                    Reset button clicked: <span className="font-bold">{resetCount}</span> times
                </div>

                <DataTableProvider
                    data={data}
                    columns={columns}
                    initialState={{
                        columnFilters: [
                            {
                                id: 'category',
                                value: 'Electronics',
                            },
                        ],
                    }}
                    onFiltersReset={() => setResetCount(count => count + 1)}
                >
                    <div className="flex items-center justify-center p-4 border rounded-md">
                        <DataTableResetButton
                            onClick={() => console.log('Reset button clicked')}
                            variant="outline"
                        />
                    </div>
                </DataTableProvider>
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                story: 'Demonstrating the callback functionality when the reset button is clicked.',
            },
        },
    },
}; 
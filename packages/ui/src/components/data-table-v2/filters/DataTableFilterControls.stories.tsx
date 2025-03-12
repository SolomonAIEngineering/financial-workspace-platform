import type { Meta, StoryObj } from '@storybook/react';

import { DataTableFilterControls } from './DataTableFilterControls';
import type { DataTableFilterField } from '../core/types';
import { DataTableProvider } from '../core/DataTableProvider';
import React from 'react';
import { createColumnHelper, ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';

const meta: Meta<typeof DataTableFilterControls> = {
    title: 'Components/DataTable/V2/Filters/DataTableFilterControls',
    component: DataTableFilterControls,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: 'A component that renders a set of filters for a data table, supporting various filter types.',
            },
        },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DataTableFilterControls>;

// Sample data interface
interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    status: 'available' | 'low' | 'out_of_stock';
    createdAt: Date;
}

// Sample data
const data: Product[] = Array.from({ length: 50 }, (_, index) => ({
    id: `product-${index + 1}`,
    name: `Product ${index + 1}`,
    category: index % 3 === 0 ? 'Electronics' : index % 3 === 1 ? 'Clothing' : 'Food',
    price: Math.floor(Math.random() * 1000) + 10,
    stock: Math.floor(Math.random() * 100),
    status: index % 3 === 0 ? 'available' : index % 3 === 1 ? 'low' : 'out_of_stock',
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
}));

// Column helper
const columnHelper = createColumnHelper<Product>();

// Columns
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
    columnHelper.accessor('createdAt', {
        header: 'Created At',
        cell: info => info.getValue().toLocaleDateString(),
    }),
];

// Filter fields
const filterFields: DataTableFilterField<Product>[] = [
    {
        type: 'checkbox',
        label: 'Category',
        value: 'category',
        defaultOpen: true,
        options: [
            { label: 'Electronics', value: 'Electronics' },
            { label: 'Clothing', value: 'Clothing' },
            { label: 'Food', value: 'Food' },
        ],
    },
    {
        type: 'slider',
        label: 'Price',
        value: 'price',
        min: 0,
        max: 1000,
    },
    {
        type: 'slider',
        label: 'Stock',
        value: 'stock',
        min: 0,
        max: 100,
    },
    {
        type: 'checkbox',
        label: 'Status',
        value: 'status',
        options: [
            { label: 'Available', value: 'available' },
            { label: 'Low Stock', value: 'low' },
            { label: 'Out of Stock', value: 'out_of_stock' },
        ],
    },
    {
        type: 'timerange',
        label: 'Created At',
        value: 'createdAt',
        presets: [
            {
                label: 'Today',
                from: new Date(),
                to: new Date(),
                shortcut: 't',
            },
            {
                label: 'Last 7 days',
                from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                to: new Date(),
                shortcut: 'w',
            },
            {
                label: 'Last 30 days',
                from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                to: new Date(),
                shortcut: 'm',
            },
        ],
    },
    {
        type: 'input',
        label: 'Search Name',
        value: 'name',
    },
];

// Wrapper component for the stories
const FilterControlsWithProvider = (props: React.ComponentProps<typeof DataTableFilterControls<Product>>) => {
    // Create a table instance to pass to the provider
    const table = useReactTable({
        data,
        columns: columns as ColumnDef<Product>[],
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <DataTableProvider<Product>
            table={table}
            columns={columns as ColumnDef<Product>[]}
            filterFields={filterFields}
        >
            <div className="border rounded-md p-4 bg-card w-[300px]">
                <h3 className="text-lg font-medium mb-4">Filters</h3>
                <DataTableFilterControls<Product> {...props} />
            </div>
        </DataTableProvider>
    );
};

export const Basic: Story = {
    render: () => <FilterControlsWithProvider />,
    parameters: {
        docs: {
            description: {
                story: 'The basic filter controls component with all filter types.',
            },
        },
    },
};

export const WithCustomClasses: Story = {
    render: () => (
        <FilterControlsWithProvider
            className="space-y-4"
            accordionItemClassName="border-b border-muted pb-2"
            triggerClassName="hover:bg-muted/50"
            contentClassName="pt-2"
        />
    ),
    parameters: {
        docs: {
            description: {
                story: 'Filter controls with custom class names for styling.',
            },
        },
    },
};

export const WithoutResetButtons: Story = {
    render: () => <FilterControlsWithProvider showResetButtons={false} />,
    parameters: {
        docs: {
            description: {
                story: 'Filter controls without the reset buttons for each filter.',
            },
        },
    },
};

export const WithSingleAccordion: Story = {
    render: () => <FilterControlsWithProvider accordionType="single" />,
    parameters: {
        docs: {
            description: {
                story: 'Filter controls with a single accordion, where only one filter can be expanded at a time.',
            },
        },
    },
};

export const WithLimitedFilters: Story = {
    render: () => <FilterControlsWithProvider includeFields={['category', 'status'] as (keyof Product)[]} />,
    parameters: {
        docs: {
            description: {
                story: 'Filter controls showing only specific fields.',
            },
        },
    },
};

export const WithExcludedFilters: Story = {
    render: () => <FilterControlsWithProvider excludeFields={['price', 'stock'] as (keyof Product)[]} />,
    parameters: {
        docs: {
            description: {
                story: 'Filter controls with specific fields excluded.',
            },
        },
    },
};

export const WithFilterToggleCallback: Story = {
    render: () => {
        const [openFilters, setOpenFilters] = React.useState<Record<string, boolean>>({});

        return (
            <div className="space-y-4">
                <div className="border p-3 rounded bg-muted/30 max-w-[300px]">
                    <h4 className="text-sm font-medium mb-2">Open Filters:</h4>
                    <div className="text-xs text-muted-foreground">
                        {Object.entries(openFilters).map(([field, isOpen]) => (
                            <div key={field}>
                                {field}: {isOpen ? 'Open' : 'Closed'}
                            </div>
                        ))}
                    </div>
                </div>

                <FilterControlsWithProvider
                    onFilterToggle={(field, isOpen) => {
                        setOpenFilters(prev => ({
                            ...prev,
                            [field]: isOpen,
                        }));
                    }}
                />
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                story: 'Demonstrating the onFilterToggle callback when filters are expanded or collapsed.',
            },
        },
    },
}; 
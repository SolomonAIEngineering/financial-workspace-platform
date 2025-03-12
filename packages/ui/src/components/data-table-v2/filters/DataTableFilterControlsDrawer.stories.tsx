import { ColumnDef, createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { FilterIcon, SettingsIcon, SlidersHorizontal } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';

import { DataTableFilterControlsDrawer } from './DataTableFilterControlsDrawer';
import { DataTableProvider } from '../core/DataTableProvider';
import { FilterField } from './DataTableFilterControls';

const meta: Meta<typeof DataTableFilterControlsDrawer> = {
    title: 'Components/DataTable/V2/Filters/DataTableFilterControlsDrawer',
    component: DataTableFilterControlsDrawer,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: 'A drawer component that contains filter controls for a data table.',
            },
        },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DataTableFilterControlsDrawer>;

// Sample data for the table
interface Product {
    id: string;
    name: string;
    category: string;
    status: 'in-stock' | 'low-stock' | 'out-of-stock';
    price: number;
    rating: number;
    createdAt: string;
}

const data: Product[] = [
    { id: '1', name: 'Laptop', category: 'Electronics', status: 'in-stock', price: 999, rating: 4.5, createdAt: '2023-01-15' },
    { id: '2', name: 'Smartphone', category: 'Electronics', status: 'low-stock', price: 699, rating: 4.2, createdAt: '2023-02-20' },
    { id: '3', name: 'Headphones', category: 'Audio', status: 'out-of-stock', price: 199, rating: 3.8, createdAt: '2023-03-10' },
    { id: '4', name: 'Monitor', category: 'Electronics', status: 'in-stock', price: 299, rating: 4.7, createdAt: '2023-04-05' },
    { id: '5', name: 'Keyboard', category: 'Peripherals', status: 'low-stock', price: 89, rating: 4.0, createdAt: '2023-05-12' },
];

// Column helper for the table
const columnHelper = createColumnHelper<Product>();

// Column definitions
const columns: ColumnDef<Product, any>[] = [
    columnHelper.accessor('name', {
        header: 'Product Name',
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('category', {
        header: 'Category',
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('status', {
        header: 'Status',
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('price', {
        header: 'Price',
        cell: info => `$${info.getValue()}`,
    }),
    columnHelper.accessor('rating', {
        header: 'Rating',
        cell: info => `${info.getValue()} ⭐`,
    }),
    columnHelper.accessor('createdAt', {
        header: 'Created At',
        cell: info => info.getValue(),
    }),
];

// Category options
const categoryOptions = [
    { label: 'Electronics', value: 'Electronics' },
    { label: 'Audio', value: 'Audio' },
    { label: 'Peripherals', value: 'Peripherals' },
];

// Status options
const statusOptions = [
    { label: 'In Stock', value: 'in-stock' },
    { label: 'Low Stock', value: 'low-stock' },
    { label: 'Out of Stock', value: 'out-of-stock' },
];

// Date presets
const datePresets = [
    { label: 'Last 7 days', value: '7days' },
    { label: 'Last 30 days', value: '30days' },
    { label: 'Last 3 months', value: '3months' },
];

// Filter fields
const filterFields: FilterField[] = [
    {
        id: 'name',
        label: 'Product Name',
        type: 'input',
    },
    {
        id: 'category',
        label: 'Category',
        type: 'checkbox',
        options: categoryOptions,
    },
    {
        id: 'status',
        label: 'Status',
        type: 'checkbox',
        options: statusOptions,
    },
    {
        id: 'price',
        label: 'Price Range',
        type: 'slider',
        min: 0,
        max: 1000,
        step: 50,
    },
    {
        id: 'rating',
        label: 'Rating',
        type: 'slider',
        min: 0,
        max: 5,
        step: 0.1,
    },
    {
        id: 'createdAt',
        label: 'Created Date',
        type: 'timerange',
        presets: datePresets,
    },
];

// Wrapper to provide the DataTable context
const FilterControlsDrawerWrapper = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [columnFilters, setColumnFilters] = useState([]);

    const table = useReactTable({
        data,
        columns,
        state: {
            columnFilters,
        },
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <DataTableProvider table={table} columns={columns}>
            <div className="min-h-[500px] flex items-center justify-center bg-muted p-10 rounded-md">
                {children}
            </div>
        </DataTableProvider>
    );
};

export const Basic: Story = {
    render: () => (
        <FilterControlsDrawerWrapper>
            <DataTableFilterControlsDrawer
                fields={filterFields}
            />
        </FilterControlsDrawerWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Basic usage of the DataTableFilterControlsDrawer component with various filter fields.',
            },
        },
    },
};

export const WithCustomTitle: Story = {
    render: () => (
        <FilterControlsDrawerWrapper>
            <DataTableFilterControlsDrawer
                fields={filterFields}
                title="Advanced Product Filters"
            />
        </FilterControlsDrawerWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterControlsDrawer with a custom title.',
            },
        },
    },
};

export const WithCustomIcon: Story = {
    render: () => (
        <FilterControlsDrawerWrapper>
            <DataTableFilterControlsDrawer
                fields={filterFields}
                icon={<SettingsIcon className="h-4 w-4" />}
            />
        </FilterControlsDrawerWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterControlsDrawer with a custom icon.',
            },
        },
    },
};

export const WithCustomTriggerText: Story = {
    render: () => (
        <FilterControlsDrawerWrapper>
            <DataTableFilterControlsDrawer
                fields={filterFields}
                triggerText="Configure Filters"
                icon={<FilterIcon className="h-4 w-4 mr-2" />}
            />
        </FilterControlsDrawerWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterControlsDrawer with custom trigger button text.',
            },
        },
    },
};

export const WithDifferentButtonVariant: Story = {
    render: () => (
        <FilterControlsDrawerWrapper>
            <DataTableFilterControlsDrawer
                fields={filterFields}
                buttonVariant="outline"
                icon={<SlidersHorizontal className="h-4 w-4 mr-2" />}
                triggerText="Filter Products"
            />
        </FilterControlsDrawerWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterControlsDrawer with an outline button variant.',
            },
        },
    },
};

export const WithLimitedFields: Story = {
    render: () => (
        <FilterControlsDrawerWrapper>
            <DataTableFilterControlsDrawer
                fields={filterFields.filter(field => ['name', 'category', 'price'].includes(field.id))}
                title="Basic Filters"
            />
        </FilterControlsDrawerWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterControlsDrawer with a limited set of filter fields.',
            },
        },
    },
};

export const WithCustomClasses: Story = {
    render: () => (
        <FilterControlsDrawerWrapper>
            <DataTableFilterControlsDrawer
                fields={filterFields}
                className="w-[500px] sm:max-w-none"
                triggerText="Custom Width Drawer"
            />
        </FilterControlsDrawerWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterControlsDrawer with custom class names for styling.',
            },
        },
    },
};

export const WithOpenCallback: Story = {
    render: () => {
        const [isOpen, setIsOpen] = useState(false);

        return (
            <FilterControlsDrawerWrapper>
                <div className="space-y-4">
                    <div className="p-3 bg-white rounded-md shadow text-sm mb-4">
                        Drawer state: {isOpen ? 'Open' : 'Closed'}
                    </div>

                    <DataTableFilterControlsDrawer
                        fields={filterFields}
                        onOpenChange={setIsOpen}
                    />
                </div>
            </FilterControlsDrawerWrapper>
        );
    },
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterControlsDrawer with an onOpenChange callback to track drawer state.',
            },
        },
    },
}; 
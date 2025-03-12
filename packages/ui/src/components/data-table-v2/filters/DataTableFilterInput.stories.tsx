import { Card, CardContent } from '@/components/card';
import { ColumnDef, createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';

import { DataTableFilterInput } from './DataTableFilterInput';
import { DataTableProvider } from '../core/DataTableProvider';

const meta: Meta<typeof DataTableFilterInput> = {
    title: 'Components/DataTable/V2/Filters/DataTableFilterInput',
    component: DataTableFilterInput,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: 'A text input component for filtering data table columns with built-in debounce functionality.',
            },
        },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DataTableFilterInput>;

// Sample data for the table
interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
}

const data: Product[] = [
    { id: '1', name: 'Laptop', category: 'Electronics', price: 999 },
    { id: '2', name: 'Smartphone', category: 'Electronics', price: 699 },
    { id: '3', name: 'Headphones', category: 'Audio', price: 199 },
    { id: '4', name: 'Monitor', category: 'Electronics', price: 299 },
    { id: '5', name: 'Keyboard', category: 'Peripherals', price: 89 },
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
    columnHelper.accessor('price', {
        header: 'Price',
        cell: info => `$${info.getValue()}`,
    }),
];

// Wrapper to provide the DataTable context
const FilterInputWrapper = ({
    children,
    columnId = 'name',
    initialFilter = '',
}: {
    children: React.ReactNode;
    columnId?: string;
    initialFilter?: string;
}) => {
    const [columnFilters, setColumnFilters] = useState([
        { id: columnId, value: initialFilter }
    ]);

    // Create a wrapper function that adapts useState's setState to OnChangeFn
    const handleColumnFiltersChange = (updaterOrValue: any) => {
        if (typeof updaterOrValue === 'function') {
            setColumnFilters(prev => updaterOrValue(prev));
        } else {
            setColumnFilters(updaterOrValue);
        }
    };

    const table = useReactTable({
        data,
        columns,
        state: {
            columnFilters,
        },
        onColumnFiltersChange: handleColumnFiltersChange,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <DataTableProvider table={table} columns={columns}>
            <Card className="w-[350px]">
                <CardContent className="p-4">
                    <div className="mb-4">
                        <h3 className="text-sm font-medium mb-2">Current filter: {columnFilters[0]?.value || 'none'}</h3>
                    </div>
                    {children}
                </CardContent>
            </Card>
        </DataTableProvider>
    );
};

export const Basic: Story = {
    render: () => (
        <FilterInputWrapper>
            <DataTableFilterInput
                value="name"
                label="Name"
                type="input"
            />
        </FilterInputWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Basic usage of the DataTableFilterInput component for filtering a "name" column.',
            },
        },
    },
};

export const WithPlaceholder: Story = {
    render: () => (
        <FilterInputWrapper>
            <DataTableFilterInput
                value="name"
                label="Name"
                type="input"
                placeholder="Search by name..."
            />
        </FilterInputWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterInput with custom placeholder text.',
            },
        },
    },
};

export const CustomDebounce: Story = {
    render: () => (
        <FilterInputWrapper>
            <DataTableFilterInput
                value="name"
                label="Name"
                type="input"
                placeholder="Fast debounce (100ms)..."
                debounceTime={100}
            />
        </FilterInputWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterInput with a faster debounce time (100ms instead of the default 300ms).',
            },
        },
    },
};

export const WithInitialValue: Story = {
    render: () => (
        <FilterInputWrapper initialFilter="lap">
            <DataTableFilterInput
                value="name"
                label="Name"
                type="input"
                placeholder="Search products..."
            />
        </FilterInputWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterInput initialized with a value already set.',
            },
        },
    },
};

export const CustomStyling: Story = {
    render: () => (
        <FilterInputWrapper>
            <DataTableFilterInput
                value="name"
                label="Name"
                type="input"
                placeholder="Search products..."
                className="bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
        </FilterInputWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterInput with custom styling applied via className.',
            },
        },
    },
};

export const WithCallback: Story = {
    render: () => {
        const [lastValue, setLastValue] = useState('');

        return (
            <FilterInputWrapper>
                <div className="space-y-4">
                    <DataTableFilterInput
                        value="name"
                        label="Name"
                        type="input"
                        placeholder="Search products..."
                        onChange={(value) => setLastValue(value)}
                    />
                    <div className="text-sm py-2 px-3 bg-muted rounded-md">
                        Last typed value: {lastValue || 'none'}
                    </div>
                </div>
            </FilterInputWrapper>
        );
    },
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterInput with an onChange callback to track filter changes.',
            },
        },
    },
};

export const DifferentColumnFilter: Story = {
    render: () => (
        <FilterInputWrapper columnId="category">
            <DataTableFilterInput
                value="category"
                label="Category"
                type="input"
                placeholder="Filter by category..."
            />
        </FilterInputWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterInput configured to filter a different column (category instead of name).',
            },
        },
    },
}; 
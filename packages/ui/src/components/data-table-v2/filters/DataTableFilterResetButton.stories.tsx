import { Card, CardContent } from '@/components/card';
import { ColumnDef, createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';

import { Badge } from '@/components/badge';
import { DataTableFilterResetButton } from './DataTableFilterResetButton';
import { DataTableProvider } from '../core/DataTableProvider';
import { Input } from '@/components/input';

const meta: Meta<typeof DataTableFilterResetButton> = {
    title: 'Components/DataTable/V2/Filters/DataTableFilterResetButton',
    component: DataTableFilterResetButton,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: 'A button component for resetting column filters in a data table.',
            },
        },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DataTableFilterResetButton>;

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
const ResetButtonWrapper = ({
    children,
    initialFilters = [],
}: {
    children: React.ReactNode;
    initialFilters?: { id: string; value: any }[];
}) => {
    const [columnFilters, setColumnFilters] = useState(initialFilters);

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
            <Card className="w-[400px]">
                <CardContent className="p-4">
                    <div className="flex flex-col space-y-4">
                        <div>
                            <h3 className="text-sm font-medium mb-2">Active filters:</h3>
                            <div className="flex flex-wrap gap-2">
                                {columnFilters.length > 0 ? (
                                    columnFilters.map(filter => (
                                        <Badge key={filter.id} variant="secondary">
                                            {filter.id}: {typeof filter.value === 'string' ? filter.value : JSON.stringify(filter.value)}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-sm text-muted-foreground">No active filters</span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <div className="flex-1">
                                <h3 className="text-sm font-medium mb-2">Filter by name:</h3>
                                <Input
                                    placeholder="Search product name..."
                                    value={(columnFilters.find(f => f.id === 'name')?.value as string) || ''}
                                    onChange={e => {
                                        const value = e.target.value;
                                        setColumnFilters(prev => {
                                            const existing = prev.findIndex(f => f.id === 'name');
                                            if (existing >= 0) {
                                                const newFilters = [...prev];
                                                if (value) {
                                                    newFilters[existing] = { id: 'name', value };
                                                } else {
                                                    newFilters.splice(existing, 1);
                                                }
                                                return newFilters;
                                            } else if (value) {
                                                return [...prev, { id: 'name', value }];
                                            }
                                            return prev;
                                        });
                                    }}
                                />
                            </div>
                            {children}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </DataTableProvider>
    );
};

export const Basic: Story = {
    render: () => (
        <ResetButtonWrapper initialFilters={[{ id: 'name', value: 'Laptop' }]}>
            <DataTableFilterResetButton value="name" />
        </ResetButtonWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Basic usage of the DataTableFilterResetButton component to reset a specific column filter.',
            },
        },
    },
};

export const WithCustomText: Story = {
    render: () => (
        <ResetButtonWrapper initialFilters={[{ id: 'name', value: 'Laptop' }]}>
            <DataTableFilterResetButton value="name" />
        </ResetButtonWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterResetButton with custom button text.',
            },
        },
    },
};

export const WithCustomClasses: Story = {
    render: () => (
        <ResetButtonWrapper initialFilters={[{ id: 'name', value: 'Laptop' }]}>
            <DataTableFilterResetButton
                value="name"
                className="bg-red-100 hover:bg-red-200 text-red-600 border border-red-200"
            />
        </ResetButtonWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterResetButton with custom styling.',
            },
        },
    },
};

export const WithCallback: Story = {
    render: () => {
        const [resetCount, setResetCount] = useState(0);

        return (
            <ResetButtonWrapper initialFilters={[{ id: 'name', value: 'Laptop' }]}>
                <div className="space-y-2">
                    <DataTableFilterResetButton
                        value="name"
                        onReset={() => setResetCount(prev => prev + 1)}
                    />
                    <div className="text-xs text-muted-foreground">
                        Filter reset {resetCount} times
                    </div>
                </div>
            </ResetButtonWrapper>
        );
    },
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterResetButton with an onReset callback to track when the filter is reset.',
            },
        },
    },
};

export const WithIcon: Story = {
    render: () => (
        <ResetButtonWrapper initialFilters={[{ id: 'name', value: 'Laptop' }]}>
            <DataTableFilterResetButton
                value="name"
            />
        </ResetButtonWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterResetButton with an icon displayed alongside the reset text.',
            },
        },
    },
};

export const WithIconOnly: Story = {
    render: () => (
        <ResetButtonWrapper initialFilters={[{ id: 'name', value: 'Laptop' }]}>
            <DataTableFilterResetButton
                value="name"
                className="h-8 w-8 p-0"
            />
        </ResetButtonWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterResetButton showing only an icon without text.',
            },
        },
    },
};

export const Disabled: Story = {
    render: () => (
        <ResetButtonWrapper>
            <DataTableFilterResetButton
                value="name"
            />
        </ResetButtonWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterResetButton in disabled state when there is no active filter for the column.',
            },
        },
    },
}; 
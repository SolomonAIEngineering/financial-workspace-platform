import { Card, CardContent } from '@/components/card';
import { ColumnDef, createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';

import { Badge } from '@/components/badge';
import { ColumnFiltersState } from '@tanstack/react-table';
import { DataTableFilterCheckbox } from './DataTableFilterCheckbox';
import { DataTableProvider } from '../core/DataTableProvider';

const meta: Meta<typeof DataTableFilterCheckbox> = {
    title: 'Components/DataTable/V2/Filters/DataTableFilterCheckbox',
    component: DataTableFilterCheckbox,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: 'A checkbox group component for filtering data table columns with multiple selection support.',
            },
        },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DataTableFilterCheckbox>;

// Sample data for the table
interface Product {
    id: string;
    name: string;
    category: string;
    status: 'in-stock' | 'low-stock' | 'out-of-stock';
    price: number;
}

const data: Product[] = [
    { id: '1', name: 'Laptop', category: 'Electronics', status: 'in-stock', price: 999 },
    { id: '2', name: 'Smartphone', category: 'Electronics', status: 'low-stock', price: 699 },
    { id: '3', name: 'Headphones', category: 'Audio', status: 'out-of-stock', price: 199 },
    { id: '4', name: 'Monitor', category: 'Electronics', status: 'in-stock', price: 299 },
    { id: '5', name: 'Keyboard', category: 'Peripherals', status: 'low-stock', price: 89 },
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

// Status options with custom component
const statusOptionsWithBadges = [
    { label: 'In Stock', value: 'in-stock', color: 'bg-green-500' },
    { label: 'Low Stock', value: 'low-stock', color: 'bg-amber-500' },
    { label: 'Out of Stock', value: 'out-of-stock', color: 'bg-red-500' },
];

// Wrapper to provide the DataTable context
const FilterCheckboxWrapper = ({
    children,
    columnId = 'category',
    initialFilter = [],
}: {
    children: React.ReactNode;
    columnId?: string;
    initialFilter?: string[];
}) => {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
        { id: columnId, value: initialFilter }
    ]);

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
            <Card className="w-[350px]">
                <CardContent className="p-4">
                    <div className="mb-4">
                        <h3 className="text-sm font-medium mb-2">Selected filters:</h3>
                        <div className="flex flex-wrap gap-2">
                            {columnFilters[0]?.value && Array.isArray(columnFilters[0].value) && (columnFilters[0].value as string[]).length > 0 ? (
                                (columnFilters[0].value as string[]).map(value => (
                                    <Badge key={value} variant="secondary">{value}</Badge>
                                ))
                            ) : (
                                <span className="text-sm text-muted-foreground">None selected</span>
                            )}
                        </div>
                    </div>
                    {children}
                </CardContent>
            </Card>
        </DataTableProvider>
    );
};

export const Basic: Story = {
    render: () => (
        <FilterCheckboxWrapper>
            <DataTableFilterCheckbox
                value="category"
                options={categoryOptions} label={''} type={'checkbox'} />
        </FilterCheckboxWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Basic usage of the DataTableFilterCheckbox component for filtering by category.',
            },
        },
    },
};

export const WithCustomClasses: Story = {
    render: () => (
        <FilterCheckboxWrapper>
            <DataTableFilterCheckbox
                value="category"
                options={categoryOptions}
                className="space-y-3 border rounded-md p-3"
                itemClassName="pl-2" label={''} type={'checkbox'} />
        </FilterCheckboxWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterCheckbox with custom class names for the container and items.',
            },
        },
    },
};

export const WithInitialSelection: Story = {
    render: () => (
        <FilterCheckboxWrapper initialFilter={['Electronics']}>
            <DataTableFilterCheckbox
                value="category"
                options={categoryOptions} label={''} type={'checkbox'} />
        </FilterCheckboxWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterCheckbox with an initial selection already set.',
            },
        },
    },
};

export const StatusFilter: Story = {
    render: () => (
        <FilterCheckboxWrapper columnId="status">
            <DataTableFilterCheckbox
                value="status"
                options={statusOptions} label={''} type={'checkbox'} />
        </FilterCheckboxWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterCheckbox used for filtering product status.',
            },
        },
    },
};

export const WithCustomComponent: Story = {
    render: () => {
        // Custom component for rendering status options with colored badges
        const StatusBadge = (props: { label: string; color?: string }) => {
            const { label, color } = props;
            return (
                <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${color || ''}`} />
                    <span>{label}</span>
                </div>
            );
        };

        return (
            <FilterCheckboxWrapper columnId="status">
                <DataTableFilterCheckbox
                    value="status"
                    options={statusOptionsWithBadges}
                    component={StatusBadge}
                    label={''} type={'checkbox'} />
            </FilterCheckboxWrapper>
        );
    },
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterCheckbox with a custom component for rendering each option.',
            },
        },
    },
};

export const WithCallback: Story = {
    render: () => {
        const [selectedValues, setSelectedValues] = useState<string[]>([]);

        return (
            <FilterCheckboxWrapper columnId="category">
                <div className="space-y-4">
                    <DataTableFilterCheckbox
                        value="category"
                        options={categoryOptions}
                        onChange={(values) => setSelectedValues(values)} label={''} type={'checkbox'} />

                    <div className="text-sm py-2 px-3 bg-muted rounded-md">
                        <p>Selected via callback: </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {selectedValues.length > 0 ? (
                                selectedValues.map(value => (
                                    <Badge key={value} variant="outline">{value}</Badge>
                                ))
                            ) : (
                                <span className="text-muted-foreground">None</span>
                            )}
                        </div>
                    </div>
                </div>
            </FilterCheckboxWrapper>
        );
    },
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterCheckbox with an onChange callback to track filter changes.',
            },
        },
    },
}; 
import { Card, CardContent } from '@/components/card';
import { ColumnDef, createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';

import { DataTableFilterTimerange } from './DataTableFilterTimerange';
import { DataTableProvider } from '../core/DataTableProvider';
import { format } from 'date-fns';

const meta: Meta<typeof DataTableFilterTimerange> = {
    title: 'Components/DataTable/V2/Filters/DataTableFilterTimerange',
    component: DataTableFilterTimerange,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: 'A date range picker component for filtering date-based columns in a data table.',
            },
        },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DataTableFilterTimerange>;

// Sample data for the table
interface Order {
    id: string;
    reference: string;
    customer: string;
    date: string; // ISO date string
    amount: number;
    status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

// Helper to create dates
const createDate = (daysAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
};

const data: Order[] = [
    { id: '1', reference: 'ORD-001', customer: 'John Smith', date: createDate(2), amount: 125.99, status: 'processing' },
    { id: '2', reference: 'ORD-002', customer: 'Emma Johnson', date: createDate(5), amount: 79.50, status: 'shipped' },
    { id: '3', reference: 'ORD-003', customer: 'Michael Brown', date: createDate(10), amount: 249.99, status: 'delivered' },
    { id: '4', reference: 'ORD-004', customer: 'Sarah Davis', date: createDate(12), amount: 34.75, status: 'cancelled' },
    { id: '5', reference: 'ORD-005', customer: 'David Wilson', date: createDate(15), amount: 199.00, status: 'shipped' },
    { id: '6', reference: 'ORD-006', customer: 'Lisa Martinez', date: createDate(20), amount: 149.99, status: 'delivered' },
    { id: '7', reference: 'ORD-007', customer: 'Robert Taylor', date: createDate(25), amount: 59.95, status: 'processing' },
    { id: '8', reference: 'ORD-008', customer: 'Jennifer Anderson', date: createDate(30), amount: 89.99, status: 'shipped' },
    { id: '9', reference: 'ORD-009', customer: 'Thomas Clark', date: createDate(35), amount: 299.99, status: 'delivered' },
    { id: '10', reference: 'ORD-010', customer: 'Patricia White', date: createDate(40), amount: 19.99, status: 'cancelled' },
];

// Column helper for the table
const columnHelper = createColumnHelper<Order>();

// Column definitions
const columns: ColumnDef<Order, any>[] = [
    columnHelper.accessor('reference', {
        header: 'Order Ref',
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('customer', {
        header: 'Customer',
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('date', {
        header: 'Order Date',
        cell: info => format(new Date(info.getValue()), 'PPP'),
    }),
    columnHelper.accessor('amount', {
        header: 'Amount',
        cell: info => `$${info.getValue().toFixed(2)}`,
    }),
    columnHelper.accessor('status', {
        header: 'Status',
        cell: info => info.getValue(),
    }),
];

// Date presets
const presets = [
    {
        label: 'Last 7 days',
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        to: new Date(),
        shortcut: '7d'
    },
    {
        label: 'Last 30 days',
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date(),
        shortcut: '30d'
    },
    {
        label: 'Last 3 months',
        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        to: new Date(),
        shortcut: '3m'
    },
    {
        label: 'Last 6 months',
        from: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        to: new Date(),
        shortcut: '6m'
    },
    {
        label: 'Last year',
        from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        to: new Date(),
        shortcut: '1y'
    },
];

// Wrapper to provide the DataTable context
const FilterTimerangeWrapper = ({
    children,
    columnId = 'date',
    initialFrom,
    initialTo,
}: {
    children: React.ReactNode;
    columnId?: string;
    initialFrom?: Date;
    initialTo?: Date;
}) => {
    const [columnFilters, setColumnFilters] = useState([
        {
            id: columnId,
            value: {
                from: initialFrom,
                to: initialTo
            }
        }
    ]);

    const table = useReactTable({
        data,
        columns,
        state: {
            columnFilters,
        },
        onColumnFiltersChange: filters => setColumnFilters(filters as typeof columnFilters),
        getCoreRowModel: getCoreRowModel(),
    });

    // Get current filter values
    const currentFilter = columnFilters[0]?.value as { from?: Date; to?: Date } || { from: undefined, to: undefined };

    return (
        <DataTableProvider table={table} columns={columns}>
            <Card className="w-[350px]">
                <CardContent className="p-4">
                    <div className="mb-4">
                        <h3 className="text-sm font-medium mb-2">Selected date range:</h3>
                        <div className="text-sm">
                            {(currentFilter.from || currentFilter.to) ? (
                                <div className="space-y-1">
                                    {currentFilter.from && (
                                        <div>From: {format(currentFilter.from, 'PPP')}</div>
                                    )}
                                    {currentFilter.to && (
                                        <div>To: {format(currentFilter.to, 'PPP')}</div>
                                    )}
                                </div>
                            ) : (
                                <span className="text-sm text-muted-foreground">No date range selected</span>
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
        <FilterTimerangeWrapper>
            <DataTableFilterTimerange
                value="date"
                label="Order Date"
                type="timerange"
            />
        </FilterTimerangeWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Basic usage of the DataTableFilterTimerange component for filtering by date.',
            },
        },
    },
};

export const WithCustomFormat: Story = {
    render: () => (
        <FilterTimerangeWrapper>
            <DataTableFilterTimerange
                value="date"
                label="Order Date"
                type="timerange"
                dateFormat="dd/MM/yyyy"
            />
        </FilterTimerangeWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterTimerange with a custom date format (dd/MM/yyyy).',
            },
        },
    },
};

export const WithPresets: Story = {
    render: () => (
        <FilterTimerangeWrapper>
            <DataTableFilterTimerange
                value="date"
                label="Order Date"
                type="timerange"
                presets={presets}
            />
        </FilterTimerangeWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterTimerange with predefined date range presets.',
            },
        },
    },
};

export const WithCustomClasses: Story = {
    render: () => (
        <FilterTimerangeWrapper>
            <DataTableFilterTimerange
                value="date"
                label="Order Date"
                type="timerange"
                className="border rounded-md p-3"
            />
        </FilterTimerangeWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterTimerange with custom class names for the container.',
            },
        },
    },
};

export const WithInitialValues: Story = {
    render: () => {
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);

        return (
            <FilterTimerangeWrapper initialFrom={sevenDaysAgo} initialTo={today}>
                <DataTableFilterTimerange
                    value="date"
                    label="Order Date"
                    type="timerange"
                />
            </FilterTimerangeWrapper>
        );
    },
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterTimerange with initial date values (last 7 days).',
            },
        },
    },
};

export const WithCallback: Story = {
    render: () => {
        const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({ from: undefined, to: undefined });

        return (
            <FilterTimerangeWrapper>
                <div className="space-y-4">
                    <DataTableFilterTimerange
                        value="date"
                        label="Order Date"
                        type="timerange"
                        onChange={(values) => setDateRange(values || { from: undefined, to: undefined })}
                    />

                    <div className="text-sm py-2 px-3 bg-muted rounded-md">
                        <p>Date range via callback: </p>
                        <div className="font-mono mt-1 text-xs">
                            {dateRange.from && (
                                <div>From: {format(dateRange.from, 'PPP')}</div>
                            )}
                            {dateRange.to && (
                                <div>To: {format(dateRange.to, 'PPP')}</div>
                            )}
                            {!dateRange.from && !dateRange.to && (
                                <div>No selection</div>
                            )}
                        </div>
                    </div>
                </div>
            </FilterTimerangeWrapper>
        );
    },
    parameters: {
        docs: {
            description: {
                story: 'DataTableFilterTimerange with an onChange callback to track date selection changes.',
            },
        },
    },
}; 
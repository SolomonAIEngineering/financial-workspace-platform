import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/card';
import type { Meta, StoryObj } from '@storybook/react';

import { ColumnSchema } from './schema';
import { DataTableFilterField } from '../../data-table-v2/core/types';
import { InfiniteClient } from './client';
import { LEVELS } from './constants';
import React from 'react';

const meta = {
    title: 'Components/Infinite/Core/InfiniteClient',
    component: InfiniteClient,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: 'A client component that handles data fetching and state management for infinite data tables.',
            },
        },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof InfiniteClient>;

// Mock data for stories
const mockDates = [
    new Date('2023-10-01T12:30:00'),
    new Date('2023-10-02T14:45:00'),
    new Date('2023-10-03T09:15:00'),
    new Date('2023-10-04T18:20:00'),
    new Date('2023-10-05T11:05:00'),
];

const mockData = [
    { uuid: '1', message: 'Application started', level: 'info', date: mockDates[0] },
    { uuid: '2', message: 'Database connection failed', level: 'error', date: mockDates[1] },
    { uuid: '3', message: 'User authentication successful', level: 'success', date: mockDates[2] },
    { uuid: '4', message: 'API request timeout', level: 'warn', date: mockDates[3] },
    { uuid: '5', message: 'System health check', level: 'debug', date: mockDates[4] },
];

// Mock columns for the data table
const mockColumns = [
    {
        accessorKey: 'level',
        header: 'Level',
        cell: ({ row }) => {
            const level = row.getValue('level') as string;
            const icons = {
                error: <XCircle className="h-4 w-4 text-red-500" />,
                warn: <AlertCircle className="h-4 w-4 text-amber-500" />,
                info: <Clock className="h-4 w-4 text-blue-500" />,
                debug: <Clock className="h-4 w-4 text-slate-500" />,
                success: <CheckCircle2 className="h-4 w-4 text-green-500" />,
            };

            return (
                <div className="flex items-center gap-2">
                    {icons[level as keyof typeof icons] || null}
                    <span className="capitalize">{level}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'message',
        header: 'Message',
    },
    {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => {
            const date = row.getValue('date') as Date;
            return date.toLocaleString();
        },
    },
];

// Mock filter fields
const mockFilterFields: DataTableFilterField<ColumnSchema>[] = [
    {
        label: 'Log Level',
        value: 'level',
        type: 'checkbox',
        options: LEVELS.map(level => ({
            label: level.charAt(0).toUpperCase() + level.slice(1),
            value: level,
        })),
    },
    {
        label: 'Message',
        value: 'message',
        type: 'input',
    },
    {
        label: 'Date',
        value: 'date',
        type: 'timerange',
        presets: [
            { label: 'Last hour', from: new Date(Date.now() - 3600000), to: new Date(), shortcut: '1h' },
            { label: 'Last day', from: new Date(Date.now() - 86400000), to: new Date(), shortcut: '1d' },
            { label: 'Last week', from: new Date(Date.now() - 604800000), to: new Date(), shortcut: '1w' },
        ],
    },
];

// Mock sheet fields for detail view
const mockSheetFields = [
    { label: 'UUID', value: 'uuid' },
    { label: 'Message', value: 'message' },
    { label: 'Level', value: 'level' },
    { label: 'Timestamp', value: 'date' },
];

// Mock fetch functions to avoid actual API calls
const mockFetch = () => {
    return {
        data: mockData,
        metadata: {
            totalRowCount: 100,
            filterRowCount: 5,
            totalFetched: 5,
            chartData: {
                bins: [
                    { date: mockDates[0], count: 10, level: 'info' },
                    { date: mockDates[1], count: 5, level: 'error' },
                    { date: mockDates[2], count: 8, level: 'success' },
                    { date: mockDates[3], count: 3, level: 'warn' },
                    { date: mockDates[4], count: 15, level: 'debug' },
                ],
            },
            facets: {
                level: {
                    rows: [
                        { value: 'info', total: 45 },
                        { value: 'error', total: 12 },
                        { value: 'warn', total: 18 },
                        { value: 'debug', total: 20 },
                        { value: 'success', total: 5 },
                    ],
                },
            },
        },
        isLoading: false,
        isFetching: false,
        fetchNextPage: () => console.log('Fetching next page...'),
        fetchPreviousPage: () => console.log('Fetching previous page...'),
        refetch: () => console.log('Refetching data...'),
        searchParams: { size: 20 },
        liveMode: false,
        liveAnchorRow: null,
        liveTimestamp: null,
    };
};

// Create a wrapper for viewing the InfiniteClient data
const InfiniteClientWrapper = ({
    children,
    title,
}: {
    children: React.ReactNode;
    title: string;
}) => (
    <div className="p-4">
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    </div>
);

// Mock component for the InfiniteClient stories
// In a real scenario, you would use the DataTableInfinite component
const MockDataTableComponent = (props: any) => {
    return (
        <div className="space-y-4">
            <h3 className="font-medium">InfiniteClient Data</h3>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h4 className="text-sm font-medium mb-2">Data Stats:</h4>
                    <ul className="text-sm space-y-1">
                        <li>Total Rows: {props.totalRows}</li>
                        <li>Filtered Rows: {props.filterRows}</li>
                        <li>Fetched Rows: {props.totalRowsFetched}</li>
                        <li>Loading: {props.isLoading ? 'Yes' : 'No'}</li>
                        <li>Fetching: {props.isFetching ? 'Yes' : 'No'}</li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-sm font-medium mb-2">Filter Fields:</h4>
                    <div className="text-sm space-y-1">
                        {props.filterFields.map((field: any) => (
                            <div key={field.value} className="p-2 bg-muted rounded-md">
                                {field.label} ({field.type})
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">Data Sample:</h4>
                <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                {props.columns.map((column: any) => (
                                    <th key={column.accessorKey} className="p-2 text-left font-medium">
                                        {column.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {props.data.slice(0, 5).map((row: any) => (
                                <tr key={row.uuid} className={props.getRowClassName(row)}>
                                    {props.columns.map((column: any) => (
                                        <td key={`${row.uuid}-${column.accessorKey}`} className="p-2 border-t">
                                            {column.cell ? column.cell({ row: { getValue: () => row[column.accessorKey], original: row } }) : row[column.accessorKey]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex space-x-2">
                <button
                    className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md"
                    onClick={props.fetchPreviousPage}
                >
                    Previous Page
                </button>
                <button
                    className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md"
                    onClick={props.fetchNextPage}
                >
                    Next Page
                </button>
                <button
                    className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md"
                    onClick={props.refetch}
                >
                    Refetch
                </button>
            </div>
        </div>
    );
};

// Mock implementation for the InfiniteClient
const MockInfiniteClient = (props: any) => {
    // In a real component, this would call useInfiniteQuery
    // For Storybook, we'll just return mock data
    const clientData = mockFetch();

    // Just to create a fake component for display in Storybook
    return <MockDataTableComponent {...clientData} {...props} />;
};

export const Basic: Story = {
    render: () => (
        <InfiniteClientWrapper title="Basic InfiniteClient Example">
            <MockInfiniteClient
                columns={mockColumns}
                defaultFilterFields={mockFilterFields}
            />
        </InfiniteClientWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Basic usage of the InfiniteClient component with default settings.',
            },
        },
    },
};

export const WithCustomEndpoint: Story = {
    render: () => (
        <InfiniteClientWrapper title="InfiniteClient with Custom API Endpoint">
            <MockInfiniteClient
                columns={mockColumns}
                defaultFilterFields={mockFilterFields}
                apiEndpoint="/api/logs"
            />
        </InfiniteClientWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'InfiniteClient configured with a custom API endpoint for fetching log data.',
            },
        },
    },
};

export const WithInitialSearchParams: Story = {
    render: () => (
        <InfiniteClientWrapper title="InfiniteClient with Initial Search Parameters">
            <MockInfiniteClient
                columns={mockColumns}
                defaultFilterFields={mockFilterFields}
                initialSearchParams={{
                    size: 50,
                    sort: { id: 'date', desc: true },
                    level: 'error'
                }}
            />
        </InfiniteClientWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'InfiniteClient initialized with specific search parameters to control the initial data fetch.',
            },
        },
    },
};

export const WithSheetFields: Story = {
    render: () => (
        <InfiniteClientWrapper title="InfiniteClient with Detail Sheet Fields">
            <MockInfiniteClient
                columns={mockColumns}
                defaultFilterFields={mockFilterFields}
                sheetFields={mockSheetFields}
            />
        </InfiniteClientWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'InfiniteClient configured with sheet fields for detailed view of records.',
            },
        },
    },
};

export const WithLiveRowIndicator: Story = {
    render: () => (
        <InfiniteClientWrapper title="InfiniteClient with Live Row Indicator">
            <MockInfiniteClient
                columns={mockColumns}
                defaultFilterFields={mockFilterFields}
                renderLiveRow={({ row }: any) => (
                    <div className="absolute left-0 w-2 h-full bg-blue-500 animate-pulse" />
                )}
            />
        </InfiniteClientWrapper>
    ),
    parameters: {
        docs: {
            description: {
                story: 'InfiniteClient with a custom live row indicator to highlight the current active row in live mode.',
            },
        },
    },
}; 
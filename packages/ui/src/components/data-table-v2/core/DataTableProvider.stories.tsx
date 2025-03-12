import {
    ColumnDef,
    createColumnHelper,
    getCoreRowModel,
    useReactTable
} from '@tanstack/react-table';
import type { Meta, StoryObj } from '@storybook/react';

import { DataTableProvider } from './DataTableProvider';
import React from 'react';

// Define a simple data interface for our demo
interface Person {
    id: string;
    firstName: string;
    lastName: string;
    age: number;
    visits: number;
    status: string;
}

// Sample data
const data: Person[] = [
    {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        age: 35,
        visits: 10,
        status: 'Active',
    },
    {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        age: 42,
        visits: 5,
        status: 'Inactive',
    },
    {
        id: '3',
        firstName: 'Bob',
        lastName: 'Johnson',
        age: 28,
        visits: 15,
        status: 'Active',
    },
];

// Column helper for type safety
const columnHelper = createColumnHelper<Person>();

// Column definitions
const columns = [
    columnHelper.accessor('firstName', {
        header: 'First Name',
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('lastName', {
        header: 'Last Name',
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('age', {
        header: 'Age',
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('visits', {
        header: 'Visits',
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('status', {
        header: 'Status',
        cell: info => info.getValue(),
    }),
];

// Define the story metadata
const meta: Meta<typeof DataTableProvider> = {
    title: 'Components/DataTable/V2/Core/DataTableProvider',
    component: DataTableProvider,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: 'DataTableProvider is a context provider component for managing data table state and functionality',
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof DataTableProvider>;

// Simple container component to demonstrate context usage
const DataTableConsumer: React.FC = () => {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <DataTableProvider
            table={table}
            columns={columns as ColumnDef<Person, any>[]}
            filterFields={[]}
        >
            <div className="p-4 border rounded">
                <h3 className="text-lg font-medium mb-4">DataTable Context Provider</h3>
                <div>
                    <p>This component provides data table state and functionality through React Context</p>
                    <p className="mt-2">Table has {table.getRowModel().rows.length} rows</p>
                </div>
            </div>
        </DataTableProvider>
    );
};

// Basic story
export const Basic: Story = {
    render: () => <DataTableConsumer />,
};

// Story with callbacks
export const WithCallbacks: Story = {
    render: () => {
        const table = useReactTable({
            data,
            columns,
            getCoreRowModel: getCoreRowModel(),
        });

        const callbacks = {
            onRowClick: (row: any) => console.log('Row clicked:', row),
            onSortingChange: (sorting: any) => console.log('Sorting changed:', sorting),
            onPageChange: (page: number) => console.log('Page changed:', page),
            onFilterChange: (columnId: string, value: any) => console.log('Filter changed:', columnId, value),
            onReady: () => console.log('DataTable ready'),
        };

        return (
            <DataTableProvider
                table={table}
                columns={columns as ColumnDef<Person, any>[]}
                filterFields={[]}
                callbacks={callbacks}
            >
                <div className="p-4 border rounded">
                    <h3 className="text-lg font-medium mb-4">DataTable with Callbacks</h3>
                    <div>
                        <p>This example includes callback functions that will log actions to the console</p>
                        <p className="mt-2">Open your console to see the callback logs</p>
                    </div>
                </div>
            </DataTableProvider>
        );
    },
    parameters: {
        docs: {
            description: {
                story: 'This example demonstrates how to provide callbacks for various table interactions.',
            },
        },
    },
};

// Story with initial state
export const WithInitialState: Story = {
    render: () => {
        const table = useReactTable({
            data,
            columns,
            getCoreRowModel: getCoreRowModel(),
        });

        return (
            <DataTableProvider
                table={table}
                columns={columns as ColumnDef<Person, any>[]}
                filterFields={[]}
                initialState={{
                    pageSize: 5,
                    globalFilter: 'John',
                    density: 'compact',
                }}
            >
                <div className="p-4 border rounded">
                    <h3 className="text-lg font-medium mb-4">DataTable with Initial State</h3>
                    <div>
                        <p>This example provides initial state values for the table:</p>
                        <ul className="list-disc pl-5 mt-2">
                            <li>Page size: 5</li>
                            <li>Global filter: "John"</li>
                            <li>Density: compact</li>
                        </ul>
                    </div>
                </div>
            </DataTableProvider>
        );
    },
    parameters: {
        docs: {
            description: {
                story: 'This example demonstrates how to provide initial state to the DataTableProvider.',
            },
        },
    },
}; 
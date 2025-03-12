import { Eye, LayoutDashboard, List } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table';

import { DataTableProvider } from './core/DataTableProvider';
import { DataTableViewOptions } from './DataTableViewOptions';

const meta: Meta<typeof DataTableViewOptions> = {
    title: 'Components/DataTable/V2/DataTableViewOptions',
    component: DataTableViewOptions,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: 'A component that provides a UI for toggling column visibility and reordering columns in a data table.',
            },
        },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DataTableViewOptions>;

// Define a sample data interface
interface Person {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    age: number;
    role: string;
    status: 'active' | 'inactive';
}

// Sample data
const data: Person[] = Array.from({ length: 20 }, (_, index) => ({
    id: `p${index + 1}`,
    firstName: `First${index + 1}`,
    lastName: `Last${index + 1}`,
    email: `person${index + 1}@example.com`,
    age: 20 + Math.floor(Math.random() * 30),
    role: index % 3 === 0 ? 'Admin' : index % 3 === 1 ? 'Editor' : 'Viewer',
    status: index % 2 === 0 ? 'active' : 'inactive',
}));

// Column definitions
const columnHelper = createColumnHelper<Person>();

const columns = [
    columnHelper.accessor('id', {
        header: 'ID',
        cell: info => info.getValue(),
        meta: { label: 'ID' },
    }),
    columnHelper.accessor('firstName', {
        header: 'First Name',
        cell: info => info.getValue(),
        meta: { label: 'First Name' },
    }),
    columnHelper.accessor('lastName', {
        header: 'Last Name',
        cell: info => info.getValue(),
        meta: { label: 'Last Name' },
    }),
    columnHelper.accessor('email', {
        header: 'Email',
        cell: info => info.getValue(),
        meta: { label: 'Email' },
        enableHiding: false, // This column cannot be hidden
    }),
    columnHelper.accessor('age', {
        header: 'Age',
        cell: info => info.getValue(),
        meta: { label: 'Age' },
    }),
    columnHelper.accessor('role', {
        header: 'Role',
        cell: info => info.getValue(),
        meta: { label: 'Role' },
    }),
    columnHelper.accessor('status', {
        header: 'Status',
        cell: info => info.getValue(),
        meta: { label: 'Status' },
    }),
];

// Wrapper component for stories
const ViewOptionsWithProvider = (props: React.ComponentProps<typeof DataTableViewOptions>) => {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        state: {
            columnVisibility: {
                id: false, // Hide ID column by default
            },
        },
    });

    return (
        <DataTableProvider
            table={table}
            columns={columns}
            enableColumnOrdering={props.enableColumnOrdering}
        >
            <div className="flex items-center justify-center p-4 border rounded-md w-[300px]">
                <DataTableViewOptions {...props} />
            </div>
        </DataTableProvider>
    );
};

// Story for the basic component
export const Basic: Story = {
    render: () => <ViewOptionsWithProvider />,
};

// Story with column ordering enabled
export const WithColumnOrdering: Story = {
    render: () => <ViewOptionsWithProvider enableColumnOrdering={true} />,
    parameters: {
        docs: {
            description: {
                story: 'The component with column ordering enabled, allowing users to drag and drop to reorder columns.',
            },
        },
    },
};

// Story with custom placeholder text
export const CustomPlaceholder: Story = {
    render: () => (
        <ViewOptionsWithProvider
            searchPlaceholder="Find a column..."
            emptySearchText="No matching columns"
        />
    ),
    parameters: {
        docs: {
            description: {
                story: 'Customizing the search placeholder and empty search result text.',
            },
        },
    },
};

// Story with custom icon
export const CustomIcon: Story = {
    render: () => (
        <div className="flex space-x-4">
            <ViewOptionsWithProvider icon={<Eye className="h-4 w-4" />} ariaLabel="View columns" />
            <ViewOptionsWithProvider icon={<List className="h-4 w-4" />} ariaLabel="Column list" />
            <ViewOptionsWithProvider icon={<LayoutDashboard className="h-4 w-4" />} ariaLabel="Table layout" />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Using custom icons for the trigger button.',
            },
        },
    },
};

// Story with custom styling
export const CustomStyling: Story = {
    render: () => (
        <ViewOptionsWithProvider
            triggerClassName="bg-blue-100 hover:bg-blue-200 border-blue-300"
            contentClassName="border-blue-300 shadow-blue-100"
        />
    ),
    parameters: {
        docs: {
            description: {
                story: 'Applying custom styles to the trigger button and popover content.',
            },
        },
    },
};

// Story that demonstrates the callback functionality
export const WithCallbacks: Story = {
    render: () => {
        // This would normally be part of your application, not in the story
        // But this demonstrates how callbacks work
        const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
        const [columnOrder, setColumnOrder] = useState<string[]>([]);

        const table = useReactTable({
            data,
            columns,
            getCoreRowModel: getCoreRowModel(),
        });

        // Adapter functions for the callbacks
        const handleColumnVisibilityChange = (columnId: string, isVisible: boolean) => {
            setVisibleColumns(prev => {
                if (isVisible && !prev.includes(columnId)) {
                    return [...prev, columnId];
                }
                if (!isVisible && prev.includes(columnId)) {
                    return prev.filter(id => id !== columnId);
                }
                return prev;
            });
        };

        const handleColumnOrderChange = (newOrder: string[]) => {
            setColumnOrder(newOrder);
        };

        return (
            <div className="space-y-4">
                <div className="border rounded-md p-3 max-w-[500px]">
                    <h3 className="text-sm font-medium mb-1">Visible Columns:</h3>
                    <div className="text-xs text-muted-foreground mb-2">
                        {visibleColumns.length > 0
                            ? visibleColumns.join(', ')
                            : 'No columns selected'}
                    </div>

                    <h3 className="text-sm font-medium mb-1">Column Order:</h3>
                    <div className="text-xs text-muted-foreground">
                        {columnOrder.length > 0
                            ? columnOrder.join(' → ')
                            : 'Default order'}
                    </div>
                </div>

                <DataTableProvider
                    table={table}
                    columns={columns}
                    enableColumnOrdering={true}
                    callbacks={{
                        onColumnVisibilityChange: handleColumnVisibilityChange,
                        onColumnOrderChange: handleColumnOrderChange
                    }}
                >
                    <div className="flex justify-center border rounded-md p-4">
                        <DataTableViewOptions enableColumnOrdering={true} />
                    </div>
                </DataTableProvider>
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                story: 'Demonstrating the callback functionality when column visibility or ordering changes.',
            },
        },
    },
}; 
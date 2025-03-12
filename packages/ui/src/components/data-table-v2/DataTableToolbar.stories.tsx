import type { Meta, StoryObj } from "@storybook/react";
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table";

import { Button } from "@/components/button";
import { DataTableProvider } from "./core/DataTableProvider";
import { DataTableToolbar } from "./DataTableToolbar";
import React from "react";

const meta: Meta<typeof DataTableToolbar> = {
    title: "Components/DataTable/V2/DataTableToolbar",
    component: DataTableToolbar,
    parameters: {
        layout: "centered",
        docs: {
            description: {
                component: "A toolbar component for the DataTable, providing filter controls, row count information, and view options.",
            },
        },
    },
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DataTableToolbar>;

// Create a sample data set
interface SampleData {
    id: string;
    name: string;
    email: string;
    status: "active" | "inactive" | "pending";
}

const sampleData: SampleData[] = Array.from({ length: 100 }, (_, i) => ({
    id: `id-${i}`,
    name: `Name ${i}`,
    email: `user${i}@example.com`,
    status: i % 3 === 0 ? "active" : i % 3 === 1 ? "inactive" : "pending",
}));

// Create column helper
const columnHelper = createColumnHelper<SampleData>();

// Define columns
const columns = [
    columnHelper.accessor("id", {
        header: "ID",
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => info.getValue(),
        filterFn: "equals",
    }),
];

// Create a wrapper component to provide necessary context
const ToolbarWithProvider = (args: React.ComponentProps<typeof DataTableToolbar>) => {
    // Create a table instance first
    const table = useReactTable({
        data: sampleData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        initialState: {
            pagination: {
                pageSize: 10,
                pageIndex: 0,
            }
        }
    });

    return (
        <DataTableProvider
            table={table}
            columns={columns}
        >
            <div className="w-[800px] border border-border rounded-md p-4">
                <DataTableToolbar {...args} />
            </div>
        </DataTableProvider>
    );
};

export const Basic: Story = {
    render: (args) => <ToolbarWithProvider {...args} />,
};

export const WithCustomActions: Story = {
    render: (args) => (
        <ToolbarWithProvider
            {...args}
            renderActions={() => (
                <>
                    <Button size="sm" variant="outline">Export</Button>
                    <Button size="sm" variant="default">Add New</Button>
                </>
            )}
        />
    ),
};

export const WithoutRowCount: Story = {
    render: (args) => <ToolbarWithProvider {...args} hideRowCount />,
};

export const WithoutViewOptions: Story = {
    render: (args) => <ToolbarWithProvider {...args} hideViewOptions />,
};

export const WithControlsDisabled: Story = {
    render: (args) => <ToolbarWithProvider {...args} disabled />,
};

export const WithCustomState: Story = {
    render: () => {
        const [controlsOpen, setControlsOpen] = React.useState(true);

        return (
            <ToolbarWithProvider
                controlsOpen={controlsOpen}
                onControlsOpenChange={setControlsOpen}
                renderActions={() => (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Controls are {controlsOpen ? "open" : "closed"}
                        </span>
                    </div>
                )}
            />
        );
    },
};

export const WithFilters: Story = {
    render: (args) => {
        // Create a table instance with filters
        const table = useReactTable({
            data: sampleData,
            columns,
            getCoreRowModel: getCoreRowModel(),
            initialState: {
                pagination: {
                    pageSize: 10,
                    pageIndex: 0,
                },
                columnFilters: [
                    {
                        id: "status",
                        value: "active",
                    },
                ]
            }
        });

        return (
            <DataTableProvider
                table={table}
                columns={columns}
            >
                <div className="w-[800px] border border-border rounded-md p-4">
                    <DataTableToolbar {...args} />
                </div>
            </DataTableProvider>
        );
    },
}; 
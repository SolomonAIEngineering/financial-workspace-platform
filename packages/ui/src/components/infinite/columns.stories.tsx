import { Card, CardContent, CardHeader, CardTitle } from '../../primitives/card';
import { LEVELS, METHODS } from './core/constants';
import type { Meta, StoryObj } from '@storybook/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../primitives/table';

import { ColumnDef } from '@tanstack/react-table';
import React from 'react';
import { columns } from './columns';

// This is a story for a set of columns, so we'll create a simple table component to display them
const ColumnsDemo = ({ columns }: { columns: ColumnDef<any>[] }) => {
    // Generate sample data
    const generateData = (count: number) => {
        const data = [];

        for (let i = 0; i < count; i++) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - i * 5);

            data.push({
                uuid: `uuid-${i}`,
                level: LEVELS[Math.floor(Math.random() * LEVELS.length)],
                method: METHODS[Math.floor(Math.random() * METHODS.length)],
                status: [200, 201, 204, 400, 401, 403, 404, 500][Math.floor(Math.random() * 8)],
                date: now,
                host: ['api.example.com', 'auth.example.com', 'app.example.com'][Math.floor(Math.random() * 3)],
                pathname: ['/api/users', '/api/auth', '/api/products', '/api/orders'][Math.floor(Math.random() * 4)],
                region: ['us-east', 'us-west', 'eu-west', 'ap-southeast'][Math.floor(Math.random() * 4)],
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
                message: `This is a sample message ${i}`,
                timing: {
                    dns: Math.random() * 50,
                    connection: Math.random() * 100,
                    tls: Math.random() * 80,
                    ttfb: Math.random() * 200,
                    transfer: Math.random() * 300,
                    total: Math.random() * 500,
                },
            });
        }

        return data;
    };

    const data = generateData(5);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Infinite Columns Demo</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableHead key={column.id || String(column.accessorKey)}>
                                        {typeof column.header === 'function'
                                            ? column.header({ column, header: { id: column.id || String(column.accessorKey) } })
                                            : column.header || column.accessorKey}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((row, i) => (
                                <TableRow key={i}>
                                    {columns.map((column) => {
                                        const key = column.accessorKey as string;
                                        return (
                                            <TableCell key={key}>
                                                {column.cell
                                                    ? column.cell({
                                                        row: {
                                                            getValue: (key: string) => row[key],
                                                            original: row
                                                        }
                                                    })
                                                    : row[key]
                                                }
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

const meta: Meta = {
    title: 'Components/Infinite/Columns',
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: 'Predefined columns for the InfiniteTable component with specialized cell renderers.',
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof ColumnsDemo>;

export const AllColumns: Story = {
    render: () => (
        <div className="max-w-[1000px]">
            <ColumnsDemo columns={columns} />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'All available columns for the Infinite data table.',
            },
        },
    },
};

export const CoreColumns: Story = {
    render: () => (
        <div className="max-w-[800px]">
            <ColumnsDemo
                columns={columns.filter(column => {
                    const key = column.accessorKey as string;
                    return ['level', 'date', 'status', 'method', 'pathname', 'host'].includes(key);
                })}
            />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Core columns commonly used in log displays.',
            },
        },
    },
};

export const TimingColumns: Story = {
    render: () => (
        <div className="max-w-[600px]">
            <ColumnsDemo
                columns={columns.filter(column => {
                    const key = column.accessorKey as string;
                    return key?.startsWith('timing.');
                })}
            />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Performance timing-related columns.',
            },
        },
    },
};

export const MetadataColumns: Story = {
    render: () => (
        <div className="max-w-[700px]">
            <ColumnsDemo
                columns={columns.filter(column => {
                    const key = column.accessorKey as string;
                    return ['uuid', 'region', 'ip', 'userAgent'].includes(key);
                })}
            />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Metadata columns for additional context.',
            },
        },
    },
};

export const CustomColumnSet: Story = {
    render: () => {
        // Example of how to create a custom column set
        const customColumns = [
            columns.find(col => col.accessorKey === 'level'),
            columns.find(col => col.accessorKey === 'date'),
            columns.find(col => col.accessorKey === 'method'),
            columns.find(col => col.accessorKey === 'status'),
            columns.find(col => col.accessorKey === 'message'),
            columns.find(col => col.accessorKey === 'timing.total'),
        ].filter(Boolean) as ColumnDef<any>[];

        return (
            <div className="max-w-[800px]">
                <ColumnsDemo columns={customColumns} />
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                story: 'Example of how to create a custom column set by selecting specific columns.',
            },
        },
    },
}; 
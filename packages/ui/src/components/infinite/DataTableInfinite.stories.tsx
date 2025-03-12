import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { Meta, StoryObj } from '@storybook/react';

import { BaseChartSchema } from './core/schema';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableFilterField } from '@/components/data-table-v2/core/types';
import { DataTableInfinite } from './DataTableInfinite';

const meta: Meta<typeof DataTableInfinite> = {
    title: 'Components/Infinite/DataTableInfinite',
    component: DataTableInfinite,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: 'A powerful data table component with infinite scrolling capabilities, filtering, and dynamic rendering.',
            },
        },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DataTableInfinite>;

// Sample data for the table
interface LogEntry {
    uuid: string;
    level: 'info' | 'error' | 'warn' | 'debug' | 'success';
    message: string;
    details?: string;
    date: Date;
    service: string;
    duration: number;
    status?: number;
    user?: string;
    tags: string[];
}

// Function to generate random logs
const generateLogs = (count: number): LogEntry[] => {
    const levels = ['info', 'error', 'warn', 'debug', 'success'] as const;
    const services = ['api', 'auth', 'web', 'database', 'cache', 'messaging'];
    const tags = ['production', 'development', 'test', 'critical', 'performance', 'security'];

    return Array.from({ length: count }).map((_, i) => {
        const level = levels[Math.floor(Math.random() * levels.length)];
        const service = services[Math.floor(Math.random() * services.length)];
        const date = new Date();
        date.setHours(date.getHours() - Math.floor(Math.random() * 24 * 7)); // Random time in the last week

        const randomTags: string[] = [];
        const tagCount = Math.floor(Math.random() * 3);
        for (let j = 0; j < tagCount; j++) {
            const tag = tags[Math.floor(Math.random() * tags.length)];
            if (!randomTags.includes(tag)) {
                randomTags.push(tag);
            }
        }

        return {
            uuid: `log-${i}-${Date.now()}`,
            level,
            message: getMessageForLevel(level, service),
            details: Math.random() > 0.7 ? `Detailed information for ${service} ${level} event` : undefined,
            date,
            service,
            duration: Math.floor(Math.random() * 500),
            status: level === 'error' ? 500 : level === 'warn' ? 400 : 200,
            user: Math.random() > 0.6 ? `user-${Math.floor(Math.random() * 10) + 1}` : undefined,
            tags: randomTags,
        };
    });
};

// Helper function to get a message based on level and service
const getMessageForLevel = (level: string, service: string): string => {
    const messages = {
        info: [
            `${service} service started`,
            `User authentication successful in ${service}`,
            `New data received by ${service}`,
            `Successfully processed request in ${service}`,
        ],
        error: [
            `Failed to connect to ${service}`,
            `Exception occurred in ${service} process`,
            `Database query error in ${service}`,
            `Service ${service} crashed unexpectedly`,
        ],
        warn: [
            `High memory usage in ${service}`,
            `Slow response time from ${service}`,
            `Deprecated method called in ${service}`,
            `Rate limit approaching for ${service}`,
        ],
        debug: [
            `Function executed in ${service} with params`,
            `State change in ${service} component`,
            `Cache hit ratio: 0.85 for ${service}`,
            `Request processed in ${service}`,
        ],
        success: [
            `${service} operation completed successfully`,
            `Data migration completed in ${service}`,
            `Backup successful for ${service}`,
            `${service} health check passed`,
        ],
    };

    const levelMessages = messages[level as keyof typeof messages] || messages.info;
    return levelMessages[Math.floor(Math.random() * levelMessages.length)];
};

// Generate log data
const logs = generateLogs(100);

// Column definitions
const columns: ColumnDef<LogEntry>[] = [
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
        accessorKey: 'date',
        header: 'Timestamp',
        cell: ({ row }) => {
            const date = row.getValue('date') as Date;
            return date.toLocaleString();
        },
    },
    {
        accessorKey: 'service',
        header: 'Service',
    },
    {
        accessorKey: 'message',
        header: 'Message',
        size: 250,
    },
    {
        accessorKey: 'duration',
        header: 'Duration (ms)',
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status') as number | undefined;
            if (!status) return null;

            const color =
                status >= 500 ? 'text-red-500' :
                    status >= 400 ? 'text-amber-500' :
                        status >= 200 && status < 300 ? 'text-green-500' :
                            'text-gray-500';

            return <span className={color}>{status}</span>;
        },
    },
    {
        accessorKey: 'tags',
        header: 'Tags',
        cell: ({ row }) => {
            const tags = row.getValue('tags') as string[];
            if (!tags?.length) return null;

            return (
                <div className="flex flex-wrap gap-1">
                    {tags.map(tag => (
                        <span
                            key={tag}
                            className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-xs"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            );
        },
    },
];

// Filter fields for the data table
const filterFields = [
    {
        id: 'level',
        label: 'Level',
        value: 'level' as keyof LogEntry,
        type: 'checkbox' as const,
        options: [
            { label: 'Info', value: 'info' },
            { label: 'Error', value: 'error' },
            { label: 'Warning', value: 'warn' },
            { label: 'Debug', value: 'debug' },
            { label: 'Success', value: 'success' },
        ],
    },
    {
        id: 'message',
        label: 'Message',
        value: 'message' as keyof LogEntry,
        type: 'input' as const,
        placeholder: 'Search message...',
    },
    {
        id: 'service',
        label: 'Service',
        value: 'service' as keyof LogEntry,
        type: 'checkbox' as const,
        options: [
            { label: 'API', value: 'api' },
            { label: 'Auth', value: 'auth' },
            { label: 'Web', value: 'web' },
            { label: 'Database', value: 'database' },
            { label: 'Cache', value: 'cache' },
            { label: 'Messaging', value: 'messaging' },
        ],
    },
    {
        id: 'date',
        label: 'Date Range',
        value: 'date' as keyof LogEntry,
        type: 'timerange' as const,
        presets: [
            { label: 'Last hour', value: '1h' },
            { label: 'Last day', value: '1d' },
            { label: 'Last week', value: '1w' },
        ],
    },
    {
        id: 'duration',
        label: 'Duration',
        value: 'duration' as keyof LogEntry,
        type: 'slider' as const,
        min: 0,
        max: 500,
        step: 10,
    },
] as unknown as DataTableFilterField<LogEntry>[];

// Chart data generation
const generateChartData = () => {
    const now = new Date();
    const data: BaseChartSchema[] = [];
    for (let i = 0; i < 24; i++) {
        const date = new Date(now);
        date.setHours(date.getHours() - i);
        data.push({
            timestamp: date.getTime(),
            count: Math.floor(Math.random() * 50) + 10,
            error: i % 5 === 0 ? Math.floor(Math.random() * 10) : 0,
            warn: i % 3 === 0 ? Math.floor(Math.random() * 20) : 0,
            info: Math.floor(Math.random() * 30) + 5,
            debug: Math.floor(Math.random() * 15),
            trace: Math.floor(Math.random() * 8)
        });
    }
    return data;
};

// Mock async fetch functions
const fetchNextPage = async () => {
    console.log('Fetching next page...');
    return new Promise(resolve => setTimeout(resolve, 1000));
};

const fetchPreviousPage = async () => {
    console.log('Fetching previous page...');
    return new Promise(resolve => setTimeout(resolve, 1000));
};

const refetch = () => {
    console.log('Refetching data...');
    return new Promise(resolve => setTimeout(resolve, 1000));
};

// Sheet fields for detail view
const sheetFields = [
    { label: 'UUID', value: 'uuid' },
    { label: 'Level', value: 'level' },
    { label: 'Message', value: 'message' },
    { label: 'Details', value: 'details' },
    { label: 'Timestamp', value: 'date' },
    { label: 'Service', value: 'service' },
    { label: 'Duration', value: 'duration' },
    { label: 'Status', value: 'status' },
    { label: 'User', value: 'user' },
    { label: 'Tags', value: 'tags' },
];

export const Basic: Story = {
    render: () => (
        <div className="container mx-auto p-4">
            <DataTableInfinite
                columns={columns}
                data={logs}
                getRowId={(row) => row.uuid}
                totalRows={1000}
                filterRows={100}
                totalRowsFetched={100}
                filterFields={filterFields}
                fetchNextPage={fetchNextPage}
                fetchPreviousPage={fetchPreviousPage}
                refetch={refetch}
                meta={{}}
                className="h-[600px]"
            />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Basic usage of the DataTableInfinite component with filter controls and data.',
            },
        },
    },
};

export const WithChartData: Story = {
    render: () => (
        <div className="container mx-auto p-4">
            <DataTableInfinite
                columns={columns}
                data={logs}
                getRowId={(row) => row.uuid}
                totalRows={1000}
                filterRows={100}
                totalRowsFetched={100}
                filterFields={filterFields}
                fetchNextPage={fetchNextPage}
                fetchPreviousPage={fetchPreviousPage}
                refetch={refetch}
                chartData={generateChartData()}
                meta={{}}
                className="h-[600px]"
            />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'DataTableInfinite with chart data visualization.',
            },
        },
    },
};

export const WithSheetFields: Story = {
    render: () => (
        <div className="container mx-auto p-4">
            <DataTableInfinite
                columns={columns}
                data={logs}
                getRowId={(row) => row.uuid}
                totalRows={1000}
                filterRows={100}
                totalRowsFetched={100}
                filterFields={filterFields}
                sheetFields={sheetFields}
                fetchNextPage={fetchNextPage}
                fetchPreviousPage={fetchPreviousPage}
                refetch={refetch}
                meta={{}}
                className="h-[600px]"
            />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'DataTableInfinite with detail sheet fields for viewing record details.',
            },
        },
    },
};

export const LoadingState: Story = {
    render: () => (
        <div className="container mx-auto p-4">
            <DataTableInfinite
                columns={columns}
                data={[]}
                getRowId={(row) => row.uuid}
                totalRows={1000}
                filterRows={0}
                totalRowsFetched={0}
                filterFields={filterFields}
                fetchNextPage={fetchNextPage}
                fetchPreviousPage={fetchPreviousPage}
                refetch={refetch}
                isLoading={true}
                meta={{}}
                className="h-[600px]"
            />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'DataTableInfinite in a loading state.',
            },
        },
    },
};

export const WithCustomRowRendering: Story = {
    render: () => (
        <div className="container mx-auto p-4">
            <DataTableInfinite
                columns={columns}
                data={logs}
                getRowId={(row) => row.uuid}
                totalRows={1000}
                filterRows={100}
                totalRowsFetched={100}
                filterFields={filterFields}
                fetchNextPage={fetchNextPage}
                fetchPreviousPage={fetchPreviousPage}
                refetch={refetch}
                meta={{}}
                className="h-[600px]"
                getRowClassName={(row) => {
                    const level = row.original.level;
                    return level === 'error' ? 'bg-red-50' :
                        level === 'warn' ? 'bg-amber-50' : '';
                }}
                renderLiveRow={(props) => props && (
                    <div className="absolute left-0 w-1 h-full bg-blue-500" />
                )}
            />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'DataTableInfinite with custom row styling and live row indication.',
            },
        },
    },
}; 
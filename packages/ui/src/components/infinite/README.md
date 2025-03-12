# Infinite Components

This package provides a set of components for building infinite-scrolling data tables with advanced filtering, visualization, and data management capabilities.

## Overview

The Infinite components are designed to display large datasets with efficient loading, filtering, and visualization. The package includes:

- **Core components**: Client, useInfiniteQuery, schema, and constants
- **UI components**: DataTableInfinite and TimelineChart
- **Utility components**: Columns, search params, and query options

## Component Structure

```
infinite/
├── core/                    # Core functionality
│   ├── client.tsx           # Data fetching and state management
│   ├── constants.tsx        # Shared constants
│   ├── schema.ts            # TypeScript schemas
│   ├── useInfiniteQuery.tsx # Custom hook for infinite queries
│   └── index.ts             # Core exports
├── utils/                   # Utility functions
│   ├── queryOptions.ts      # Query options configuration
│   └── searchParams.ts      # Search parameter handling
├── DataTableInfinite.tsx    # Main infinite data table component
├── TimelineChart.tsx        # Timeline visualization component
├── columns.tsx              # Predefined column definitions
└── index.ts                 # Package exports
```

## Key Components

### InfiniteClient

The `InfiniteClient` component handles data fetching and state management for infinite data tables. It provides a unified interface for:

- Managing search parameters and filters
- Fetching data with pagination
- Processing and transforming API responses
- Providing faceted data for advanced filtering

```tsx
import { InfiniteClient } from '@/components/infinite/core/client';

// Basic usage
<InfiniteClient 
  initialSearchParams={{ size: 100 }}
  apiEndpoint="/api/logs" 
  defaultFilterFields={filterFields}
/>
```

### DataTableInfinite

The `DataTableInfinite` component is a powerful data table with infinite scrolling capabilities. It includes features for:

- Infinite scrolling with virtualization
- Advanced filtering and sorting
- Timeline visualization
- Row selection and detail views

```tsx
import { DataTableInfinite } from '@/components/infinite/DataTableInfinite';

// Basic usage
<DataTableInfinite
  columns={columns}
  data={data}
  getRowId={(row) => row.id}
  totalRows={1000}
  filterFields={filterFields}
  fetchNextPage={fetchNextPage}
  refetch={refetch}
  meta={{}}
/>
```

### TimelineChart

The `TimelineChart` component provides visualization for time-series data, helping users to understand patterns and trends in the dataset.

```tsx
import { TimelineChart } from '@/components/infinite/TimelineChart';

// Basic usage
<TimelineChart 
  data={chartData} 
  height="200px" 
  title="Log Activity"
/>
```

### Columns

The `columns` module provides pre-defined column definitions for common data types, with specialized cell renderers and formatting.

```tsx
import { columns } from '@/components/infinite/columns';

// Use all columns
const table = useReactTable({
  data,
  columns,
  // ...other options
});

// Or select specific columns
const selectedColumns = [
  columns.find(col => col.accessorKey === 'level'),
  columns.find(col => col.accessorKey === 'date'),
  columns.find(col => col.accessorKey === 'status'),
  // ...etc
].filter(Boolean);
```

## Migration Notes

These components were migrated from the `apps/web-filters` package as part of a centralized UI component library effort. The migration included:

1. Restructuring the file organization for better maintainability
2. Enhancing TypeScript typing and documentation
3. Standardizing the API for consistent usage
4. Adding Storybook documentation for all components

## Integration with DataTable V2

The Infinite components integrate with the DataTable V2 components, sharing common patterns for filtering, column definition, and state management. This provides a consistent experience when working with both standard and infinite data tables.

## Usage Examples

For detailed usage examples, refer to the Storybook documentation for each component:

- `InfiniteClient.stories.tsx`
- `DataTableInfinite.stories.tsx`
- `TimelineChart.stories.tsx`
- `columns.stories.tsx` 
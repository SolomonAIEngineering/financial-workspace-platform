# LLM Implementation Guide: Migrating Infinite and Data Table Components to UI Package

## Overview

This guide instructs an LLM to migrate components from the `@infinite` folder and create a new data table implementation in the `@ui` package based on the components from `/web-filters/src/components/data-table`, along with their Storybook definitions. The existing data table in the UI package will remain, and we'll create a new implementation with enhanced functionality that better aligns with project requirements.

## Component Analysis

### Source Components

1. **Infinite Components** (`/apps/web-filters/src/app/infinite/`):

   - query-options.ts
   - schema.ts
   - search-params.ts
   - timeline-chart.tsx
   - use-infinite-query.tsx
   - constants.tsx
   - data-table-infinite.tsx
   - layout.tsx
   - page.tsx
   - client.tsx
   - columns.tsx
   - Various folder structures (api/, blog/, \_components/, os/)

2. **Data Table Components** (`/apps/web-filters/src/components/data-table/`):
   - data-table-skeleton.tsx - Skeleton loading state for the data table
   - data-table-toolbar.tsx - Toolbar with search and filtering options
   - data-table-view-options.tsx - Options for customizing table view (columns, density)
   - types.ts - TypeScript interfaces and type definitions
   - utils.ts - Utility functions for data manipulation and filtering
   - data-table-reset-button.tsx - Button to reset all table filters and sorting
   - data-table-filter-controls-drawer.tsx - Drawer component for filter controls on mobile
   - data-table-filter-controls.tsx - Container for filter input components
   - data-table-filter-input.tsx - Text input filter component
   - data-table-filter-reset-button.tsx - Button to reset specific filters
   - data-table-filter-slider.tsx - Slider filter for numeric values
   - data-table-filter-timerange.tsx - Date/time range filter
   - data-table-pagination.tsx - Pagination controls
   - data-table-filter-checkbox.tsx - Checkbox filter for multiple selection
   - data-table-column-header.tsx - Sortable column header with indicators
   - data-table-provider.tsx - Context provider for table state
   - data-table-filter-command/ (directory) - Command menu for filtering
   - data-table-sheet/ (directory) - Sheet components for mobile views

### Destination Structure

**UI Package** (`/packages/ui/`):

- Already has a data-table implementation with similar components
- We will create a **new** implementation as `data-table-v2`
- Organized structure with component folders, utilities, types, etc.
- Storybook integration

## Implementation Steps

### Step 1: Setup Project Structure

1. Create the following folder structure in the UI package:

   ```
   /packages/ui/src/components/data-table-v2/
     /core/
     /columns/
     /filters/
     /pagination/
     index.ts

   /packages/ui/src/components/infinite/
     /core/
     /utils/
     index.ts
   ```

2. Create a migration tracking file to keep track of components being migrated.

### Step 2: Migrate Core Data Table Components

1. **Core Data Table Components**:

   - Start with the foundational components:
     - data-table-provider.tsx -> core/DataTableProvider.tsx
     - types.ts -> core/types.ts
     - utils.ts -> core/utils.ts
   - Ensure comprehensive JSDoc comments for all exported functions and types.
   - Add proper TypeScript typing.

2. **Example Core Component Migration**:

   ```tsx
   // Original: data-table-provider.tsx
   // Migrate to: /packages/ui/src/components/data-table-v2/core/DataTableProvider.tsx

   // Add proper imports, ensure types are correctly mapped
   // Ensure context is well-typed and documented
   // Add comprehensive JSDoc comments
   ```

### Step 3: Migrate UI Components

1. **UI Components**:

   - Migrate UI-focused components:
     - data-table-column-header.tsx -> columns/DataTableColumnHeader.tsx
     - data-table-pagination.tsx -> pagination/DataTablePagination.tsx
     - data-table-toolbar.tsx -> DataTableToolbar.tsx
     - data-table-view-options.tsx -> DataTableViewOptions.tsx
     - data-table-skeleton.tsx -> DataTableSkeleton.tsx
   - Update component interfaces to match UI package conventions.
   - Ensure styling consistency with UI design system.
   - Add comprehensive prop validation.
   - Implement accessibility features (ARIA attributes, keyboard navigation).

2. **Example UI Component Migration**:

   ```tsx
   // Original: data-table-column-header.tsx
   // Migrate to: /packages/ui/src/components/data-table-v2/columns/DataTableColumnHeader.tsx

   // Update imports to use UI package components
   // Ensure styling is consistent with UI package
   // Add ARIA attributes for accessibility
   // Add comprehensive prop validation
   ```

### Step 4: Migrate Filter Components

1. **Filter Components**:
   - Migrate filtering components to the filters directory:
     - data-table-filter-controls.tsx
     - data-table-filter-input.tsx
     - data-table-filter-checkbox.tsx
     - data-table-filter-slider.tsx
     - data-table-filter-timerange.tsx
     - data-table-filter-reset-button.tsx
     - data-table-filter-controls-drawer.tsx
     - data-table-filter-command/ (directory)
   - Ensure consistent behavior across filter types.
   - Document filter customization options.
   - Implement responsive behavior for mobile views.

### Step 5: Migrate Infinite Components

1. **Core Infinite Components**:

   - Migrate utility files first:
     - constants.tsx -> infinite/core/constants.tsx
     - schema.ts -> infinite/core/schema.ts
     - query-options.ts -> infinite/utils/queryOptions.ts
     - search-params.ts -> infinite/utils/searchParams.ts

2. **Query and Data Management**:

   - Migrate core data management components:
     - use-infinite-query.tsx -> infinite/core/useInfiniteQuery.tsx
     - client.tsx -> infinite/core/client.tsx
   - Update dependencies and imports.
   - Ensure proper error handling.
   - Add comprehensive type safety.

3. **UI Components**:
   - Migrate UI components:
     - data-table-infinite.tsx -> infinite/DataTableInfinite.tsx
     - timeline-chart.tsx -> infinite/TimelineChart.tsx
     - columns.tsx -> infinite/columns.tsx
   - Ensure proper integration with data-table-v2 components.
   - Implement responsive designs.
   - Add accessibility features.

### Step 6: Type and Utility Standardization

1. **Type System Review**:

   - Review all exported types and interfaces.
   - Standardize naming conventions.
   - Move shared types to /src/types/ if broadly applicable.
   - Ensure consistent property naming across components.
   - Add comprehensive JSDoc comments.

2. **Utility Optimization**:
   - Review all utility functions.
   - Identify opportunities for shared utilities.
   - Refactor for performance and bundle size.
   - Move general utilities to appropriate utility folders.
   - Document utility functions with examples.

### Step 7: Create Storybook Stories

1. **Data Table Component Stories**:

   - Create stories for each data table component with:
     - Basic usage
     - Advanced configuration
     - Theme variations
     - Responsive behavior
     - Error states
     - Loading states
   - Implement comprehensive controls for all props.

2. **Infinite Component Stories**:

   - Create stories for infinite components with:
     - Basic usage patterns
     - Integration with data tables
     - Custom configurations
     - Error handling examples
     - Performance optimization examples
   - Implement mock data services for demos.

3. **Story Documentation**:
   - Add comprehensive documentation to each story.
   - Create usage examples for common scenarios.
   - Document component composition patterns.
   - Add accessibility guidelines.
   - Include performance optimization tips.

### Step 8: Export Management

1. **Update Barrel Files**:

   - Create proper index.ts files that export all components.
   - Ensure proper tree-shaking support.
   - Implement export aliases for backward compatibility.
   - Example structure:

   ```tsx
   // /packages/ui/src/components/data-table-v2/index.ts
   export * from './core/DataTableProvider'
   export * from './columns/DataTableColumnHeader'
   // ... other exports

   // /packages/ui/src/components/infinite/index.ts
   export * from './core/useInfiniteQuery'
   export * from './DataTableInfinite'
   // ... other exports
   ```

2. **Update Main Package Exports**:

   - Update the main package exports to include the new components.
   - Example:

   ```tsx
   // /packages/ui/src/index.ts
   export * from './components/data-table-v2'
   export * from './components/infinite'
   ```

## Technical Guidelines

### Naming Conventions

1. **Component Naming**:

   - Use PascalCase for component files (e.g., `DataTableColumnHeader.tsx`)
   - Use camelCase for utility files (e.g., `sortUtils.ts`)
   - Use camelCase with `.types.ts` suffix for type files (e.g., `dataTable.types.ts`)

2. **Directory Structure**:
   ```
   /src/components/data-table-v2/
     /core/
       DataTableProvider.tsx
       DataTableContext.tsx
       types.ts
       utils.ts
     /columns/
       DataTableColumnHeader.tsx
       DataTableColumnResizer.tsx
     /filters/
       DataTableFilterControls.tsx
       DataTableFilterInput.tsx
       ...
     /pagination/
       DataTablePagination.tsx
     index.ts  # Main barrel file
   ```

### State Management

1. **Context Design**:

   - Use React Context for shared state.
   - Implement proper context splitting to prevent re-renders.
   - Use reducer pattern for complex state operations.
   - Provide hooks for common state operations.
   - Example:

   ```tsx
   // DataTableContext.tsx
   import { createContext, useContext, useReducer } from 'react';

   interface DataTableState {
     // State properties
   }

   type DataTableAction =
     | { type: 'SET_PAGE'; payload: number }
     | { type: 'SET_SORT'; payload: SortState }
     | // Other actions

   const reducer = (state: DataTableState, action: DataTableAction): DataTableState => {
     switch (action.type) {
       // Handle various actions
     }
   };

   const DataTableContext = createContext<{
     state: DataTableState;
     dispatch: React.Dispatch<DataTableAction>;
   } | undefined>(undefined);

   export const DataTableProvider = ({ children }) => {
     const [state, dispatch] = useReducer(reducer, initialState);
     return (
       <DataTableContext.Provider value={{ state, dispatch }}>
         {children}
       </DataTableContext.Provider>
     );
   };

   export const useDataTable = () => {
     const context = useContext(DataTableContext);
     if (!context) throw new Error('useDataTable must be used within a DataTableProvider');
     return context;
   };
   ```

2. **Performance Optimization**:

   - Implement virtualization for large datasets.
   - Use memoization for expensive computations.
   - Use `React.memo()` for pure components.
   - Implement proper dependency arrays for hooks.
   - Example:

   ```tsx
   const MemoizedComponent = React.memo(({ data }) => {
     // Render component
   })

   // In functional components
   const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b])
   const memoizedCallback = useCallback(() => doSomething(a, b), [a, b])
   ```

### Styling Approach

1. **CSS Implementation**:

   - Use Tailwind classes for styling.
   - Use CSS variables for theming.
   - Ensure dark mode support.
   - Example:

   ```tsx
   <div className="bg-background text-foreground dark:bg-dark-background dark:text-dark-foreground flex items-center p-4">
     {/* Component content */}
   </div>
   ```

2. **Responsive Design**:

   - Implement mobile-first approach.
   - Use responsive Tailwind classes.
   - Example:

   ```tsx
   <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
     {/* Responsive grid items */}
   </div>
   ```

### Accessibility

1. **ARIA Implementation**:

   - Implement proper ARIA roles and attributes.
   - Ensure keyboard navigation.
   - Example:

   ```tsx
   <button
     role="button"
     aria-label="Sort by name"
     aria-pressed={isSorted}
     onClick={handleSort}
     className="focus:ring-primary flex items-center focus:ring-2"
   >
     Sort
   </button>
   ```

## Example Migration Patterns

### Example 1: Data Table Provider Migration

```tsx
// Original (simplified)
// /apps/web-filters/src/components/data-table/data-table-provider.tsx
import React, { createContext, useContext, useReducer } from 'react'

type State = {
  // State properties
}

type Action = { type: string; payload: any }

const TableContext = createContext<
  { state: State; dispatch: React.Dispatch<Action> } | undefined
>(undefined)

export function DataTableProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <TableContext.Provider value={{ state, dispatch }}>
      {children}
    </TableContext.Provider>
  )
}

// Migrated Version
// /packages/ui/src/components/data-table-v2/core/DataTableProvider.tsx
import React, { createContext, useContext, useReducer } from 'react'
import type { DataTableState, DataTableAction } from './types'
import { dataTableReducer, initialDataTableState } from './reducer'

/**
 * Context for the DataTable state management
 * @internal
 */
const DataTableContext = createContext<
  | {
      state: DataTableState
      dispatch: React.Dispatch<DataTableAction>
    }
  | undefined
>(undefined)

/**
 * Provider component for DataTable state management
 * @param children - React children
 * @returns Provider component
 */
export function DataTableProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(dataTableReducer, initialDataTableState)

  return (
    <DataTableContext.Provider value={{ state, dispatch }}>
      {children}
    </DataTableContext.Provider>
  )
}

/**
 * Hook to access the DataTable context
 * @returns DataTable context value
 * @throws Error if used outside of a DataTableProvider
 */
export function useDataTable() {
  const context = useContext(DataTableContext)
  if (!context) {
    throw new Error('useDataTable must be used within a DataTableProvider')
  }
  return context
}
```

### Example 2: Column Header Migration

```tsx
// Original (simplified)
// /apps/web-filters/src/components/data-table/data-table-column-header.tsx
import { Button } from 'somewhere'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'some-icons'

interface DataTableColumnHeaderProps {
  column: any
  title: string
  className?: string
}

export function DataTableColumnHeader({
  column,
  title,
  className,
}: DataTableColumnHeaderProps) {
  // Implementation
  return (
    <Button variant="ghost" className={className}>
      {title}
      {column.getIsSorted() === 'desc' ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : column.getIsSorted() === 'asc' ? (
        <ArrowUp className="ml-2 h-4 w-4" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  )
}

// Migrated Version
// /packages/ui/src/components/data-table-v2/columns/DataTableColumnHeader.tsx
import { Button } from '@/components/button'
import { ArrowDown, ArrowUp, ArrowUpDown } from '@/components/icons'
import { cn } from '@/lib/utils'
import type { Column } from '@tanstack/react-table'

/**
 * Props for the DataTableColumnHeader component
 */
export interface DataTableColumnHeaderProps<TData, TValue> {
  /** The column to render the header for */
  column: Column<TData, TValue>
  /** The title to display in the header */
  title: string
  /** Optional additional className */
  className?: string
}

/**
 * Renders a sortable column header for the DataTable
 *
 * @param props - Component props
 * @returns React component
 */
export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn('flex items-center', className)}>{title}</div>
  }

  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting()}
      className={cn('flex items-center gap-2 p-2', className)}
      aria-label={`Sort by ${title}`}
    >
      {title}
      {column.getIsSorted() === 'desc' ? (
        <ArrowDown className="h-4 w-4" aria-hidden="true" />
      ) : column.getIsSorted() === 'asc' ? (
        <ArrowUp className="h-4 w-4" aria-hidden="true" />
      ) : (
        <ArrowUpDown className="h-4 w-4" aria-hidden="true" />
      )}
    </Button>
  )
}
```

## Storybook Story Example

```tsx
// /packages/ui/src/components/data-table-v2/DataTable.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { DataTable } from './DataTable'
import { DataTableColumnHeader } from './columns/DataTableColumnHeader'
// Import other components as needed

const meta: Meta<typeof DataTable> = {
  title: 'Components/DataTable/V2',
  component: DataTable,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DataTable>

// Mock data
const data = [
  // Sample data rows
]

// Column definitions
const columns = [
  // Column definitions
]

export const Default: Story = {
  args: {
    data,
    columns,
  },
}

export const WithPagination: Story = {
  args: {
    data,
    columns,
    pagination: true,
  },
}

export const WithFiltering: Story = {
  args: {
    data,
    columns,
    filtering: true,
  },
}

// Additional stories for different states and configurations
```

### Callback Support for User Interactions

1. **Core Callback Types**:

   - Define comprehensive callback interfaces:

   ```tsx
   // /packages/ui/src/components/data-table-v2/core/types.ts

   /**
    * Callback interface for row interaction events
    */
   export interface DataTableRowCallbacks<TData> {
     /** Called when a row is clicked */
     onRowClick?: (row: Row<TData>, event: React.MouseEvent) => void
     /** Called when a row is double-clicked */
     onRowDoubleClick?: (row: Row<TData>, event: React.MouseEvent) => void
     /** Called when mouse enters a row */
     onRowMouseEnter?: (row: Row<TData>, event: React.MouseEvent) => void
     /** Called when mouse leaves a row */
     onRowMouseLeave?: (row: Row<TData>, event: React.MouseEvent) => void
     /** Called when a row is selected via checkbox or other selection mechanism */
     onRowSelect?: (row: Row<TData>, isSelected: boolean) => void
     /** Called before a row is expanded */
     onRowExpandingChange?: (
       row: Row<TData>,
       isExpanding: boolean,
     ) => boolean | void
     /** Called after a row has been expanded/collapsed */
     onRowExpandedChange?: (row: Row<TData>, isExpanded: boolean) => void
     /** Called when a row's context menu is activated */
     onRowContextMenu?: (row: Row<TData>, event: React.MouseEvent) => void
   }

   /**
    * Callback interface for cell interaction events
    */
   export interface DataTableCellCallbacks<TData, TValue = unknown> {
     /** Called when a cell is clicked */
     onCellClick?: (cell: Cell<TData, TValue>, event: React.MouseEvent) => void
     /** Called when a cell is double-clicked */
     onCellDoubleClick?: (
       cell: Cell<TData, TValue>,
       event: React.MouseEvent,
     ) => void
     /** Called when a cell is being edited */
     onCellEdit?: (cell: Cell<TData, TValue>, newValue: TValue) => void
     /** Called when cell editing is completed */
     onCellEditComplete?: (cell: Cell<TData, TValue>, newValue: TValue) => void
     /** Called when cell editing is canceled */
     onCellEditCancel?: (cell: Cell<TData, TValue>) => void
   }

   /**
    * Callback interface for header interaction events
    */
   export interface DataTableHeaderCallbacks<TData, TValue = unknown> {
     /** Called when a column header is clicked */
     onHeaderClick?: (
       column: Column<TData, TValue>,
       event: React.MouseEvent,
     ) => void
     /** Called when a column's sort state changes */
     onSortingChange?: (sortingState: SortingState) => void
     /** Called when a column is resized */
     onColumnSizeChange?: (
       column: Column<TData, TValue>,
       newSize: number,
     ) => void
     /** Called when a column's visibility changes */
     onColumnVisibilityChange?: (columnId: string, isVisible: boolean) => void
     /** Called when columns are reordered */
     onColumnOrderChange?: (columnOrder: string[]) => void
   }

   /**
    * Callback interface for pagination events
    */
   export interface DataTablePaginationCallbacks {
     /** Called when the current page changes */
     onPageChange?: (page: number) => void
     /** Called when the page size changes */
     onPageSizeChange?: (pageSize: number) => void
   }

   /**
    * Callback interface for filtering events
    */
   export interface DataTableFilterCallbacks {
     /** Called when any filter value changes */
     onFilterChange?: (columnId: string, filterValue: any) => void
     /** Called when global filter value changes */
     onGlobalFilterChange?: (value: string) => void
     /** Called when all filters are reset */
     onFiltersReset?: () => void
   }

   /**
    * Callback interface for selection events
    */
   export interface DataTableSelectionCallbacks<TData> {
     /** Called when row selection changes */
     onSelectionChange?: (rows: Row<TData>[]) => void
     /** Called when all rows are selected/deselected */
     onSelectAllChange?: (isSelected: boolean) => void
   }

   /**
    * Combined callbacks interface for the DataTable component
    */
   export interface DataTableCallbacks<TData>
     extends DataTableRowCallbacks<TData>,
       DataTableHeaderCallbacks<TData>,
       DataTablePaginationCallbacks,
       DataTableFilterCallbacks,
       DataTableSelectionCallbacks<TData> {
     /** Called when data in the table is updated */
     onDataChange?: (data: TData[]) => void
     /** Called when the table state changes (includes sort, filter, pagination) */
     onStateChange?: (state: TableState) => void
     /** Called when an error occurs in the table */
     onError?: (error: Error) => void
     /** Called when a row action button is clicked */
     onAction?: (action: string, row: Row<TData>) => void
     /** Called when the table is fully loaded and rendered */
     onReady?: () => void
     /** Called when loading state changes */
     onLoadingChange?: (isLoading: boolean) => void
   }
   ```

2. **Context Enhancement**:

   - Update the DataTableContext to include callbacks:

   ```tsx
   // /packages/ui/src/components/data-table-v2/core/DataTableContext.tsx
   import { createContext, useContext, useReducer, useCallback } from 'react'
   import type {
     DataTableState,
     DataTableAction,
     DataTableCallbacks,
   } from './types'

   /**
    * Context for the DataTable state management
    * @internal
    */
   const DataTableContext = createContext<
     | {
         state: DataTableState
         dispatch: React.Dispatch<DataTableAction>
         callbacks: DataTableCallbacks<any> | undefined
       }
     | undefined
   >(undefined)

   /**
    * Provider component for DataTable state management
    * @param props - Provider props
    * @returns Provider component
    */
   export function DataTableProvider<TData>({
     children,
     initialState = {},
     callbacks,
   }: {
     children: React.ReactNode
     initialState?: Partial<DataTableState>
     callbacks?: DataTableCallbacks<TData>
   }) {
     const [state, dispatch] = useReducer(dataTableReducer, {
       ...initialDataTableState,
       ...initialState,
     })

     return (
       <DataTableContext.Provider value={{ state, dispatch, callbacks }}>
         {children}
       </DataTableContext.Provider>
     )
   }
   ```

3. **Callback Integration in Components**:

   - Update the row component to handle row-related callbacks:

   ```tsx
   // /packages/ui/src/components/data-table-v2/DataTableRow.tsx
   export function DataTableRow<TData>({
     row,
     ...props
   }: DataTableRowProps<TData>) {
     const { callbacks } = useDataTable()

     const handleClick = useCallback(
       (e: React.MouseEvent) => {
         callbacks?.onRowClick?.(row, e)
       },
       [callbacks, row],
     )

     const handleDoubleClick = useCallback(
       (e: React.MouseEvent) => {
         callbacks?.onRowDoubleClick?.(row, e)
       },
       [callbacks, row],
     )

     const handleMouseEnter = useCallback(
       (e: React.MouseEvent) => {
         callbacks?.onRowMouseEnter?.(row, e)
       },
       [callbacks, row],
     )

     const handleMouseLeave = useCallback(
       (e: React.MouseEvent) => {
         callbacks?.onRowMouseLeave?.(row, e)
       },
       [callbacks, row],
     )

     const handleContextMenu = useCallback(
       (e: React.MouseEvent) => {
         callbacks?.onRowContextMenu?.(row, e)
       },
       [callbacks, row],
     )

     const handleExpandedChange = useCallback(
       (isExpanded: boolean) => {
         callbacks?.onRowExpandedChange?.(row, isExpanded)
       },
       [callbacks, row],
     )

     return (
       <TableRow
         data-row-id={row.id}
         onClick={handleClick}
         onDoubleClick={handleDoubleClick}
         onMouseEnter={handleMouseEnter}
         onMouseLeave={handleMouseLeave}
         onContextMenu={handleContextMenu}
         {...props}
       >
         {/* Row content */}
       </TableRow>
     )
   }
   ```

4. **Selection Integration**:

   ```tsx
   // /packages/ui/src/components/data-table-v2/DataTableSelection.tsx
   export function DataTableSelectionCell<TData>({
     row,
     ...props
   }: DataTableSelectionCellProps<TData>) {
     const { callbacks } = useDataTable()

     const handleSelectionChange = useCallback(
       (e: React.ChangeEvent<HTMLInputElement>) => {
         const isSelected = e.target.checked
         row.toggleSelected(isSelected)
         callbacks?.onRowSelect?.(row, isSelected)
       },
       [callbacks, row],
     )

     return (
       <TableCell className="w-[50px]">
         <Checkbox
           checked={row.getIsSelected()}
           onChange={handleSelectionChange}
           aria-label={`Select row ${row.id}`}
         />
       </TableCell>
     )
   }
   ```

5. **Pagination Component Enhancement**:

   ```tsx
   // /packages/ui/src/components/data-table-v2/pagination/DataTablePagination.tsx
   export function DataTablePagination({
     table,
     ...props
   }: DataTablePaginationProps) {
     const { callbacks } = useDataTable()

     const handlePageChange = useCallback(
       (page: number) => {
         table.setPageIndex(page - 1)
         callbacks?.onPageChange?.(page)
       },
       [callbacks, table],
     )

     const handlePageSizeChange = useCallback(
       (e: React.ChangeEvent<HTMLSelectElement>) => {
         const size = Number(e.target.value)
         table.setPageSize(size)
         callbacks?.onPageSizeChange?.(size)
       },
       [callbacks, table],
     )

     // Implementation...
   }
   ```

6. **Column Header with Callback Integration**:

   ```tsx
   // /packages/ui/src/components/data-table-v2/columns/DataTableColumnHeader.tsx
   export function DataTableColumnHeader<TData, TValue>({
     column,
     title,
     className,
   }: DataTableColumnHeaderProps<TData, TValue>) {
     const { callbacks } = useDataTable()

     const handleClick = useCallback(
       (e: React.MouseEvent) => {
         callbacks?.onHeaderClick?.(column, e)

         if (column.getCanSort()) {
           const oldSortDirection = column.getIsSorted()
           column.toggleSorting()

           const newSortingState = column.getParentTable().getState().sorting
           callbacks?.onSortingChange?.(newSortingState)
         }
       },
       [callbacks, column],
     )

     // Implementation...
   }
   ```

7. **Main DataTable Component with Callbacks**:

   ```tsx
   // /packages/ui/src/components/data-table-v2/DataTable.tsx
   export interface DataTableProps<TData> {
     data: TData[]
     columns: ColumnDef<TData>[]

     // Other standard props like pagination, filtering, etc.

     // Callback props
     onRowClick?: (row: Row<TData>, event: React.MouseEvent) => void
     onRowDoubleClick?: (row: Row<TData>, event: React.MouseEvent) => void
     onRowMouseEnter?: (row: Row<TData>, event: React.MouseEvent) => void
     onRowMouseLeave?: (row: Row<TData>, event: React.MouseEvent) => void
     onRowSelect?: (row: Row<TData>, isSelected: boolean) => void
     onRowExpandedChange?: (row: Row<TData>, isExpanded: boolean) => void
     onRowContextMenu?: (row: Row<TData>, event: React.MouseEvent) => void
     onHeaderClick?: (
       column: Column<TData, unknown>,
       event: React.MouseEvent,
     ) => void
     onSortingChange?: (sortingState: SortingState) => void
     onColumnSizeChange?: (
       column: Column<TData, unknown>,
       newSize: number,
     ) => void
     onColumnVisibilityChange?: (columnId: string, isVisible: boolean) => void
     onColumnOrderChange?: (columnOrder: string[]) => void
     onPageChange?: (page: number) => void
     onPageSizeChange?: (pageSize: number) => void
     onFilterChange?: (columnId: string, filterValue: any) => void
     onGlobalFilterChange?: (value: string) => void
     onFiltersReset?: () => void
     onSelectionChange?: (rows: Row<TData>[]) => void
     onSelectAllChange?: (isSelected: boolean) => void
     onDataChange?: (data: TData[]) => void
     onStateChange?: (state: TableState) => void
     onError?: (error: Error) => void
     onAction?: (action: string, row: Row<TData>) => void
     onReady?: () => void
     onLoadingChange?: (isLoading: boolean) => void
   }

   export function DataTable<TData>({
     data,
     columns,
     // Extract all callbacks
     onRowClick,
     onRowDoubleClick,
     onRowMouseEnter,
     onRowMouseLeave,
     onRowSelect,
     onRowExpandedChange,
     onRowContextMenu,
     onHeaderClick,
     onSortingChange,
     onColumnSizeChange,
     onColumnVisibilityChange,
     onColumnOrderChange,
     onPageChange,
     onPageSizeChange,
     onFilterChange,
     onGlobalFilterChange,
     onFiltersReset,
     onSelectionChange,
     onSelectAllChange,
     onStateChange,
     onAction,
     onReady,
   }: DataTableProps<TData>) {
     // Group all callbacks
     const callbacks: DataTableCallbacks<TData> = {
       onRowClick,
       onRowDoubleClick,
       onRowMouseEnter,
       onRowMouseLeave,
       onRowSelect,
       onRowExpandedChange,
       onRowContextMenu,
       onHeaderClick,
       onSortingChange,
       onColumnSizeChange,
       onColumnVisibilityChange,
       onColumnOrderChange,
       onPageChange,
       onPageSizeChange,
       onFilterChange,
       onGlobalFilterChange,
       onFiltersReset,
       onSelectionChange,
       onSelectAllChange,
       onStateChange,
       onAction,
       onReady,
     }

     // Create the table instance
     const table = useReactTable({
       data,
       columns,
       getCoreRowModel: getCoreRowModel(),
       onStateChange: (updater) => {
         // Call the onStateChange callback when state changes
         const newState =
           typeof updater === 'function' ? updater(table.getState()) : updater
         callbacks.onStateChange?.(newState)
       },
     })

     // Handle row click events
     const handleRowClick = (row: Row<TData>, event: React.MouseEvent) => {
       callbacks.onRowClick?.(row, event)
     }

     // Handle row double-click events
     const handleRowDoubleClick = (
       row: Row<TData>,
       event: React.MouseEvent,
     ) => {
       callbacks.onRowDoubleClick?.(row, event)
     }

     // Call onReady when component is mounted
     useEffect(() => {
       callbacks.onReady?.()
     }, [])

     return (
       <DataTableProvider callbacks={callbacks}>
         {/* Table implementation */}
       </DataTableProvider>
     )
   }
   ```

## Storybook Story Example for Callbacks

```tsx
// /packages/ui/src/components/data-table-v2/DataTable.stories.tsx
// ... existing story code ...

export const WithCallbacks: Story = {
  args: {
    data,
    columns,
    onRowClick: (row, event) => {
      console.log('Row clicked:', row.id, event)
    },
    onRowDoubleClick: (row, event) => {
      console.log('Row double-clicked:', row.id, event)
    },
    onSortingChange: (sortingState) => {
      console.log('Sorting changed:', sortingState)
    },
    onPageChange: (page) => {
      console.log('Page changed:', page)
    },
    onFilterChange: (columnId, filterValue) => {
      console.log('Filter changed:', columnId, filterValue)
    },
    onSelectionChange: (rows) => {
      console.log(
        'Selection changed:',
        rows.map((row) => row.id),
      )
    },
    onAction: (action, row) => {
      console.log('Action triggered:', action, 'on row:', row.id)
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'This example demonstrates how to use callbacks to respond to user interactions with the data table.',
      },
    },
  },
}

export const WithRowActions: Story = {
  args: {
    data,
    columns: [
      ...columns,
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                row.getParentTable().options.meta?.onAction?.('edit', row)
              }}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                row.getParentTable().options.meta?.onAction?.('delete', row)
              }}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    onAction: (action, row) => {
      alert(`Action ${action} triggered on row ${row.id}`)
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'This example shows how to add action buttons to rows that trigger the onAction callback.',
      },
    },
  },
}
```

## Example Migrated Component with Callbacks

### Example 3: Data Table Component with Callbacks

```tsx
// /packages/ui/src/components/data-table-v2/DataTable.tsx
import React, { useEffect } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  type TableState,
  type Row,
  type SortingState,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from './pagination/DataTablePagination'
import { DataTableToolbar } from './DataTableToolbar'
import { DataTableProvider } from './core/DataTableProvider'
import type { DataTableCallbacks } from './core/types'

export interface DataTableProps<TData> {
  /**
   * The data to display in the table
   */
  data: TData[]

  /**
   * The column definitions for the table
   */
  columns: ColumnDef<TData, any>[]

  /**
   * Whether to enable pagination
   * @default true
   */
  pagination?: boolean

  /**
   * Whether to enable sorting
   * @default true
   */
  sorting?: boolean

  /**
   * Whether to enable filtering
   * @default true
   */
  filtering?: boolean

  /**
   * Whether to show the toolbar
   * @default true
   */
  showToolbar?: boolean

  /**
   * Row callbacks
   */
  onRowClick?: (row: Row<TData>, event: React.MouseEvent) => void
  onRowDoubleClick?: (row: Row<TData>, event: React.MouseEvent) => void
  onRowSelect?: (row: Row<TData>, isSelected: boolean) => void
  onRowExpandedChange?: (row: Row<TData>, isExpanded: boolean) => void

  /**
   * Header callbacks
   */
  onSortingChange?: (sortingState: SortingState) => void
  onColumnVisibilityChange?: (columnId: string, isVisible: boolean) => void

  /**
   * Pagination callbacks
   */
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void

  /**
   * Filter callbacks
   */
  onFilterChange?: (columnId: string, filterValue: any) => void
  onGlobalFilterChange?: (value: string) => void
  onFiltersReset?: () => void

  /**
   * Selection callbacks
   */
  onSelectionChange?: (rows: Row<TData>[]) => void
  onSelectAllChange?: (isSelected: boolean) => void

  /**
   * Other callbacks
   */
  onStateChange?: (state: TableState) => void
  onAction?: (action: string, row: Row<TData>) => void
  onReady?: () => void
}

export function DataTable<TData>({
  data,
  columns,
  pagination = true,
  sorting = true,
  filtering = true,
  showToolbar = true,
  // Extract all callbacks
  onRowClick,
  onRowDoubleClick,
  onRowSelect,
  onRowExpandedChange,
  onSortingChange,
  onColumnVisibilityChange,
  onPageChange,
  onPageSizeChange,
  onFilterChange,
  onGlobalFilterChange,
  onFiltersReset,
  onSelectionChange,
  onSelectAllChange,
  onStateChange,
  onAction,
  onReady,
}: DataTableProps<TData>) {
  // Group all callbacks
  const callbacks: DataTableCallbacks<TData> = {
    onRowClick,
    onRowDoubleClick,
    onRowSelect,
    onRowExpandedChange,
    onSortingChange,
    onColumnVisibilityChange,
    onPageChange,
    onPageSizeChange,
    onFilterChange,
    onGlobalFilterChange,
    onFiltersReset,
    onSelectionChange,
    onSelectAllChange,
    onStateChange,
    onAction,
    onReady,
  }

  // Create the table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(pagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    ...(sorting ? { getSortedRowModel: getSortedRowModel() } : {}),
    ...(filtering ? { getFilteredRowModel: getFilteredRowModel() } : {}),
    meta: {
      onAction: callbacks.onAction,
    },
    onStateChange: (updater) => {
      // Call the onStateChange callback when state changes
      const newState =
        typeof updater === 'function' ? updater(table.getState()) : updater
      callbacks.onStateChange?.(newState)
    },
  })

  // Handle row click events
  const handleRowClick = (row: Row<TData>, event: React.MouseEvent) => {
    callbacks.onRowClick?.(row, event)
  }

  // Handle row double-click events
  const handleRowDoubleClick = (row: Row<TData>, event: React.MouseEvent) => {
    callbacks.onRowDoubleClick?.(row, event)
  }

  // Call onReady when component is mounted
  useEffect(() => {
    callbacks.onReady?.()
  }, [])

  return (
    <DataTableProvider callbacks={callbacks}>
      <div className="space-y-4">
        {showToolbar && <DataTableToolbar table={table} />}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? 'selected' : undefined}
                    onClick={(e) => handleRowClick(row, e)}
                    onDoubleClick={(e) => handleRowDoubleClick(row, e)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {pagination && <DataTablePagination table={table} />}
      </div>
    </DataTableProvider>
  )
}
```

## Conclusion

This guide provides detailed instructions on migrating the infinite and data table components to the UI package. Follow these steps systematically to create a new data table implementation in the UI package that leverages the enhanced functionality from the web-filters implementation. The new components will improve developer experience, performance, and maintain good practices for accessibility and responsiveness.

When implementing, ensure you:

1. Maintain consistent naming conventions
2. Follow the UI package's styling patterns
3. Implement proper accessibility features
4. Document all components and their usage
5. Create comprehensive Storybook examples
6. **Provide extensive callback hooks for all user interactions**
7. **Document callback usage patterns and expected behavior**
8. **Ensure callbacks are properly typed and consistent across components**
9. **Implement callback examples in Storybook for demonstration**

The result will be a well-structured, reusable set of components that enhance the UI package's capabilities while maintaining compatibility with existing applications and providing comprehensive callback support for user interactions.

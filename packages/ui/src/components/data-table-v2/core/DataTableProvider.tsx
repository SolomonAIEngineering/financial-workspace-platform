import type {
    ColumnDef,
    ColumnFiltersState,
    PaginationState,
    RowSelectionState,
    SortingState,
    Table,
    VisibilityState,
} from "@tanstack/react-table";
import type { DataTableAction, DataTableState } from "./types";
import React, { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import { dataTableReducer, initialDataTableState } from "./reducer";

import type { DataTableCallbacks } from "./types";
import type { DataTableFilterField } from "./types";

/**
 * Context type for DataTable base properties and functions
 * @template TData - The data type for the table
 * @template TValue - The value type for the table cells
 */
interface DataTableBaseContextType<TData = unknown, TValue = unknown> {
    /**
     * The TanStack Table instance
     */
    table?: Table<TData>;

    /**
     * Filter field definitions
     */
    filterFields: DataTableFilterField<TData>[];

    /**
     * Column definitions
     */
    columns: ColumnDef<TData, TValue>[];

    /**
     * Whether the table is in a loading state
     */
    isLoading?: boolean;

    /**
     * Gets faceted unique values for a column
     */
    getFacetedUniqueValues?: (
        table: Table<TData>,
        columnId: string,
    ) => Map<string, number>;

    /**
     * Gets faceted min/max values for a column
     */
    getFacetedMinMaxValues?: (
        table: Table<TData>,
        columnId: string,
    ) => undefined | [number, number];

    /**
     * State object for the table
     */
    state: DataTableState;

    /**
     * Dispatch function for updating table state
     */
    dispatch: React.Dispatch<DataTableAction>;

    /**
     * Callbacks for table events
     */
    callbacks?: DataTableCallbacks<TData>;
}

/**
 * Context for DataTable state and functionality
 */
const DataTableContext = createContext<DataTableBaseContextType<any, any> | null>(null);

/**
 * Provider properties
 * @template TData - The data type for the table
 * @template TValue - The value type for the table cells
 */
export interface DataTableProviderProps<TData = unknown, TValue = unknown> {
    /**
     * The child components
     */
    children: React.ReactNode;

    /**
     * The TanStack Table instance
     */
    table?: Table<TData>;

    /**
     * Column definitions
     */
    columns?: ColumnDef<TData, TValue>[];

    /**
     * Filter field definitions
     */
    filterFields?: DataTableFilterField<TData>[];

    /**
     * Whether the table is in a loading state
     */
    isLoading?: boolean;

    /**
     * Get faceted unique values for a column
     */
    getFacetedUniqueValues?: (
        table: Table<TData>,
        columnId: string,
    ) => Map<string, number>;

    /**
     * Get faceted min/max values for a column
     */
    getFacetedMinMaxValues?: (
        table: Table<TData>,
        columnId: string,
    ) => undefined | [number, number];

    /**
     * Initial state for the DataTable
     */
    initialState?: Partial<DataTableState>;

    /**
     * Callbacks for table events
     */
    callbacks?: DataTableCallbacks<TData>;

    /**
     * Current column filters
     */
    columnFilters?: ColumnFiltersState;

    /**
     * Current sorting state
     */
    sorting?: SortingState;

    /**
     * Current row selection state
     */
    rowSelection?: RowSelectionState;

    /**
     * Current column order
     */
    columnOrder?: string[];

    /**
     * Current column visibility state
     */
    columnVisibility?: VisibilityState;

    /**
     * Current pagination state
     */
    pagination?: PaginationState;
}

/**
 * Provider component for DataTable state management
 * 
 * @template TData - The data type for the table
 * @template TValue - The value type for the table cells
 * @param {DataTableProviderProps<TData, TValue>} props - Provider props
 * @returns Provider component
 */
export function DataTableProvider<TData = unknown, TValue = unknown>({
    children,
    table,
    columns = [],
    filterFields = [],
    isLoading,
    getFacetedUniqueValues,
    getFacetedMinMaxValues,
    initialState,
    callbacks,
    columnFilters,
    sorting,
    rowSelection,
    columnOrder,
    columnVisibility,
    pagination,
}: DataTableProviderProps<TData, TValue>) {
    // Initialize state with any provided overrides
    const [state, dispatch] = useReducer(
        dataTableReducer,
        {
            ...initialDataTableState,
            ...initialState,
            // Override with external controlled state if provided
            ...(columnFilters && { columnFilters: columnFilters }),
            ...(sorting && { sorting }),
            ...(columnVisibility && { columnVisibility }),
            ...(pagination && {
                pageIndex: pagination.pageIndex,
                pageSize: pagination.pageSize
            }),
        }
    );

    /**
     * Update state from external controlled props when they change
     */
    React.useEffect(() => {
        if (columnFilters) {
            dispatch({ type: 'SET_COLUMN_FILTERS', payload: columnFilters });
        }
    }, [columnFilters]);

    React.useEffect(() => {
        if (sorting) {
            dispatch({ type: 'SET_SORTING', payload: sorting });
        }
    }, [sorting]);

    React.useEffect(() => {
        if (columnVisibility) {
            dispatch({ type: 'SET_COLUMN_VISIBILITY', payload: columnVisibility });
        }
    }, [columnVisibility]);

    React.useEffect(() => {
        if (pagination) {
            dispatch({ type: 'SET_PAGE_INDEX', payload: pagination.pageIndex });
            dispatch({ type: 'SET_PAGE_SIZE', payload: pagination.pageSize });
        }
    }, [pagination?.pageIndex, pagination?.pageSize]);

    // Create context value
    const value = useMemo(
        () => ({
            table,
            columns,
            filterFields,
            isLoading,
            getFacetedUniqueValues,
            getFacetedMinMaxValues,
            state,
            dispatch,
            callbacks,
        }),
        [
            table,
            columns,
            filterFields,
            isLoading,
            getFacetedUniqueValues,
            getFacetedMinMaxValues,
            state,
            callbacks,
        ]
    );

    return (
        <DataTableContext.Provider value={value}>
            {children}
        </DataTableContext.Provider>
    );
}

/**
 * Hook to access the DataTable context
 * 
 * @template TData - The data type for the table
 * @template TValue - The value type for the table cells
 * @returns The DataTable context value
 * @throws Error if used outside of a DataTableProvider
 */
export function useDataTable<TData = unknown, TValue = unknown>() {
    const context = useContext(DataTableContext);

    if (!context) {
        throw new Error("useDataTable must be used within a DataTableProvider");
    }

    return context as DataTableBaseContextType<TData, TValue>;
}

/**
 * Hook to access only the callbacks from the DataTable context
 * 
 * @template TData - The data type for the table
 * @returns The DataTable callbacks object
 * @throws Error if used outside of a DataTableProvider
 */
export function useDataTableCallbacks<TData = unknown>() {
    const { callbacks } = useDataTable<TData>();
    return callbacks as DataTableCallbacks<TData> | undefined;
} 
import type { Cell, Column, Row, SortingState, TableState } from "@tanstack/react-table";

import type { JSX } from "react";

/**
 * Search parameters object type
 * @typedef {Object} SearchParams
 */
export type SearchParams = {
    /**
     * Key-value pairs for search parameters
     */
    [key: string]: string | string[] | undefined;
};

/**
 * Date preset configuration for timerange filters
 * @typedef {Object} DatePreset
 */
export type DatePreset = {
    /**
     * Display label for the preset
     */
    label: string;
    /**
     * Start date for the preset
     */
    from: Date;
    /**
     * End date for the preset
     */
    to: Date;
    /**
     * Keyboard shortcut for the preset
     */
    shortcut: string;
};

/**
 * Option for filter selects, checkboxes, etc.
 * @typedef {Object} Option
 */
export type Option = {
    /**
     * Display label for the option
     */
    label: string;
    /**
     * Value for the option - can be various types
     */
    value: string | boolean | number | undefined;
};

/**
 * Input filter type
 * @typedef {Object} Input
 */
export type Input = {
    /**
     * Type identifier for input filters
     */
    type: "input";
    /**
     * Optional predefined options for the input
     */
    options?: Option[];
};

/**
 * Checkbox filter type
 * @typedef {Object} Checkbox
 */
export type Checkbox = {
    /**
     * Type identifier for checkbox filters
     */
    type: "checkbox";
    /**
     * Optional custom component to render option
     */
    component?: (props: Option) => JSX.Element | null;
    /**
     * Options for the checkbox filter
     */
    options?: Option[];
};

/**
 * Slider filter type
 * @typedef {Object} Slider
 */
export type Slider = {
    /**
     * Type identifier for slider filters
     */
    type: "slider";
    /**
     * Minimum value for the slider
     */
    min: number;
    /**
     * Maximum value for the slider
     */
    max: number;
    /**
     * If options is undefined, all steps between min and max will be provided
     */
    options?: Option[];
};

/**
 * Timerange filter type
 * @typedef {Object} Timerange
 */
export type Timerange = {
    /**
     * Type identifier for timerange filters
     */
    type: "timerange";
    /**
     * Options for the timerange filter
     */
    options?: Option[];
    /**
     * Predefined date presets for quick selection
     */
    presets?: DatePreset[];
};

/**
 * Base properties for all filter fields
 * @typedef {Object} Base
 * @template TData - The data type for the table
 */
export type Base<TData> = {
    /**
     * Display label for the filter
     */
    label: string;
    /**
     * Data field that this filter operates on
     */
    value: keyof TData;
    /**
     * Defines if the accordion in the filter bar is open by default
     */
    defaultOpen?: boolean;
    /**
     * Defines if the command input is disabled for this field
     */
    commandDisabled?: boolean;
};

/**
 * Checkbox filter field configuration
 * @typedef {Object} DataTableCheckboxFilterField
 * @template TData - The data type for the table
 */
export type DataTableCheckboxFilterField<TData> = Base<TData> & Checkbox;

/**
 * Slider filter field configuration
 * @typedef {Object} DataTableSliderFilterField
 * @template TData - The data type for the table
 */
export type DataTableSliderFilterField<TData> = Base<TData> & Slider;

/**
 * Input filter field configuration
 * @typedef {Object} DataTableInputFilterField
 * @template TData - The data type for the table
 */
export type DataTableInputFilterField<TData> = Base<TData> & Input;

/**
 * Timerange filter field configuration
 * @typedef {Object} DataTableTimerangeFilterField
 * @template TData - The data type for the table
 */
export type DataTableTimerangeFilterField<TData> = Base<TData> & Timerange;

/**
 * Union type for all filter field configurations
 * @typedef {Object} DataTableFilterField
 * @template TData - The data type for the table
 */
export type DataTableFilterField<TData> =
    | DataTableCheckboxFilterField<TData>
    | DataTableSliderFilterField<TData>
    | DataTableInputFilterField<TData>
    | DataTableTimerangeFilterField<TData>;

/**
 * Sheet field configuration for detail views
 * @typedef {Object} SheetField
 * @template TData - The data type for the table
 * @template TMeta - Additional metadata type
 */
export type SheetField<TData, TMeta = Record<string, unknown>> = {
    /**
     * ID of the field in the data
     */
    id: keyof TData;
    /**
     * Display label for the field
     */
    label: string;
    /**
     * Type of the field
     * - readonly: Display only, not editable
     * - input: Standard text input
     * - checkbox: Boolean checkbox
     * - slider: Numeric slider
     * - timerange: Date/time range selector
     */
    type: "readonly" | "input" | "checkbox" | "slider" | "timerange";
    /**
     * Optional custom component to render the field
     * @param props - The data row and optional metadata
     */
    component?: (
        props: TData & {
            metadata?: {
                totalRows: number;
                filterRows: number;
                totalRowsFetched: number;
            } & TMeta;
        },
    ) => JSX.Element | null | string;
    /**
     * Optional condition function to determine if the field should be displayed
     * @param props - The data row
     */
    condition?: (props: TData) => boolean;
    /**
     * Optional CSS class name for the field
     */
    className?: string;
    /**
     * Optional CSS class name for the field skeleton (loading state)
     */
    skeletonClassName?: string;
};

/**
 * DataTable state interface
 * @interface DataTableState
 */
export interface DataTableState {
    /**
     * Current sorting state of the table
     */
    sorting?: SortingState;
    /**
     * Current global filter value
     */
    globalFilter?: string;
    /**
     * Column-specific filter values
     */
    columnFilters?: Record<string, any>;
    /**
     * Current page index (0-based)
     */
    pageIndex?: number;
    /**
     * Number of rows per page
     */
    pageSize?: number;
    /**
     * Column visibility state
     */
    columnVisibility?: Record<string, boolean>;
    /**
     * Selected row IDs
     */
    selectedRowIds?: Record<string, boolean>;
    /**
     * Table density setting (compact, default, relaxed)
     */
    density?: 'compact' | 'default' | 'relaxed';
}

/**
 * DataTable action types for reducer
 * @typedef {Object} DataTableAction
 */
export type DataTableAction =
    | { type: 'SET_SORTING'; payload: SortingState }
    | { type: 'SET_GLOBAL_FILTER'; payload: string }
    | { type: 'SET_COLUMN_FILTER'; payload: { columnId: string; value: any } }
    | { type: 'SET_COLUMN_FILTERS'; payload: Record<string, any> }
    | { type: 'RESET_COLUMN_FILTER'; payload: string }
    | { type: 'RESET_ALL_FILTERS' }
    | { type: 'SET_PAGE_INDEX'; payload: number }
    | { type: 'SET_PAGE_SIZE'; payload: number }
    | { type: 'SET_COLUMN_VISIBILITY'; payload: Record<string, boolean> }
    | { type: 'SET_SELECTED_ROWS'; payload: Record<string, boolean> }
    | { type: 'SET_DENSITY'; payload: 'compact' | 'default' | 'relaxed' };

/**
 * Callback interface for row interaction events
 * @interface DataTableRowCallbacks
 * @template TData - The data type for the table
 */
export interface DataTableRowCallbacks<TData> {
    /** Called when a row is clicked */
    onRowClick?: (row: Row<TData>, event: React.MouseEvent) => void;
    /** Called when a row is double-clicked */
    onRowDoubleClick?: (row: Row<TData>, event: React.MouseEvent) => void;
    /** Called when mouse enters a row */
    onRowMouseEnter?: (row: Row<TData>, event: React.MouseEvent) => void;
    /** Called when mouse leaves a row */
    onRowMouseLeave?: (row: Row<TData>, event: React.MouseEvent) => void;
    /** Called when a row is selected via checkbox or other selection mechanism */
    onRowSelect?: (row: Row<TData>, isSelected: boolean) => void;
    /** Called before a row is expanded */
    onRowExpandingChange?: (row: Row<TData>, isExpanding: boolean) => boolean | void;
    /** Called after a row has been expanded/collapsed */
    onRowExpandedChange?: (row: Row<TData>, isExpanded: boolean) => void;
    /** Called when a row's context menu is activated */
    onRowContextMenu?: (row: Row<TData>, event: React.MouseEvent) => void;
}

/**
 * Callback interface for cell interaction events
 * @interface DataTableCellCallbacks
 * @template TData - The data type for the table
 * @template TValue - The value type for the cell
 */
export interface DataTableCellCallbacks<TData, TValue = unknown> {
    /** Called when a cell is clicked */
    onCellClick?: (cell: Cell<TData, TValue>, event: React.MouseEvent) => void;
    /** Called when a cell is double-clicked */
    onCellDoubleClick?: (cell: Cell<TData, TValue>, event: React.MouseEvent) => void;
    /** Called when a cell is being edited */
    onCellEdit?: (cell: Cell<TData, TValue>, newValue: TValue) => void;
    /** Called when cell editing is completed */
    onCellEditComplete?: (cell: Cell<TData, TValue>, newValue: TValue) => void;
    /** Called when cell editing is canceled */
    onCellEditCancel?: (cell: Cell<TData, TValue>) => void;
}

/**
 * Callback interface for header interaction events
 * @interface DataTableHeaderCallbacks
 * @template TData - The data type for the table
 * @template TValue - The value type for the column
 */
export interface DataTableHeaderCallbacks<TData, TValue = unknown> {
    /** Called when a column header is clicked */
    onHeaderClick?: (column: Column<TData, TValue>, event: React.MouseEvent) => void;
    /** Called when a column's sort state changes */
    onSortingChange?: (sortingState: SortingState) => void;
    /** Called when a column is resized */
    onColumnSizeChange?: (column: Column<TData, TValue>, newSize: number) => void;
    /** Called when a column's visibility changes */
    onColumnVisibilityChange?: (columnId: string, isVisible: boolean) => void;
    /** Called when columns are reordered */
    onColumnOrderChange?: (columnOrder: string[]) => void;
}

/**
 * Callback interface for pagination events
 * @interface DataTablePaginationCallbacks
 */
export interface DataTablePaginationCallbacks {
    /** Called when the current page changes */
    onPageChange?: (page: number) => void;
    /** Called when the page size changes */
    onPageSizeChange?: (pageSize: number) => void;
}

/**
 * Callback interface for filtering events
 * @interface DataTableFilterCallbacks
 */
export interface DataTableFilterCallbacks {
    /** Called when any filter value changes */
    onFilterChange?: (columnId: string, filterValue: any) => void;
    /** Called when global filter value changes */
    onGlobalFilterChange?: (value: string) => void;
    /** Called when all filters are reset */
    onFiltersReset?: () => void;
}

/**
 * Callback interface for selection events
 * @interface DataTableSelectionCallbacks
 * @template TData - The data type for the table
 */
export interface DataTableSelectionCallbacks<TData> {
    /** Called when row selection changes */
    onSelectionChange?: (rows: Row<TData>[]) => void;
    /** Called when all rows are selected/deselected */
    onSelectAllChange?: (isSelected: boolean) => void;
}

/**
 * Combined callbacks interface for the DataTable component
 * @interface DataTableCallbacks
 * @template TData - The data type for the table
 */
export interface DataTableCallbacks<TData> extends
    DataTableRowCallbacks<TData>,
    DataTableHeaderCallbacks<TData>,
    DataTablePaginationCallbacks,
    DataTableFilterCallbacks,
    DataTableSelectionCallbacks<TData> {
    /** Called when data in the table is updated */
    onDataChange?: (data: TData[]) => void;
    /** Called when the table state changes (includes sort, filter, pagination) */
    onStateChange?: (state: TableState) => void;
    /** Called when an error occurs in the table */
    onError?: (error: Error) => void;
    /** Called when a row action button is clicked */
    onAction?: (action: string, row: Row<TData>) => void;
    /** Called when the table is fully loaded and rendered */
    onReady?: () => void;
    /** Called when loading state changes */
    onLoadingChange?: (isLoading: boolean) => void;
} 
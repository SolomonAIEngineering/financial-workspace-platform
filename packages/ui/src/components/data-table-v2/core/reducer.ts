import type { DataTableAction, DataTableState } from "./types";

/**
 * Initial state for the DataTable
 */
export const initialDataTableState: DataTableState = {
    sorting: [],
    globalFilter: "",
    columnFilters: {},
    pageIndex: 0,
    pageSize: 10,
    columnVisibility: {},
    selectedRowIds: {},
    density: 'default',
};

/**
 * Reducer function for managing DataTable state
 * 
 * @param {DataTableState} state - Current state of the DataTable
 * @param {DataTableAction} action - Action to perform on the state
 * @returns {DataTableState} - New state after applying the action
 */
export function dataTableReducer(
    state: DataTableState,
    action: DataTableAction
): DataTableState {
    switch (action.type) {
        case 'SET_SORTING':
            return {
                ...state,
                sorting: action.payload,
            };

        case 'SET_GLOBAL_FILTER':
            return {
                ...state,
                globalFilter: action.payload,
                // Reset to first page when filtering
                pageIndex: 0,
            };

        case 'SET_COLUMN_FILTER': {
            const { columnId, value } = action.payload;
            const newColumnFilters = {
                ...state.columnFilters,
                [columnId]: value,
            };

            // If value is empty, remove the filter
            if (value === undefined || value === '' ||
                (Array.isArray(value) && value.length === 0)) {
                delete newColumnFilters[columnId];
            }

            return {
                ...state,
                columnFilters: newColumnFilters,
                // Reset to first page when filtering
                pageIndex: 0,
            };
        }

        case 'SET_COLUMN_FILTERS':
            return {
                ...state,
                columnFilters: action.payload,
                // Reset to first page when filtering
                pageIndex: 0,
            };

        case 'RESET_COLUMN_FILTER': {
            const columnId = action.payload;
            const newColumnFilters = { ...state.columnFilters };

            if (columnId in newColumnFilters) {
                delete newColumnFilters[columnId];
            }

            return {
                ...state,
                columnFilters: newColumnFilters,
                // Reset to first page when clearing filters
                pageIndex: 0,
            };
        }

        case 'RESET_ALL_FILTERS':
            return {
                ...state,
                globalFilter: '',
                columnFilters: {},
                // Reset to first page when clearing filters
                pageIndex: 0,
            };

        case 'SET_PAGE_INDEX':
            return {
                ...state,
                pageIndex: action.payload,
            };

        case 'SET_PAGE_SIZE':
            return {
                ...state,
                pageSize: action.payload,
                // Reset to first page when changing page size
                pageIndex: 0,
            };

        case 'SET_COLUMN_VISIBILITY':
            return {
                ...state,
                columnVisibility: action.payload,
            };

        case 'SET_SELECTED_ROWS':
            return {
                ...state,
                selectedRowIds: action.payload,
            };

        case 'SET_DENSITY':
            return {
                ...state,
                density: action.payload,
            };

        default:
            return state;
    }
} 
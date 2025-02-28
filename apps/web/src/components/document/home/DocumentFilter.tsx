import React from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  FilterIcon,
  XIcon,
} from 'lucide-react';

import { Label } from '@/components/ui/label';

/**
 * Props for the DocumentFilter component
 *
 * @property {FilterState} filters - Current filter state
 * @property {(filters: FilterState) => void} setFilters - Callback to update
 *   filter state
 * @property {boolean} showFilters - Whether the filter panel is expanded
 * @property {(show: boolean) => void} setShowFilters - Callback to toggle
 *   filter panel visibility
 * @property {number} [documentCount] - Optional count of documents matching
 *   current filters
 * @interface DocumentFilterProps
 */
export interface DocumentFilterProps {
  /** Current filter state */
  filters: FilterState;
  /** Function to update filter state */
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  /** Function to toggle filter panel visibility */
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  /** Whether the filter panel is expanded */
  showFilters: boolean;
  /** Total number of documents matching the current filters */
  documentCount?: number;
}

/**
 * Type definition for filter state
 *
 * @property {string[]} status - Array of selected status filters
 * @property {object} dateRange - Start and end dates for date filtering
 * @property {string[]} tags - Array of selected tag filters
 * @property {string} searchTerm - Current search query
 * @property {'date' | 'title' | 'status'} sortBy - Field to sort by
 * @property {'asc' | 'desc'} sortOrder - Ascending or descending sort order
 * @interface FilterState
 */
export interface FilterState {
  /** Date range for filtering documents by creation/update date */
  dateRange: {
    /** Starting date of the range (inclusive) */
    from: Date | null;
    /** Ending date of the range (inclusive) */
    to: Date | null;
  };
  /** Text search query */
  searchTerm: string;
  /** Field to sort documents by */
  sortBy: 'date' | 'status' | 'title';
  /** Direction of sorting */
  sortOrder: 'asc' | 'desc';
  /** Array of selected document status values */
  status: string[];
  /** Array of selected document tags */
  tags: string[];
}

/** Controls for toggling the filter panel visibility */
export function FilterToggle({
  filters,
  setShowFilters,
  showFilters,
}: Pick<
  DocumentFilterProps,
  'filters' | 'setShowFilters' | 'showFilters'
>): React.ReactElement {
  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some((v) =>
    Array.isArray(v)
      ? v.length > 0
      : typeof v === 'object'
        ? v.from || v.to
        : v !== '' && v !== 'date' && v !== 'desc'
  );

  return (
    <button
      className={`flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
        showFilters || hasActiveFilters
          ? 'border-primary/30 bg-primary/10 text-primary'
          : 'border-gray-200 bg-white text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300'
      }`}
      onClick={() => setShowFilters(!showFilters)}
      aria-controls="filter-panel"
      aria-expanded={showFilters}
    >
      <FilterIcon className="h-4 w-4" />
      Filters
      {showFilters ? (
        <ChevronUpIcon className="h-4 w-4" />
      ) : (
        <ChevronDownIcon className="h-4 w-4" />
      )}
    </button>
  );
}

/**
 * DocumentFilter component provides advanced filtering capabilities for
 * documents
 *
 * This component renders a toggle button and expandable panel with various
 * filter options, including status filters, date range pickers, tag selectors,
 * and sort controls.
 *
 * @example
 *   ```tsx
 *   <DocumentFilter
 *     filters={filters}
 *     setFilters={setFilters}
 *     showFilters={showFilters}
 *     setShowFilters={setShowFilters}
 *     documentCount={documents.length}
 *   />
 *   ```;
 *
 * @component
 */
export function DocumentFilter({
  documentCount = 0,
  filters,
  setFilters,
  setShowFilters,
  showFilters,
}: DocumentFilterProps): React.ReactElement {
  /** Reset all filters to their default values */
  const clearAllFilters = () => {
    setFilters({
      dateRange: { from: null, to: null },
      searchTerm: '',
      sortBy: 'date',
      sortOrder: 'desc',
      status: [],
      tags: [],
    });
  };

  /**
   * Toggle a status filter value
   *
   * @param status - Status value to toggle
   */
  const toggleStatusFilter = (status: string) => {
    setFilters((prev: FilterState) => {
      const newStatus = prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status];

      return { ...prev, status: newStatus };
    });
  };

  /**
   * Toggle a tag filter value
   *
   * @param tag - Tag value to toggle
   */
  const toggleTagFilter = (tag: string) => {
    setFilters((prev: FilterState) => {
      const newTags = prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag];

      return { ...prev, tags: newTags };
    });
  };

  return (
    <>
      <FilterToggle
        filters={filters}
        setShowFilters={setShowFilters}
        showFilters={showFilters}
      />

      <AnimatePresence>
        {showFilters && (
          <motion.div
            id="filter-panel"
            className="mb-6 overflow-hidden"
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                  Advanced Filters
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={clearAllFilters}
                    aria-label="Clear all filters"
                  >
                    <XIcon className="h-3 w-3" />
                    Clear all
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Status Filter */}
                <div>
                  <Label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {['draft', 'pending', 'approved', 'rejected'].map(
                      (status) => (
                        <button
                          key={status}
                          className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                            filters.status.includes(status)
                              ? 'border border-primary/30 bg-primary/20 text-primary'
                              : 'border border-gray-200 bg-gray-100 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                          }`}
                          onClick={() => toggleStatusFilter(status)}
                          aria-pressed={filters.status.includes(status)}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Date Range Filter */}
                <div>
                  <Label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date Range
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        value={
                          filters.dateRange.from
                            ? new Date(filters.dateRange.from)
                                .toISOString()
                                .split('T')[0]
                            : ''
                        }
                        onChange={(e) => {
                          const date = e.target.value
                            ? new Date(e.target.value)
                            : null;
                          setFilters({
                            ...filters,
                            dateRange: { ...filters.dateRange, from: date },
                          });
                        }}
                        placeholder="From"
                        aria-label="Filter from date"
                        type="date"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        className="w-full rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        value={
                          filters.dateRange.to
                            ? new Date(filters.dateRange.to)
                                .toISOString()
                                .split('T')[0]
                            : ''
                        }
                        onChange={(e) => {
                          const date = e.target.value
                            ? new Date(e.target.value)
                            : null;
                          setFilters({
                            ...filters,
                            dateRange: { ...filters.dateRange, to: date },
                          });
                        }}
                        placeholder="To"
                        aria-label="Filter to date"
                        type="date"
                      />
                    </div>
                  </div>
                </div>

                {/* Tags Filter */}
                <div>
                  <Label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tags
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Contract',
                      'Legal',
                      'Important',
                      'Personal',
                      'Business',
                    ].map((tag) => (
                      <button
                        key={tag}
                        className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                          filters.tags.includes(tag)
                            ? 'border border-primary/30 bg-primary/20 text-primary'
                            : 'border border-gray-200 bg-gray-100 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                        onClick={() => toggleTagFilter(tag)}
                        aria-pressed={filters.tags.includes(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <Label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Sort By
                      </Label>
                      <select
                        className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        value={filters.sortBy}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            sortBy: e.target.value as
                              | 'date'
                              | 'status'
                              | 'title',
                          })
                        }
                        aria-label="Sort documents by field"
                      >
                        <option value="date">Date</option>
                        <option value="title">Title</option>
                        <option value="status">Status</option>
                      </select>
                    </div>
                    <div>
                      <Label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Order
                      </Label>
                      <select
                        className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        value={filters.sortOrder}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            sortOrder: e.target.value as 'asc' | 'desc',
                          })
                        }
                        aria-label="Sort order"
                      >
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {documentCount} document{documentCount !== 1 ? 's' : ''}{' '}
                      found
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

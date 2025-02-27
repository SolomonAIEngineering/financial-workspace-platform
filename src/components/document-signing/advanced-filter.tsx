'use client';

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import {
  BookmarkIcon,
  CalendarIcon,
  CheckIcon,
  FunnelIcon,
  TagIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { addDays, isAfter, isBefore, parseISO } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';

import type { Document, FilterMode, PriorityLevel } from './types';

interface AdvancedFilterProps {
  availableSenders: string[];
  availableTags: string[];
  documents: Document[];
  isOpen: boolean;
  onFilterChange: (filteredDocs: Document[]) => void;
  onToggle: () => void;
}

// Define the filter state interface
interface FilterState {
  dateRange: {
    endDate: Date | null;
    field: 'expiresAt' | 'updatedAt';
    startDate: Date | null;
  };
  favorited: boolean | null;
  hasAllSignatures: boolean | null;
  pageCount: {
    max: number | null;
    min: number | null;
  };
  priority: PriorityLevel[];
  sender: string[];
  status: FilterMode[];
  tags: string[];
}

export function AdvancedFilter({
  availableSenders,
  availableTags,
  documents,
  isOpen,
  onFilterChange,
  onToggle,
}: AdvancedFilterProps) {
  // Initialize filter state with default values
  const [filters, setFilters] = useState<FilterState>({
    dateRange: {
      endDate: null,
      field: 'updatedAt',
      startDate: null,
    },
    favorited: null,
    hasAllSignatures: null,
    pageCount: {
      max: null,
      min: null,
    },
    priority: [],
    sender: [],
    status: [],
    tags: [],
  });

  // Handle filter changes and apply them
  const applyFilters = () => {
    const filteredDocs = documents.filter((doc) => {
      // Status filter
      if (
        filters.status.length > 0 &&
        !filters.status.includes('all') &&
        !filters.status.includes(doc.status)
      ) {
        return false;
      }
      // Date range filter
      if (filters.dateRange.startDate || filters.dateRange.endDate) {
        // Parse the date from the document (assuming formats like "2 hours ago", "1 day ago", etc.)
        let docDate: Date;

        try {
          if (filters.dateRange.field === 'updatedAt') {
            // For demo purposes, use current date minus some time for relative dates
            // In a real app, you'd have actual timestamps
            const now = new Date();

            if (doc.updatedAt.includes('hour')) {
              docDate = addDays(now, 0);
            } else if (doc.updatedAt.includes('day')) {
              docDate = addDays(now, -1);
            } else if (doc.updatedAt.includes('week')) {
              docDate = addDays(now, -7);
            } else {
              docDate = addDays(now, -30);
            }
          } else {
            // For expires date we have ISO format in the demo data
            docDate = parseISO(doc.expiresAt);
          }
          // Check if date is within range
          if (
            filters.dateRange.startDate &&
            isBefore(docDate, filters.dateRange.startDate)
          ) {
            return false;
          }
          if (
            filters.dateRange.endDate &&
            isAfter(docDate, filters.dateRange.endDate)
          ) {
            return false;
          }
        } catch (error) {
          console.error('Date parsing error:', error);
        }
      }
      // Priority filter
      if (
        filters.priority.length > 0 &&
        doc.priority &&
        !filters.priority.includes(doc.priority)
      ) {
        return false;
      }
      // Tags filter
      if (
        filters.tags.length > 0 &&
        (!doc.tags || !filters.tags.some((tag) => doc.tags?.includes(tag)))
      ) {
        return false;
      }
      // Sender filter
      if (
        filters.sender.length > 0 &&
        !filters.sender.includes(doc.sender.name)
      ) {
        return false;
      }
      // Page count filter
      if (
        filters.pageCount.min !== null &&
        doc.pageCount < filters.pageCount.min
      ) {
        return false;
      }
      if (
        filters.pageCount.max !== null &&
        doc.pageCount > filters.pageCount.max
      ) {
        return false;
      }
      // Favorited filter
      if (filters.favorited !== null && doc.isFavorited !== filters.favorited) {
        return false;
      }
      // All signatures filter
      if (filters.hasAllSignatures === true) {
        const allSigned = doc.recipients.every((r) => r.status === 'signed');

        if (!allSigned) return false;
      } else if (filters.hasAllSignatures === false) {
        const allSigned = doc.recipients.every((r) => r.status === 'signed');

        if (allSigned) return false;
      }

      return true;
    });

    onFilterChange(filteredDocs);
  };

  // Call applyFilters whenever filters change
  React.useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      dateRange: {
        endDate: null,
        field: 'updatedAt',
        startDate: null,
      },
      favorited: null,
      hasAllSignatures: null,
      pageCount: {
        max: null,
        min: null,
      },
      priority: [],
      sender: [],
      status: [],
      tags: [],
    });
  };

  // Toggle individual filters
  const toggleStatus = (status: FilterMode) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status],
    }));
  };

  const togglePriority = (priority: PriorityLevel) => {
    setFilters((prev) => ({
      ...prev,
      priority: prev.priority.includes(priority)
        ? prev.priority.filter((p) => p !== priority)
        : [...prev.priority, priority],
    }));
  };

  const toggleTag = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const toggleSender = (sender: string) => {
    setFilters((prev) => ({
      ...prev,
      sender: prev.sender.includes(sender)
        ? prev.sender.filter((s) => s !== sender)
        : [...prev.sender, sender],
    }));
  };

  const toggleFavorited = () => {
    setFilters((prev) => ({
      ...prev,
      favorited:
        prev.favorited === null ? true : prev.favorited === true ? false : null,
    }));
  };

  const toggleAllSignatures = () => {
    setFilters((prev) => ({
      ...prev,
      hasAllSignatures:
        prev.hasAllSignatures === null
          ? true
          : prev.hasAllSignatures === true
            ? false
            : null,
    }));
  };

  // Set date range field
  const setDateRangeField = (field: 'expiresAt' | 'updatedAt') => {
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        field,
      },
    }));
  };

  // Set date range
  const setDateRange = (startDate: Date | null, endDate: Date | null) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        endDate,
        startDate,
      },
    }));
  };

  // Set page count range
  const setPageCountRange = (min: number | null, max: number | null) => {
    setFilters((prev) => ({
      ...prev,
      pageCount: {
        max,
        min,
      },
    }));
  };

  // Count active filters for the badge
  const countActiveFilters = () => {
    let count = 0;

    if (filters.status.length > 0) count++;
    if (filters.dateRange.startDate || filters.dateRange.endDate) count++;
    if (filters.priority.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (filters.sender.length > 0) count++;
    if (filters.pageCount.min !== null || filters.pageCount.max !== null)
      count++;
    if (filters.favorited !== null) count++;
    if (filters.hasAllSignatures !== null) count++;

    return count;
  };

  const activeFilterCount = countActiveFilters();

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <button
          className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={onToggle}
        >
          <FunnelIcon className="h-4 w-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </button>
        {activeFilterCount > 0 && (
          <button
            className="text-xs text-muted-foreground hover:text-primary"
            onClick={resetFilters}
          >
            Reset filters
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="overflow-hidden rounded-lg border bg-background shadow-md"
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Status filter */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        'pending',
                        'viewed',
                        'signed',
                        'rejected',
                        'expired',
                      ] as FilterMode[]
                    ).map((status) => (
                      <button
                        key={status}
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          filters.status.includes(status)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        }`}
                        onClick={() => toggleStatus(status)}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date range filter */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Date Range</h3>
                    <div className="flex rounded-md border bg-background p-0.5 text-xs shadow-sm">
                      <button
                        className={`rounded-l-sm px-2 py-0.5 ${filters.dateRange.field === 'updatedAt' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                        onClick={() => setDateRangeField('updatedAt')}
                      >
                        Updated
                      </button>
                      <button
                        className={`rounded-r-sm px-2 py-0.5 ${filters.dateRange.field === 'expiresAt' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                        onClick={() => setDateRangeField('expiresAt')}
                      >
                        Expires
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <DatePicker
                        className="w-full rounded-md border border-input px-3 py-1 text-xs placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                        selected={filters.dateRange.startDate}
                        onChange={(date) =>
                          setDateRange(date, filters.dateRange.endDate)
                        }
                        endDate={filters.dateRange.endDate}
                        placeholderText="Start date"
                        startDate={filters.dateRange.startDate}
                        selectsStart
                      />
                      <CalendarIcon className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                    <div className="relative flex-1">
                      <DatePicker
                        className="w-full rounded-md border border-input px-3 py-1 text-xs placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                        selected={filters.dateRange.endDate}
                        onChange={(date) =>
                          setDateRange(filters.dateRange.startDate, date)
                        }
                        endDate={filters.dateRange.endDate}
                        minDate={filters.dateRange.startDate ?? undefined}
                        placeholderText="End date"
                        startDate={filters.dateRange.startDate}
                        selectsEnd
                      />
                      <CalendarIcon className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                {/* Priority filter */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Priority</h3>
                  <div className="flex flex-wrap gap-2">
                    {(['high', 'medium', 'low', 'none'] as PriorityLevel[]).map(
                      (priority) => (
                        <button
                          key={priority}
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            filters.priority.includes(priority)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                          }`}
                          onClick={() => togglePriority(priority)}
                        >
                          {priority === 'none'
                            ? 'None'
                            : priority.charAt(0).toUpperCase() +
                              priority.slice(1)}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Tags filter */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                          filters.tags.includes(tag)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                        }`}
                        onClick={() => toggleTag(tag)}
                      >
                        <TagIcon className="h-3 w-3" />
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sender filter */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Sender</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableSenders.map((sender) => (
                      <button
                        key={sender}
                        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                          filters.sender.includes(sender)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                        }`}
                        onClick={() => toggleSender(sender)}
                      >
                        <UserCircleIcon className="h-3 w-3" />
                        {sender}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Page count filter */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Page Count</h3>
                  <div className="flex items-center gap-2">
                    <input
                      className="w-full rounded-md border border-input px-3 py-1 text-xs placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                      value={
                        filters.pageCount.min !== null
                          ? filters.pageCount.min
                          : ''
                      }
                      onChange={(e) =>
                        setPageCountRange(
                          e.target.value
                            ? Number.parseInt(e.target.value)
                            : null,
                          filters.pageCount.max
                        )
                      }
                      placeholder="Min"
                      min="1"
                      type="number"
                    />
                    <span className="text-xs text-muted-foreground">to</span>
                    <input
                      className="w-full rounded-md border border-input px-3 py-1 text-xs placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                      value={
                        filters.pageCount.max !== null
                          ? filters.pageCount.max
                          : ''
                      }
                      onChange={(e) =>
                        setPageCountRange(
                          filters.pageCount.min,
                          e.target.value
                            ? Number.parseInt(e.target.value)
                            : null
                        )
                      }
                      placeholder="Max"
                      min="1"
                      type="number"
                    />
                  </div>
                </div>

                {/* Additional flags */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Additional Filters</h3>
                  <div className="flex flex-col gap-2">
                    <button
                      className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        filters.favorited === true
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                          : filters.favorited === false
                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            : 'border hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      onClick={toggleFavorited}
                    >
                      {filters.favorited === true ? (
                        <BookmarkSolidIcon className="h-4 w-4 text-amber-500" />
                      ) : (
                        <BookmarkIcon className="h-4 w-4" />
                      )}
                      <span>
                        {filters.favorited === true
                          ? 'Favorited'
                          : filters.favorited === false
                            ? 'Not Favorited'
                            : 'Any Favorite Status'}
                      </span>
                    </button>

                    <button
                      className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        filters.hasAllSignatures === true
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : filters.hasAllSignatures === false
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                            : 'border hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      onClick={toggleAllSignatures}
                    >
                      <CheckIcon className="h-4 w-4" />
                      <span>
                        {filters.hasAllSignatures === true
                          ? 'All Signed'
                          : filters.hasAllSignatures === false
                            ? 'Pending Signatures'
                            : 'Any Signature Status'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState } from 'react';

import type { Document, User } from '@solomonai/prisma';

import { motion } from 'framer-motion';
import { FilterIcon, MenuIcon, PlusIcon } from 'lucide-react';

import { CreateDocumentButton } from '../CreateDocumentButton';
import { type FilterState, DocumentFilter } from './DocumentFilter';
import { DocumentGroupedList } from './DocumentGroupedList';
import { PinnedDocuments } from './PinnedDocuments';
import { ViewModeToggle } from './ViewModeToggle';
import { Button } from '@/registry/default/potion-ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

/**
 * Props for the HomeDocuments component
 *
 * @property {Document[]} documents - Array of all documents to display
 * @property {boolean} isLoading - Loading state to display skeletons
 * @property {User} currentUser - The current logged-in user
 * @property {User} user - The user whose documents are being displayed
 * @interface HomeDocumentsProps
 */
export interface HomeDocumentsProps {
  /** Current logged-in user */
  currentUser: User;
  /** All documents to display */
  documents: Document[];
  /** Whether data is currently loading */
  isLoading: boolean;
  /** User whose documents are being displayed */
  user: User;
}

/**
 * Function to apply filters to the documents array
 *
 * @param {Document[]} docs - The documents to filter
 * @param {FilterState} filters - The filter state to apply
 * @returns {Document[]} - The filtered documents
 */
function applyFilters(docs: Document[], filters: FilterState): Document[] {
  if (!docs) return [];

  return docs
    .filter((doc) => {
      // Search term filter
      if (
        filters.searchTerm &&
        doc.title &&
        !doc.title.toLowerCase().includes(filters.searchTerm.toLowerCase())
      ) {
        return false;
      }
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(doc.status)) {
        return false;
      }
      // Date range filter
      if (filters.dateRange.from) {
        const docDate = new Date(doc.createdAt);
        const startDate = new Date(filters.dateRange.from);

        if (docDate < startDate) return false;
      }
      if (filters.dateRange.to) {
        const docDate = new Date(doc.createdAt);
        const endDate = new Date(filters.dateRange.to);
        endDate.setHours(23, 59, 59);

        if (docDate > endDate) return false;
      }
      // Tags filter
      if (filters.tags.length > 0) {
        const hasMatchingTag = doc.tags?.some((tag) =>
          filters.tags.includes(tag)
        );

        if (!hasMatchingTag) return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      const aValue =
        filters.sortBy === 'title'
          ? a.title
          : filters.sortBy === 'status'
            ? a.status
            : a.createdAt;

      const bValue =
        filters.sortBy === 'title'
          ? b.title
          : filters.sortBy === 'status'
            ? b.status
            : b.createdAt;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return filters.sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        const aDate = new Date(a.createdAt);
        const bDate = new Date(b.createdAt);

        return filters.sortOrder === 'asc'
          ? aDate.getTime() - bDate.getTime()
          : bDate.getTime() - aDate.getTime();
      }
    });
}

/** Category filter component optimized for mobile */
function CategoryFilters({
  activeCategory,
  setActiveCategory,
}: {
  activeCategory: 'all' | 'recent' | 'templates';
  setActiveCategory: (category: 'all' | 'recent' | 'templates') => void;
}) {
  return (
    <div className="flex w-full overflow-x-auto overflow-y-hidden rounded-md border border-gray-200 dark:border-gray-800">
      <button
        className={`px-3 py-1.5 text-sm whitespace-nowrap ${
          activeCategory === 'all'
            ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
            : 'bg-transparent text-gray-600 dark:text-gray-400'
        }`}
        onClick={() => setActiveCategory('all')}
      >
        All Documents
      </button>
      <button
        className={`px-3 py-1.5 text-sm whitespace-nowrap ${
          activeCategory === 'recent'
            ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
            : 'bg-transparent text-gray-600 dark:text-gray-400'
        }`}
        onClick={() => setActiveCategory('recent')}
      >
        Recent
      </button>
      <button
        className={`px-3 py-1.5 text-sm whitespace-nowrap ${
          activeCategory === 'templates'
            ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
            : 'bg-transparent text-gray-600 dark:text-gray-400'
        }`}
        onClick={() => setActiveCategory('templates')}
      >
        Templates
      </button>
    </div>
  );
}

/**
 * HomeDocuments component integrates all document components on the home page
 *
 * This component manages the document display including view modes, filtering,
 * and organization of documents into logical sections. It serves as the main
 * entry point for document management on the home page.
 *
 * @example
 *   ```tsx
 *   <HomeDocuments
 *     documents={documents}
 *     isLoading={isLoading}
 *     currentUser={currentUser}
 *     user={user}
 *   />
 *   ```;
 *
 * @component
 */
export function HomeDocuments({
  currentUser,
  documents,
  isLoading,
  user,
}: HomeDocumentsProps): React.ReactElement {
  // View mode state (grid or list)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { from: null, to: null },
    searchTerm: '',
    sortBy: 'date',
    sortOrder: 'desc',
    status: [],
    tags: [],
  });

  // Apply filters to documents
  const filteredDocuments =
    !isLoading && documents
      ? applyFilters(documents, filters)
      : documents || [];

  // Toggle between All, Recent, and Templates
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'recent' | 'templates'
  >('all');

  // Filter category functions
  const getDocumentsByCategory = () => {
    if (activeCategory === 'recent') {
      // Show documents from the last 7 days
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      return filteredDocuments.filter(
        (doc) => new Date(doc.createdAt) >= weekAgo
      );
    } else if (activeCategory === 'templates') {
      // Show only template documents
      return filteredDocuments.filter((doc) => doc.isTemplate);
    } else {
      // Show all documents
      return filteredDocuments;
    }
  };

  const displayedDocuments = getDocumentsByCategory();

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Top section with title and primary actions - mobile responsive */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h1 className="text-xl font-bold sm:text-2xl">Documents</h1>

        <div className="flex items-center gap-2">
          {/* Create document button - visible on all screen sizes */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 sm:flex-none"
          >
            <CreateDocumentButton className="flex w-full items-center justify-center rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 sm:w-auto">
              <PlusIcon className="mr-1 h-4 w-4" />
              <span className="whitespace-nowrap">New Document</span>
            </CreateDocumentButton>
          </motion.div>

          {/* View mode toggle - hidden on mobile, visible on tablet/desktop */}
          <div className="hidden sm:block">
            <ViewModeToggle setViewMode={setViewMode} viewMode={viewMode} />
          </div>

          {/* Mobile menu button - only visible on small screens */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto sm:hidden"
                aria-label="Document options menu"
              >
                <MenuIcon className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="sm:hidden">
              <div className="flex flex-col space-y-6 pt-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">View Mode</h3>
                  <ViewModeToggle
                    setViewMode={setViewMode}
                    viewMode={viewMode}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Filter Documents</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <FilterIcon className="mr-2 h-4 w-4" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Category filters - full width on mobile */}
      <div className="w-full overflow-hidden sm:w-auto">
        <CategoryFilters
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
      </div>

      {/* Filter section */}
      <DocumentFilter
        filters={filters}
        setFilters={setFilters}
        setShowFilters={setShowFilters}
        showFilters={showFilters}
      />

      {/* Pinned documents section */}
      <PinnedDocuments
        currentUser={currentUser}
        documents={filteredDocuments}
        isLoading={isLoading}
        user={user}
        viewMode={viewMode}
      />

      {/* Main document list */}
      <DocumentGroupedList
        currentUser={currentUser}
        documents={displayedDocuments}
        isLoading={isLoading}
        user={user}
        viewMode={viewMode}
      />
    </div>
  );
}

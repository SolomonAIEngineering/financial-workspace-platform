'use client';

import { useEffect, useState } from 'react';

import { AnimatePresence } from 'framer-motion';

import { FeatureDevelopment } from '@/components/document-sending/feature-development';
// Document signing components
import {
  type Document,
  type FilterMode,
  AdvancedFilter,
  DocumentActions,
  DocumentLoadingState,
  DocumentPreviewModal,
  DocumentStats,
  DocumentView,
  HelpInfoSection,
  SearchBar,
  ViewToggleSort,
} from '@/components/document-signing';
import { demoDocuments } from '@/components/document-signing/demo-data';
// UI components
import { PageSkeleton } from '@/components/ui/page-skeleton';
// Feature flags
import { isFeatureEnabled } from '@/lib/feature-flags';

export default function DocumentSigningPage() {
  // Check if the document signing feature is enabled
  const isDocumentSigningEnabled = isFeatureEnabled('DOCUMENT_SIGNING_ENABLED');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'priority'>('date');
  const [isAscending, setIsAscending] = useState(false);

  // Advanced filter states
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [advancedFilteredDocs, setAdvancedFilteredDocs] =
    useState<Document[]>(demoDocuments);

  // Animation states
  const [isLoading, setIsLoading] = useState(true);

  // Extract all available tags and senders for filter options
  const availableTags = Array.from(
    new Set(demoDocuments.flatMap((doc) => doc.tags || []))
  );
  const availableSenders = Array.from(
    new Set(demoDocuments.map((doc) => doc.sender.name))
  );

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  // If feature is not enabled, show the development notice
  if (!isDocumentSigningEnabled) {
    return (
      <PageSkeleton
        description="Sign documents securely and track signature status."
        title="Document Signing"
        breadcrumbs={[
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/document-signing', label: 'Document Signing' },
        ]}
      >
        <FeatureDevelopment
          description="We're building a powerful and secure document signing experience. Stay tuned for updates on this feature."
          title="Document Signing Coming Soon"
          estimatedTime="Expected release: Q3 2025"
        />
      </PageSkeleton>
    );
  }

  // Filter documents based on current filter and search
  const filteredDocuments = advancedFilteredDocs.filter((doc) => {
    const matchesFilter = filterMode === 'all' || doc.status === filterMode;
    const matchesSearch =
      searchQuery === '' ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesFilter && matchesSearch;
  });

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'date': {
        comparison =
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();

        break;
      }
      case 'name': {
        comparison = a.title.localeCompare(b.title);

        break;
      }
      case 'priority': {
        const priorityMap = { high: 3, low: 1, medium: 2, none: 0 };
        const aPriority = a.priority ? priorityMap[a.priority] : 0;
        const bPriority = b.priority ? priorityMap[b.priority] : 0;
        comparison = bPriority - aPriority;

        break;
      }
      // No default
    }

    return isAscending ? comparison : -comparison;
  });

  // Tabs for filtering documents
  const tabs = [
    {
      id: 'all',
      count: advancedFilteredDocs.length,
      isActive: filterMode === 'all',
      label: 'All Documents',
      onClick: () => setFilterMode('all'),
    },
    {
      id: 'pending',
      count: advancedFilteredDocs.filter((d) => d.status === 'pending').length,
      isActive: filterMode === 'pending',
      label: 'Pending',
      onClick: () => setFilterMode('pending'),
    },
    {
      id: 'viewed',
      count: advancedFilteredDocs.filter((d) => d.status === 'viewed').length,
      isActive: filterMode === 'viewed',
      label: 'Viewed',
      onClick: () => setFilterMode('viewed'),
    },
    {
      id: 'signed',
      count: advancedFilteredDocs.filter((d) => d.status === 'signed').length,
      isActive: filterMode === 'signed',
      label: 'Signed',
      onClick: () => setFilterMode('signed'),
    },
    {
      id: 'rejected',
      count: advancedFilteredDocs.filter((d) => d.status === 'rejected').length,
      isActive: filterMode === 'rejected',
      label: 'Rejected',
      onClick: () => setFilterMode('rejected'),
    },
  ];

  const handleSortChange = (value: 'date' | 'name' | 'priority') => {
    if (sortBy === value) {
      setIsAscending(!isAscending);
    } else {
      setSortBy(value);
      setIsAscending(false);
    }
  };

  return (
    <PageSkeleton
      description="Sign documents securely and track signature status."
      title="Document Signing"
      actions={
        <DocumentActions
          onFilter={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
        />
      }
      breadcrumbs={[
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/document-signing', label: 'Document Signing' },
      ]}
      headerContent={
        <div className="w-full max-w-md">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
      }
      tabs={tabs}
    >
      <div className="space-y-6">
        {/* Document stats summary */}
        {!isLoading && sortedDocuments.length > 0 && (
          <DocumentStats documents={advancedFilteredDocs} />
        )}

        {/* Advanced Filter */}
        <AdvancedFilter
          onFilterChange={setAdvancedFilteredDocs}
          onToggle={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
          availableSenders={availableSenders}
          availableTags={availableTags}
          documents={demoDocuments}
          isOpen={isAdvancedFilterOpen}
        />

        {/* View toggle and sort controls */}
        <ViewToggleSort
          onSortChange={handleSortChange}
          documentsCount={filteredDocuments.length}
          isAscending={isAscending}
          setViewMode={setViewMode}
          sortBy={sortBy}
          viewMode={viewMode}
        />

        {/* Documents list/grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <DocumentLoadingState />
          ) : (
            <DocumentView
              onDocumentClick={setSelectedDocument}
              documents={sortedDocuments}
              filterMode={filterMode}
              viewMode={viewMode}
            />
          )}
        </AnimatePresence>

        {/* Help Info Section */}
        {!isLoading && sortedDocuments.length > 0 && <HelpInfoSection />}
      </div>

      {/* Document preview modal */}
      <AnimatePresence>
        {selectedDocument && (
          <DocumentPreviewModal
            onClose={() => setSelectedDocument(null)}
            document={selectedDocument}
          />
        )}
      </AnimatePresence>
    </PageSkeleton>
  );
}

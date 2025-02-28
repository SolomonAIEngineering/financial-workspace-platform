'use client';

import React, { useState } from 'react';

import {
  Squares2X2Icon as GridIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@udecode/cn';
import { motion } from 'framer-motion';

import { DocumentSendingActions } from '@/components/document-sending/action-buttons';
import { DocumentCard } from '@/components/document-sending/document-card';
import { EmptyState } from '@/components/document-sending/empty-state';
import { FeatureDevelopment } from '@/components/document-sending/feature-development';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { isFeatureEnabled } from '@/lib/feature-flags';

// Demo data
const demoDocuments = [
  {
    id: 'doc-1',
    recipients: [
      {
        id: 'r-1',
        email: 'jane@example.com',
        name: 'Jane Cooper',
        status: 'signed' as const,
      },
      {
        id: 'r-2',
        email: 'michael@example.com',
        name: 'Michael Foster',
        status: 'pending' as const,
      },
    ],
    status: 'sent' as const,
    title: 'Service Agreement - ABC Corp',
    updatedAt: '2 hours ago',
  },
  {
    id: 'doc-2',
    recipients: [
      {
        id: 'r-3',
        email: 'dries@example.com',
        name: 'Dries Vincent',
        status: 'viewed' as const,
      },
    ],
    status: 'viewed' as const,
    title: 'Employment Contract Template',
    updatedAt: '1 day ago',
  },
  {
    id: 'doc-3',
    recipients: [
      {
        id: 'r-4',
        email: 'lindsay@example.com',
        name: 'Lindsay Walton',
        status: 'pending' as const,
      },
      {
        id: 'r-5',
        email: 'courtney@example.com',
        name: 'Courtney Henry',
        status: 'pending' as const,
      },
      {
        id: 'r-6',
        email: 'tom@example.com',
        name: 'Tom Cook',
        status: 'pending' as const,
      },
    ],
    status: 'draft' as const,
    title: 'Project Proposal - XYZ Project',
    updatedAt: '3 days ago',
  },
];

type FilterMode = 'all' | 'completed' | 'draft' | 'sent' | 'viewed';
type ViewMode = 'grid' | 'list';

export default function DocumentSendingPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDemoData, setShowDemoData] = useState(true); // Toggle to show empty state

  // Check if the document sending feature is enabled
  const isDocumentSendingEnabled = isFeatureEnabled('DOCUMENT_SENDING_ENABLED');

  // If feature is not enabled, show the development notice
  if (!isDocumentSendingEnabled) {
    return (
      <PageSkeleton
        description="Generate financial reports and track approval workflows for financial documents."
        title="Financial Analytics"
        breadcrumbs={[
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/financial-analytics', label: 'Financial Analytics' },
        ]}
      >
        <FeatureDevelopment
          description="We're working hard to bring you the best financial analytics experience. This feature is currently in development."
          title="Financial Analytics Coming Soon"
          estimatedTime="Expected release: Q3 2025"
        />
      </PageSkeleton>
    );
  }

  // Demo tabs
  const tabs = [
    {
      id: 'all',
      isActive: filterMode === 'all',
      label: 'All Documents',
      onClick: () => setFilterMode('all'),
    },
    {
      id: 'draft',
      isActive: filterMode === 'draft',
      label: 'Drafts',
      onClick: () => setFilterMode('draft'),
    },
    {
      id: 'sent',
      isActive: filterMode === 'sent',
      label: 'Sent',
      onClick: () => setFilterMode('sent'),
    },
    {
      id: 'completed',
      isActive: filterMode === 'completed',
      label: 'Completed',
      onClick: () => setFilterMode('completed'),
    },
  ];

  // Filter documents based on current filter and search
  const filteredDocuments = demoDocuments.filter((doc) => {
    const matchesFilter = filterMode === 'all' || doc.status === filterMode;
    const matchesSearch =
      searchQuery === '' ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.recipients.some((r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesFilter && matchesSearch;
  });

  // Custom header content for the search
  const headerContent = (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <MagnifyingGlassIcon className="h-4 w-4 text-muted-foreground" />
      </div>
      <input
        className="block w-full rounded-md border border-input bg-background py-1.5 pr-3 pl-10 text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search documents or recipients..."
        type="text"
      />
    </div>
  );

  // Custom right-side actions
  const layoutToggleActions = (
    <div className="flex items-center gap-1 rounded-md border bg-muted/50 p-0.5">
      <button
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded',
          viewMode === 'grid'
            ? 'bg-background shadow-sm'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
        onClick={() => setViewMode('grid')}
      >
        <GridIcon className="h-4 w-4" />
      </button>
      <button
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded',
          viewMode === 'list'
            ? 'bg-background shadow-sm'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
        onClick={() => setViewMode('list')}
      >
        <ListBulletIcon className="h-4 w-4" />
      </button>
    </div>
  );

  // Combined actions for the page
  const actions = (
    <div className="flex items-center gap-3">
      {layoutToggleActions}
      <DocumentSendingActions />
    </div>
  );

  return (
    <PageSkeleton
      description="Create, manage, and track the documents you send for signature."
      title="Document Sending"
      actions={actions}
      breadcrumbs={[
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/financial-analytics', label: 'Financial Analytics' },
      ]}
      headerContent={headerContent}
      tabs={tabs}
    >
      {showDemoData && filteredDocuments.length > 0 ? (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'flex flex-col gap-3'
          )}
        >
          {filteredDocuments.map((doc) => (
            <motion.div
              key={doc.id}
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ type: 'spring' }}
              layout
            >
              <DocumentCard
                id={doc.id}
                className={viewMode === 'list' ? 'max-w-full' : ''}
                onClick={() => {}}
                title={doc.title}
                recipients={doc.recipients}
                status={doc.status}
                updatedAt={doc.updatedAt}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState onAction={() => setShowDemoData(true)} />
      )}
    </PageSkeleton>
  );
}

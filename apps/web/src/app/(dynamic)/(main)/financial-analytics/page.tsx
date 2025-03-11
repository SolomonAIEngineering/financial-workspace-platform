'use client';

import {
  ChartPieIcon,
  Squares2X2Icon as GridIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  PresentationChartBarIcon,
  ArrowPathIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';

import { DocumentCard } from '@/components/document-sending/document-card';
import { DocumentSendingActions } from '@/components/document-sending/action-buttons';
import { EmptyState } from '@/components/document-sending/empty-state';
import {
  FeatureDevelopment,
  type FeatureCard,
} from '@/components/document-sending/feature-development';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { cn } from '@udecode/cn';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { motion } from 'framer-motion';
import { WaitlistFeature } from '@/components/waitlist/waitlist-feature';

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

export default function FinancialAnalyticsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDemoData, setShowDemoData] = useState(true);

  const featureName = 'Financial Analytics';

  // Feature flag check - change to false to see the coming soon state
  const featureFlag = false;

  // If feature is not enabled, show the development notice
  if (!featureFlag) {
    return (
      <PageSkeleton
        description="Gain deeper insights into your financial data with advanced analytics and reporting."
        title="Financial Analytics"
        breadcrumbs={[
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/financial-analytics', label: 'Financial Analytics' },
        ]}
        actions={
          <WaitlistFeature
            featureName={featureName}
            buttonIcon={PresentationChartBarIcon}
            buttonText="Early Access"
          />
        }
      >
        <FeatureDevelopment
          description="We're developing powerful financial analytics tools with interactive visualizations, trend analysis, and AI-powered insights. Transform your raw financial data into actionable business intelligence."
          title="Advanced Analytics Platform"
          estimatedTime="Expected release: Q4 2025"
          featureCards={[
            {
              description:
                'Interactive data visualizations to explore financial patterns',
              icon: ChartPieIcon,
              title: 'Visual Insights',
            },
            {
              description: 'Real-time analytics with automatic data refreshing',
              icon: ArrowPathIcon,
              title: 'Live Updates',
            },
            {
              description:
                'AI-powered recommendations for financial decision making',
              icon: LightBulbIcon,
              title: 'Smart Suggestions',
            },
          ]}
        />
      </PageSkeleton>
    );
  }

  // Demo tabs
  const tabs = [
    {
      id: 'all',
      isActive: filterMode === 'all',
      label: 'All Reports',
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
      label: 'Recent',
      onClick: () => setFilterMode('sent'),
    },
    {
      id: 'completed',
      isActive: filterMode === 'completed',
      label: 'Favorites',
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
    <div className="relative w-full max-w-md">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <MagnifyingGlassIcon className="h-4 w-4 text-muted-foreground" />
      </div>
      <input
        className="block w-full rounded-md border border-border/50 bg-background/80 py-1.5 pr-3 pl-10 text-sm transition-all duration-200 placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-primary/50 focus:outline-none"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search analytics reports..."
        type="text"
      />
    </div>
  );

  // Custom right-side actions
  const layoutToggleActions = (
    <div className="flex items-center gap-1 rounded-md border border-border/50 bg-background/70 p-0.5 backdrop-blur-md">
      <motion.button
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded',
          viewMode === 'grid'
            ? 'bg-card shadow-sm'
            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
        )}
        onClick={() => setViewMode('grid')}
        whileHover={viewMode !== 'grid' ? { scale: 1.05 } : {}}
        whileTap={viewMode !== 'grid' ? { scale: 0.95 } : {}}
      >
        <GridIcon className="h-4 w-4" />
      </motion.button>
      <motion.button
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded',
          viewMode === 'list'
            ? 'bg-card shadow-sm'
            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
        )}
        onClick={() => setViewMode('list')}
        whileHover={viewMode !== 'list' ? { scale: 1.05 } : {}}
        whileTap={viewMode !== 'list' ? { scale: 0.95 } : {}}
      >
        <ListBulletIcon className="h-4 w-4" />
      </motion.button>
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
      description="Analyze your financial data with interactive reports and visualizations."
      title="Financial Analytics"
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
              ? 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'flex flex-col gap-4'
          )}
        >
          {filteredDocuments.map((doc) => (
            <motion.div
              key={doc.id}
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              layout
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
            >
              <DocumentCard
                id={doc.id}
                className={cn(
                  'h-full transition-shadow duration-200 hover:shadow-md',
                  viewMode === 'list' ? 'max-w-full' : ''
                )}
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

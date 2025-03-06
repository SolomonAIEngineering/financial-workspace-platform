import React, { useState } from 'react';

import type { Document } from '@/server/types/index';

import { motion } from 'framer-motion';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

import { WithSkeleton } from '@/components/ui/skeleton';

/**
 * Props for the DocumentSection component
 *
 * @property {string} title - Title of the document section (e.g., "Today",
 *   "Yesterday")
 * @property {Document[]} documents - Array of documents to display in this
 *   section
 * @property {boolean} isLoading - Loading state to display skeletons
 * @property {boolean} [initiallyExpanded=true] - Whether section should be
 *   expanded by default. Default is `true`
 * @property {React.ReactNode} children - Document cards or other content to
 *   render
 * @property {'grid' | 'list'} [viewMode='grid'] - Display mode for documents
 *   (grid or list). Default is `'grid'`
 * @interface DocumentSectionProps
 */
export interface DocumentSectionProps {
  /** Content to render inside the section (typically DocumentCard components) */
  children: React.ReactNode;
  /** Documents belonging to this section */
  documents: Document[];
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Title of the section, displayed in the header */
  title: string;
  /** Controls whether section is expanded when first rendered */
  initiallyExpanded?: boolean;
  /** Display mode for the documents - affects layout styling */
  viewMode?: 'grid' | 'list';
}

/**
 * DocumentSection component displays a collapsible section of documents with a
 * title header
 *
 * This component groups documents under a common title (e.g., "Today",
 * "Yesterday") and allows users to expand or collapse the section. It supports
 * both grid and list view modes, and handles loading states by displaying
 * skeletons.
 *
 * @example
 *   ```tsx
 *   <DocumentSection
 *     title="Today"
 *     documents={todayDocuments}
 *     isLoading={isLoading}
 *     viewMode={viewMode}
 *   >
 *     {todayDocuments.map(doc => (
 *       <DocumentCard key={doc.id} doc={doc} isLoading={isLoading} />
 *     ))}
 *   </DocumentSection>
 *   ```;
 *
 * @component
 */
export function DocumentSection({
  children,
  documents,
  initiallyExpanded = true,
  isLoading,
  title,
  viewMode = 'grid',
}: DocumentSectionProps): React.ReactElement | null {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  // Don't render empty sections when not loading
  if (!isLoading && documents.length === 0) return null;

  return (
    <motion.div
      className="mb-6"
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <WithSkeleton className="h-5 w-full py-[2%]" isLoading={isLoading}>
        <div
          className="mb-2 flex cursor-pointer items-center"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h2 className="text-lg font-semibold">{title}</h2>
          <span className="ml-2 text-sm text-gray-500">
            ({documents.length} documents)
          </span>
          <button className="ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            {isExpanded ? (
              <ChevronUpIcon className="h-4 w-4" />
            ) : (
              <ChevronDownIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </WithSkeleton>

      {isExpanded && (
        <motion.div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
              : 'flex flex-col gap-2'
          }
          animate={{ height: 'auto', opacity: 1 }}
          initial={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}

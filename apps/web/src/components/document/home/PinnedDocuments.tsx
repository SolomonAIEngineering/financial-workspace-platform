import type { Document, User } from '@/server/types/index';

import { DocumentCard } from './DocumentCard';
import React from 'react';
import { WithSkeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

/**
 * Props for the PinnedDocuments component
 *
 * @property {Document[]} documents - Array of all documents
 * @property {boolean} isLoading - Loading state to display skeletons
 * @property {User} currentUser - The current logged-in user
 * @property {User} user - The user whose documents are being displayed
 * @property {'grid' | 'list'} [viewMode='grid'] - Display mode for documents
 *   (grid or list). Default is `'grid'`
 * @interface PinnedDocumentsProps
 */
export interface PinnedDocumentsProps {
  /** Current logged-in user */
  currentUser: User;
  /** All documents to filter for pinned ones */
  documents: Document[];
  /** Whether data is currently loading */
  isLoading: boolean;
  /** User whose documents are being displayed */
  user: User;
  /** Display mode for the documents - affects layout styling */
  viewMode?: 'grid' | 'list';
}

/**
 * PinnedDocuments component displays a section of pinned documents
 *
 * This component filters documents marked as pinned and displays them in a
 * dedicated section at the top of the document list. It supports both grid and
 * list view modes, and handles loading states by displaying skeletons.
 *
 * @example
 *   ```tsx
 *   <PinnedDocuments
 *     documents={documents}
 *     isLoading={isLoading}
 *     currentUser={currentUser}
 *     user={user}
 *     viewMode={viewMode}
 *   />
 *   ```;
 *
 * @component
 */
export function PinnedDocuments({
  currentUser,
  documents,
  isLoading,
  user,
  viewMode = 'grid',
}: PinnedDocumentsProps): React.ReactElement | null {
  // Filter pinned documents
  const pinnedDocuments =
    documents?.filter((doc: Document) => doc?.pinned) || [];

  // Don't render if there are no pinned documents and not loading
  if (!isLoading && pinnedDocuments.length === 0) return null;

  return (
    <motion.div
      className="mb-8 flex flex-col gap-4"
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <WithSkeleton className="mb-2 h-5 w-full" isLoading={isLoading}>
        <div className="mb-2 flex items-center">
          <h2 className="text-lg font-semibold">Pinned</h2>
          <span className="ml-2 text-sm text-gray-500">
            ({pinnedDocuments.length} documents)
          </span>
        </div>
      </WithSkeleton>

      <motion.div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
            : 'flex flex-col gap-2'
        }
      >
        {isLoading
          ? // Loading skeletons
            Array.from({ length: 3 }).map((_, index) => (
              <DocumentCard
                key={`pinned-skeleton-${index}`}
                currentUser={currentUser}
                doc={null}
                isLoading={true}
                user={user}
                variants={{
                  container: {
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 },
                  },
                }}
                viewMode={viewMode}
              />
            ))
          : // Actual pinned documents
            pinnedDocuments.map((doc, index) => (
              <DocumentCard
                key={doc.id}
                currentUser={currentUser}
                doc={doc}
                isLoading={false}
                user={user}
                variants={{
                  container: {
                    hidden: { opacity: 0, y: 20 },
                    show: {
                      opacity: 1,
                      transition: { delay: index * 0.05 },
                      y: 0,
                    },
                  },
                }}
                viewMode={viewMode}
              />
            ))}
      </motion.div>
    </motion.div>
  );
}

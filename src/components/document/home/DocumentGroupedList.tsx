import React from 'react';

import type { Document, User } from '@/server/types/index';

import { motion } from 'framer-motion';

import { DocumentCard } from './DocumentCard';
import { DocumentSection } from './DocumentSection';
import { EmptyDocumentState } from './EmptyDocumentState';

/**
 * Props for the DocumentGroupedList component
 *
 * @property {Document[]} documents - Array of documents to display
 * @property {boolean} isLoading - Loading state to display skeletons
 * @property {User} currentUser - The current logged-in user
 * @property {User} user - The user whose documents are being displayed
 * @property {'grid' | 'list'} [viewMode='grid'] - Display mode for documents
 *   (grid or list). Default is `'grid'`
 * @interface DocumentGroupedListProps
 */
export interface DocumentGroupedListProps {
  /** Current logged-in user */
  currentUser: User;
  /** Documents to display in grouped sections */
  documents: Document[];
  /** Whether data is currently loading */
  isLoading: boolean;
  /** User whose documents are being displayed */
  user: User;
  /** Display mode for documents (grid or list) */
  viewMode?: 'grid' | 'list';
}

/** Determines if a date is today */
function isToday(date: Date): boolean {
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/** Determines if a date is yesterday */
function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
}

/** Determines if a date is within the current week */
function isThisWeek(date: Date): boolean {
  const today = new Date();
  const firstDayOfWeek = new Date(today);
  firstDayOfWeek.setDate(today.getDate() - today.getDay());

  return date >= firstDayOfWeek && !isToday(date) && !isYesterday(date);
}

/** Determines if a date is within the last week */
function isLastWeek(date: Date): boolean {
  const today = new Date();
  const firstDayOfWeek = new Date(today);
  firstDayOfWeek.setDate(today.getDate() - today.getDay());

  const firstDayOfLastWeek = new Date(firstDayOfWeek);
  firstDayOfLastWeek.setDate(firstDayOfWeek.getDate() - 7);

  return date >= firstDayOfLastWeek && date < firstDayOfWeek;
}

/** Determines if a date is within the last month */
function isLastMonth(date: Date): boolean {
  const today = new Date();
  const lastMonth = new Date(today);
  lastMonth.setMonth(today.getMonth() - 1);

  return (
    date.getMonth() === lastMonth.getMonth() &&
    date.getFullYear() === lastMonth.getFullYear() &&
    !isThisWeek(date) &&
    !isLastWeek(date) &&
    !isToday(date) &&
    !isYesterday(date)
  );
}

/**
 * DocumentGroupedList component displays documents grouped by creation date
 *
 * This component organizes documents into logical time-based sections (Today,
 * Yesterday, This Week, Last Week, Last Month, Older) and handles the display
 * of an empty state when no documents are available. It supports both grid and
 * list view modes.
 *
 * @example
 *   ```tsx
 *   <DocumentGroupedList
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
export function DocumentGroupedList({
  currentUser,
  documents,
  isLoading,
  user,
  viewMode = 'grid',
}: DocumentGroupedListProps): React.ReactElement {
  // If loading, show skeleton sections
  if (isLoading) {
    return (
      <motion.div
        className="space-y-8"
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
      >
        <DocumentSection
          title="Today"
          documents={[]}
          isLoading={true}
          viewMode={viewMode}
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <DocumentCard
              key={`skeleton-${index}`}
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
          ))}
        </DocumentSection>
      </motion.div>
    );
  }
  // If no documents and not loading, show empty state
  if (!documents || documents.length === 0) {
    return <EmptyDocumentState />;
  }

  // Group documents by their time period
  const todayDocs = documents.filter((doc) => isToday(new Date(doc.createdAt)));

  const yesterdayDocs = documents.filter((doc) =>
    isYesterday(new Date(doc.createdAt))
  );

  const thisWeekDocs = documents.filter((doc) =>
    isThisWeek(new Date(doc.createdAt))
  );

  const lastWeekDocs = documents.filter((doc) =>
    isLastWeek(new Date(doc.createdAt))
  );

  const lastMonthDocs = documents.filter((doc) =>
    isLastMonth(new Date(doc.createdAt))
  );

  const olderDocs = documents.filter((doc) => {
    const date = new Date(doc.createdAt);

    return (
      !isToday(date) &&
      !isYesterday(date) &&
      !isThisWeek(date) &&
      !isLastWeek(date) &&
      !isLastMonth(date)
    );
  });

  return (
    <motion.div
      className="space-y-8"
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
    >
      {/* Today's documents */}
      <DocumentSection
        title="Today"
        documents={todayDocs}
        isLoading={isLoading}
        viewMode={viewMode}
      >
        {todayDocs.map((doc, index) => (
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
      </DocumentSection>

      {/* Yesterday's documents */}
      <DocumentSection
        title="Yesterday"
        documents={yesterdayDocs}
        isLoading={isLoading}
        viewMode={viewMode}
      >
        {yesterdayDocs.map((doc, index) => (
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
      </DocumentSection>

      {/* This week's documents */}
      <DocumentSection
        title="This Week"
        documents={thisWeekDocs}
        isLoading={isLoading}
        viewMode={viewMode}
      >
        {thisWeekDocs.map((doc, index) => (
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
      </DocumentSection>

      {/* Last week's documents */}
      <DocumentSection
        title="Last Week"
        documents={lastWeekDocs}
        isLoading={isLoading}
        viewMode={viewMode}
      >
        {lastWeekDocs.map((doc, index) => (
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
      </DocumentSection>

      {/* Last month's documents */}
      <DocumentSection
        title="Last Month"
        documents={lastMonthDocs}
        isLoading={isLoading}
        viewMode={viewMode}
      >
        {lastMonthDocs.map((doc, index) => (
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
      </DocumentSection>

      {/* Older documents */}
      <DocumentSection
        title="Older"
        documents={olderDocs}
        isLoading={isLoading}
        viewMode={viewMode}
      >
        {olderDocs.map((doc, index) => (
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
      </DocumentSection>
    </motion.div>
  );
}

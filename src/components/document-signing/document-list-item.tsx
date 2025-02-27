import {
  ArrowsPointingOutIcon,
  CalendarIcon,
  DocumentIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  ShareIcon,
  UserCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { differenceInDays, format } from 'date-fns';
import { motion } from 'framer-motion';

import type { Document } from './types';

import { StatusBadge } from './status-badge';

interface DocumentListItemProps {
  document: Document;
  onClick: () => void;
}

export const DocumentListItem = ({
  document,
  onClick,
}: DocumentListItemProps) => {
  const expiresDate = new Date(document.expiresAt);
  const isExpiringSoon =
    differenceInDays(expiresDate, new Date()) <= 7 &&
    document.status !== 'signed';
  const recipientsCount = document.recipients.length;
  const signedCount = document.recipients.filter(
    (r) => r.status === 'signed'
  ).length;

  return (
    <motion.div
      className="group relative flex cursor-pointer flex-col items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center dark:border-gray-800 dark:bg-gray-900"
      onClick={onClick}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      whileHover={{
        boxShadow:
          '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        y: -2,
      }}
      layout
    >
      <div className="relative flex-shrink-0">
        {document.previewUrl ? (
          <div className="h-16 w-14 overflow-hidden rounded-md border border-gray-200 bg-gray-50 transition-all group-hover:shadow dark:border-gray-700 dark:bg-gray-800">
            <img
              className="h-full w-full object-cover"
              alt={document.title}
              src={document.previewUrl}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-black/30">
              <ArrowsPointingOutIcon className="h-5 w-5 text-white" />
            </div>
          </div>
        ) : (
          <div className="flex h-16 w-14 items-center justify-center rounded-md border border-gray-200 bg-gray-50 transition-all group-hover:shadow dark:border-gray-700 dark:bg-gray-800">
            <DocumentIcon className="h-6 w-6 text-gray-400" />
          </div>
        )}
        {document.isFavorited && (
          <div className="absolute -top-2 -right-2">
            <BookmarkSolidIcon className="h-4 w-4 text-gray-500 drop-shadow-sm dark:text-gray-400" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <h3 className="line-clamp-1 text-base font-medium text-gray-900 transition-colors group-hover:text-gray-700 dark:text-gray-100 dark:group-hover:text-gray-300">
            {document.title}
          </h3>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={document.status} />
            {document.priority && document.priority !== 'none' && (
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  document.priority === 'high'
                    ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    : document.priority === 'medium'
                      ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {document.priority.charAt(0).toUpperCase() +
                  document.priority.slice(1)}
              </span>
            )}
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-2 text-xs text-gray-500 sm:flex-row sm:items-center sm:gap-4 dark:text-gray-400">
          <div className="flex items-center">
            <UserCircleIcon className="mr-1 h-3.5 w-3.5" />
            <span>
              From:{' '}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {document.sender.name}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <DocumentTextIcon className="h-3.5 w-3.5" />
            {document.pageCount} {document.pageCount === 1 ? 'page' : 'pages'}
          </div>
          <div className="flex items-center gap-1">
            <UserGroupIcon className="h-3.5 w-3.5" />
            <div className="flex items-center gap-1">
              <span
                className={
                  signedCount === recipientsCount
                    ? 'font-medium text-gray-700 dark:text-gray-300'
                    : ''
                }
              >
                {signedCount}
              </span>
              <span>/</span>
              <span>{recipientsCount}</span>
              <span>signed</span>
            </div>
          </div>
          <div
            className={`flex items-center gap-1 ${isExpiringSoon ? 'font-medium text-gray-700 dark:text-gray-300' : ''}`}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            Expires:{' '}
            <span className={isExpiringSoon ? 'font-medium' : ''}>
              {format(expiresDate, 'MMM d, yyyy')}
            </span>
          </div>
        </div>

        {document.tags && document.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {document.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex-shrink-0 self-end sm:self-center">
        <span className="text-xs text-gray-500 dark:text-gray-500">
          {document.updatedAt}
        </span>
      </div>

      <div className="absolute top-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex gap-1">
          <button className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300">
            <ShareIcon className="h-4 w-4" />
          </button>
          <button className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300">
            <EllipsisHorizontalIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

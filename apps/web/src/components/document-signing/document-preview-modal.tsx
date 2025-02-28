'use client';

import { useState } from 'react';

import {
  ArrowDownTrayIcon,
  BookmarkIcon,
  CalendarIcon,
  CheckBadgeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  DocumentIcon,
  EyeIcon,
  PaperClipIcon,
  PrinterIcon,
  ShareIcon,
  TagIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { AnimatePresence, motion } from 'framer-motion';

import { Modal } from '@/components/ui/modal';

import type { Document, PriorityLevel } from './types';

import { StatusBadge } from './status-badge';

interface DocumentPreviewModalProps {
  document: Document;
  onClose: () => void;
}

export function DocumentPreviewModal({
  document,
  onClose,
}: DocumentPreviewModalProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isFavorited, setIsFavorited] = useState(document.isFavorited || false);
  const [activeTab, setActiveTab] = useState<
    'activity' | 'comments' | 'details'
  >('details');

  const totalPages = document.pageCount || 1;

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    // Here you would normally update the favorite status on the server
  };

  const renderPriorityBadge = (priority?: PriorityLevel) => {
    if (!priority || priority === 'none') return null;

    const colorMap = {
      high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      medium:
        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorMap[priority]}`}
      >
        {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
      </span>
    );
  };

  return (
    <Modal
      size="4xl"
      onClose={onClose}
      title={document.title}
      contentClassName="flex-1 overflow-hidden hide-scrollbar"
      footer={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="rounded-md p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-800"
              disabled={currentPage === 1}
              onClick={handlePreviousPage}
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              className="rounded-md p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-800"
              disabled={currentPage === totalPages}
              onClick={handleNextPage}
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="flex gap-2">
            {document.status === 'pending' || document.status === 'viewed' ? (
              <button className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 md:w-auto">
                Sign Document
              </button>
            ) : document.status === 'signed' ? (
              <button className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 md:w-auto dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100">
                Download Signed Copy
              </button>
            ) : null}
          </div>
        </div>
      }
      icon={<DocumentIcon className="h-6 w-6 text-foreground" />}
      isOpen={!!document}
      subtitle={`From: ${document.sender.name} (${document.sender.email})`}
    >
      <div className="flex h-full flex-col gap-4 sm:flex-row">
        <div className="flex h-full w-full flex-col sm:w-2/3">
          {/* Document viewer */}
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {renderPriorityBadge(document.priority)}
              <button
                className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={toggleFavorite}
              >
                {isFavorited ? (
                  <BookmarkSolidIcon className="h-5 w-5 text-amber-500" />
                ) : (
                  <BookmarkIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Print Document"
              >
                <PrinterIcon className="h-5 w-5" />
              </button>
              <button
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Download"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
              </button>
              <button
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Share"
              >
                <ShareIcon className="h-5 w-5" />
              </button>
              <button
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Duplicate"
              >
                <DocumentDuplicateIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="aspect-[3/4] h-full max-h-full w-full flex-1 overflow-hidden rounded-lg border bg-gray-100 dark:bg-gray-800">
            {document.previewUrl ? (
              <div className="relative h-full w-full">
                <img
                  className="h-full w-full object-contain"
                  alt={`Preview of ${document.title} - page ${currentPage}`}
                  src={document.previewUrl}
                />
                <div className="absolute right-2 bottom-2 rounded-md bg-gray-900/70 px-2 py-1 text-xs text-white">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center">
                <DocumentIcon className="h-32 w-32 text-gray-300 dark:text-gray-600" />
                <p className="mt-4 text-gray-400 dark:text-gray-500">
                  Document preview not available
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="w-full overflow-y-auto sm:w-1/3">
          <div className="mb-4 flex border-b dark:border-gray-700">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'details'
                  ? 'border-b-2 border-gray-600 font-semibold text-gray-600 dark:border-blue-500 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'comments'
                  ? 'border-b-2 border-gray-600 font-semibold text-gray-600 dark:border-blue-500 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('comments')}
            >
              Comments
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'activity'
                  ? 'border-b-2 border-gray-600 font-semibold text-gray-600 dark:border-blue-500 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('activity')}
            >
              Activity
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'details' && (
              <motion.div
                className="h-full rounded-lg border bg-gray-50 p-4 dark:bg-gray-800/50"
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                initial={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  Document Details
                </h4>

                <div className="mb-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Status
                  </div>
                  <StatusBadge status={document.status} />
                </div>

                <div className="mb-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    From
                  </div>
                  <div className="text-sm font-medium">
                    {document.sender.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {document.sender.email}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Recipients
                  </div>
                  {document.recipients.map((recipient) => (
                    <div
                      key={recipient.id}
                      className="mt-1 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-medium">
                          {recipient.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {recipient.email}
                        </div>
                        {recipient.signedAt && (
                          <div className="text-xs text-gray-500">
                            Signed:{' '}
                            {new Date(recipient.signedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                      {recipient.status === 'signed' ? (
                        <CheckBadgeIcon className="h-5 w-5 text-green-500" />
                      ) : recipient.status === 'viewed' ? (
                        <EyeIcon className="h-5 w-5 text-blue-500" />
                      ) : recipient.status === 'rejected' ? (
                        <XCircleIcon className="h-5 w-5 text-red-500" />
                      ) : (
                        <ClockIcon className="h-5 w-5 text-amber-500" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mb-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Document Information
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <DocumentIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{document.pageCount} pages</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <CalendarIcon className="h-4 w-4" />
                    Expires: {new Date(document.expiresAt).toLocaleDateString()}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <ClockIcon className="h-4 w-4" />
                    Last updated: {document.updatedAt}
                  </div>
                </div>

                {document.tags && document.tags.length > 0 && (
                  <div className="mb-3">
                    <div className="mb-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <TagIcon className="h-3 w-3" />
                      Tags
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {document.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <button className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
                    <PaperClipIcon className="h-4 w-4" />
                    View Attachments
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'comments' && (
              <motion.div
                className="h-full rounded-lg border bg-gray-50 p-4 dark:bg-gray-800/50"
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                initial={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Comments
                  </h4>
                  <span className="text-xs text-gray-500">3 comments</span>
                </div>

                <div className="space-y-4">
                  {/* Example comments - in a real app, these would come from the document data */}
                  <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-gray-700">
                    <div className="mb-1 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-medium text-gray-600">
                        JS
                      </div>
                      <div>
                        <div className="text-sm font-medium">John Smith</div>
                        <div className="text-xs text-gray-500">
                          Yesterday at 2:30 PM
                        </div>
                      </div>
                    </div>
                    <p className="text-sm">
                      Please review section 3.2 regarding the payment terms.
                    </p>
                  </div>

                  <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-gray-700">
                    <div className="mb-1 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 font-medium text-violet-600">
                        YO
                      </div>
                      <div>
                        <div className="text-sm font-medium">You</div>
                        <div className="text-xs text-gray-500">
                          Yesterday at 3:45 PM
                        </div>
                      </div>
                    </div>
                    <p className="text-sm">
                      I've reviewed the payment terms and have a question about
                      the schedule.
                    </p>
                  </div>

                  <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-gray-700">
                    <div className="mb-1 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-medium text-gray-600">
                        JS
                      </div>
                      <div>
                        <div className="text-sm font-medium">John Smith</div>
                        <div className="text-xs text-gray-500">
                          Today at 9:15 AM
                        </div>
                      </div>
                    </div>
                    <p className="text-sm">
                      The payment schedule is outlined in Appendix B. Let me
                      know if you need clarification.
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <textarea
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    placeholder="Add a comment..."
                    rows={3}
                  />
                  <button className="mt-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-primary/90">
                    Send Comment
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'activity' && (
              <motion.div
                className="h-full rounded-lg border bg-gray-50 p-4 dark:bg-gray-800/50"
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                initial={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <h4 className="mb-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                  Activity Timeline
                </h4>

                <div className="relative ml-3 space-y-6 border-l border-gray-300 dark:border-gray-600">
                  {/* Example activity events - in a real app, these would be generated from document history */}
                  <div className="relative ml-6">
                    <div className="absolute -left-9 mt-1.5 h-4 w-4 rounded-full border border-white bg-green-500 dark:border-gray-800"></div>
                    <div className="text-sm">
                      <span className="font-medium">John Smith</span> signed the
                      document
                    </div>
                    <div className="text-xs text-gray-500">3 days ago</div>
                  </div>

                  <div className="relative ml-6">
                    <div className="absolute -left-9 mt-1.5 h-4 w-4 rounded-full border border-white bg-blue-500 dark:border-gray-800"></div>
                    <div className="text-sm">
                      <span className="font-medium">You</span> viewed the
                      document
                    </div>
                    <div className="text-xs text-gray-500">2 days ago</div>
                  </div>

                  <div className="relative ml-6">
                    <div className="absolute -left-9 mt-1.5 h-4 w-4 rounded-full border border-white bg-purple-500 dark:border-gray-800"></div>
                    <div className="text-sm">
                      <span className="font-medium">Real Estate Co.</span> added
                      a comment
                    </div>
                    <div className="text-xs text-gray-500">Yesterday</div>
                  </div>

                  <div className="relative ml-6">
                    <div className="absolute -left-9 mt-1.5 h-4 w-4 rounded-full border border-white bg-amber-500 dark:border-gray-800"></div>
                    <div className="text-sm">
                      <span className="font-medium">System</span> sent a
                      reminder
                    </div>
                    <div className="text-xs text-gray-500">Today</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
}

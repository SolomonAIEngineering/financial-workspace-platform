'use client';

import { useRef, useState } from 'react';

import {
  ArrowDownTrayIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentIcon,
  EllipsisHorizontalIcon,
  EnvelopeIcon,
  EyeIcon,
  FlagIcon,
  LockClosedIcon,
  PencilIcon,
  StarIcon,
  TagIcon,
  UserGroupIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { cn } from '@udecode/cn';
import { AnimatePresence, motion } from 'framer-motion';

import type { Document } from './types';

import { StatusBadge } from './status-badge';

interface DocumentCardProps {
  document: Document;
  onClick: () => void;
  onFavorite?: (id: string, isFavorited: boolean) => void;
  onPriorityChange?: (id: string, priority: Document['priority']) => void;
  onRemoveTag?: (id: string, tag: string) => void;
  onTag?: (id: string, tag: string) => void;
}

// Priority levels with associated colors
const priorityLevels = {
  high: {
    color: 'bg-red-500',
    hoverColor: 'bg-red-600',
    label: 'High Priority',
    textColor: 'text-red-700 dark:text-red-400',
  },
  low: {
    color: 'bg-green-500',
    hoverColor: 'bg-green-600',
    label: 'Low Priority',
    textColor: 'text-green-700 dark:text-green-400',
  },
  medium: {
    color: 'bg-amber-500',
    hoverColor: 'bg-amber-600',
    label: 'Medium Priority',
    textColor: 'text-amber-700 dark:text-amber-400',
  },
  none: {
    color: 'bg-gray-300 dark:bg-gray-700',
    hoverColor: 'bg-gray-400 dark:bg-gray-600',
    label: 'No Priority',
    textColor: 'text-gray-600 dark:text-gray-400',
  },
};

// Tag options with richer styling
const tagOptions = [
  {
    id: 'contract',
    color:
      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/30',
    icon: DocumentIcon,
    label: 'Contract',
  },
  {
    id: 'legal',
    color:
      'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700/30',
    icon: LockClosedIcon,
    label: 'Legal',
  },
  {
    id: 'financial',
    color:
      'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/30',
    icon: BanknotesIcon,
    label: 'Financial',
  },
  {
    id: 'hr',
    color:
      'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700/30',
    icon: UserGroupIcon,
    label: 'HR',
  },
  {
    id: 'urgent',
    color:
      'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/30',
    icon: FlagIcon,
    label: 'Urgent',
  },
  {
    id: 'communication',
    color:
      'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700/30',
    icon: EnvelopeIcon,
    label: 'Comm',
  },
];

export function DocumentCard({
  document,
  onClick,
  onFavorite,
  onPriorityChange,
  onRemoveTag,
  onTag,
}: DocumentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(document.isFavorited || false);
  const [currentTags, setCurrentTags] = useState<string[]>(document.tags || []);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [currentPriority, setCurrentPriority] = useState<Document['priority']>(
    document.priority || 'none'
  );

  const tagMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const priorityMenuRef = useRef<HTMLDivElement>(null);

  // Demo data - in a real app this would come from the document
  const daysUntilExpiry = document.expiresAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(document.expiresAt).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;

  // Calculate signing progress percentage
  const signingProgress =
    document.recipients.length > 0
      ? Math.round(
          (document.recipients.filter((r) => r.status === 'signed').length /
            document.recipients.length) *
            100
        )
      : 0;

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !isFavorited;
    setIsFavorited(newState);
    onFavorite?.(document.id, newState);
  };

  const handleTagClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTagMenu(!showTagMenu);
    // Close other menus
    setShowMoreMenu(false);
    setShowPriorityMenu(false);
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMoreMenu(!showMoreMenu);
    // Close other menus
    setShowTagMenu(false);
    setShowPriorityMenu(false);
  };

  const handlePriorityClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPriorityMenu(!showPriorityMenu);
    // Close other menus
    setShowTagMenu(false);
    setShowMoreMenu(false);
  };

  const addTag = (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!currentTags.includes(tagId)) {
      const newTags = [...currentTags, tagId];
      setCurrentTags(newTags);
      onTag?.(document.id, tagId);
    }

    setShowTagMenu(false);
  };

  const removeTag = (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTags = currentTags.filter((t) => t !== tagId);
    setCurrentTags(newTags);
    onRemoveTag?.(document.id, tagId);
  };

  const changePriority = (
    priority: Document['priority'],
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setCurrentPriority(priority);
    onPriorityChange?.(document.id, priority);
    setShowPriorityMenu(false);
  };

  // Close menus when clicking outside
  const handleDocumentClick = () => {
    setShowTagMenu(false);
    setShowMoreMenu(false);
    setShowPriorityMenu(false);
  };

  // Get appropriate action button based on document status
  const getActionButton = () => {
    if (document.status === 'pending' || document.status === 'viewed') {
      return (
        <motion.button
          className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-primary/20"
          onClick={(e) => {
            e.stopPropagation();
            // Sign document action
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <PencilIcon className="h-3 w-3" />
          Sign Now
        </motion.button>
      );
    } else if (document.status === 'signed') {
      return (
        <motion.button
          className="flex items-center gap-1 rounded-md bg-black/5 px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10"
          onClick={(e) => {
            e.stopPropagation();
            // Download document action
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowDownTrayIcon className="h-3 w-3" />
          Download
        </motion.button>
      );
    }

    return null;
  };

  // Whether there are any available tags to add
  const hasAvailableTags = tagOptions.some(
    (tag) => !currentTags.includes(tag.id)
  );

  return (
    <motion.div
      className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all"
      onClick={() => {
        handleDocumentClick();
        onClick();
      }}
      onHoverEnd={() => setIsHovered(false)}
      onHoverStart={() => setIsHovered(true)}
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      whileHover={{
        boxShadow:
          '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        y: -8,
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Priority indicator strip */}
      {currentPriority !== 'none' && (
        <div
          className={cn(
            'absolute top-0 left-0 h-full w-1.5',
            priorityLevels[currentPriority as keyof typeof priorityLevels].color
          )}
        />
      )}

      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {/* Expiry warning if < 7 days */}
        {daysUntilExpiry !== null && daysUntilExpiry < 7 && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1 rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-800 shadow-sm backdrop-blur-sm dark:bg-red-900/30 dark:text-red-300">
            <ClockIcon className="h-3.5 w-3.5" />
            {daysUntilExpiry === 0
              ? 'Expires today'
              : `Expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`}
          </div>
        )}

        {/* Document preview */}
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0.8, y: 5 }}
            transition={{ damping: 20, stiffness: 300, type: 'spring' }}
          >
            <DocumentIcon className="h-16 w-16 text-muted-foreground/30" />
          </motion.div>
        </div>

        {/* Preview overlay with actions */}
        <div className="absolute inset-0 flex items-center justify-center from-black/60 via-black/40 to-black/60 opacity-0 transition-all duration-300 ease-in-out group-hover:bg-gradient-to-b group-hover:opacity-100">
          <div className="flex gap-2">
            <motion.div
              className="rounded-full bg-white/90 p-2 shadow-lg"
              whileHover={{ scale: 1.1, y: -3 }}
              whileTap={{ scale: 0.9 }}
            >
              <EyeIcon className="h-5 w-5 text-black" />
            </motion.div>

            {(document.status === 'pending' ||
              document.status === 'viewed') && (
              <motion.div
                className="rounded-full bg-primary/90 p-2 shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  // Sign document action
                }}
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.9 }}
              >
                <PencilIcon className="h-5 w-5 text-white" />
              </motion.div>
            )}

            {document.status === 'signed' && (
              <motion.div
                className="rounded-full bg-gray-900/90 p-2 shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  // Download action
                }}
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowDownTrayIcon className="h-5 w-5 text-white" />
              </motion.div>
            )}
          </div>
        </div>

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={document.status} />
        </div>

        {/* Favorite button */}
        <button
          className="absolute top-3 left-3 rounded-full bg-white/80 p-1.5 text-gray-500 backdrop-blur-sm transition-all duration-300 hover:text-amber-500 focus:ring-2 focus:ring-amber-500/50 focus:outline-none dark:bg-black/50 dark:text-gray-300 dark:hover:text-amber-400"
          onClick={handleFavorite}
        >
          <motion.div
            animate={
              isFavorited
                ? {
                    rotate: [0, 5, -5, 5, 0],
                    scale: [1, 1.3, 1],
                    transition: { duration: 0.5, type: 'spring' },
                  }
                : {}
            }
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
          >
            {isFavorited ? (
              <StarIconSolid className="h-4 w-4 text-amber-500" />
            ) : (
              <StarIcon className="h-4 w-4" />
            )}
          </motion.div>
        </button>

        {/* Page count */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-md bg-white/80 px-2 py-1 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-sm dark:bg-black/50 dark:text-gray-200">
          <DocumentIcon className="h-3.5 w-3.5" />
          {document.pageCount} page{document.pageCount !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 font-medium text-foreground transition-colors group-hover:text-foreground">
          {document.title}
        </h3>

        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <span className="font-medium">From:</span>
          <span className="truncate">{document.sender.name}</span>
        </div>

        {/* Document details row */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDaysIcon className="h-3.5 w-3.5" />
            {document.updatedAt}
          </div>

          {/* Priority button */}
          <div className="relative">
            <button
              className={cn(
                'flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-colors',
                priorityLevels[currentPriority as keyof typeof priorityLevels]
                  .textColor
              )}
              onClick={handlePriorityClick}
            >
              <FlagIcon className="h-3.5 w-3.5" />
              {
                priorityLevels[currentPriority as keyof typeof priorityLevels]
                  .label
              }
            </button>

            {/* Priority dropdown menu */}
            <AnimatePresence>
              {showPriorityMenu && (
                <motion.div
                  ref={priorityMenuRef}
                  className="absolute right-0 bottom-full z-50 mb-1 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                  style={{ maxHeight: '200px' }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  initial={{ opacity: 0, y: 5 }}
                >
                  {Object.entries(priorityLevels).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={(e) =>
                        changePriority(key as Document['priority'], e)
                      }
                    >
                      <div
                        className={cn('h-2 w-2 rounded-full', value.color)}
                      />
                      <span>{value.label}</span>
                      {currentPriority === key && (
                        <CheckCircleIcon className="ml-1 h-3.5 w-3.5 text-foreground" />
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Tag area with scrollable container - FIXED LAYOUT */}
        <div className="relative mt-4 mb-2 h-10">
          <div className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 absolute inset-0 flex flex-wrap content-start gap-1 overflow-x-hidden overflow-y-auto py-1 pr-8">
            {currentTags.map((tagId) => {
              const tag = tagOptions.find((t) => t.id === tagId);

              if (!tag) return null;

              const TagIcon = tag.icon;

              return (
                <div
                  key={tagId}
                  className={cn(
                    'group flex shrink-0 items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px]',
                    tag.color
                  )}
                >
                  <TagIcon className="h-2.5 w-2.5 shrink-0" />
                  <span className="max-w-[50px] truncate">{tag.label}</span>
                  <button
                    className="ml-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => removeTag(tagId, e)}
                  >
                    <XCircleIcon className="h-2.5 w-2.5" />
                  </button>
                </div>
              );
            })}

            {/* Tag button */}
            {hasAvailableTags && (
              <div className="relative shrink-0">
                <button
                  className="flex items-center gap-0.5 rounded-full border border-gray-200 bg-white/80 px-1.5 py-0.5 text-[10px] text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-700/50"
                  onClick={handleTagClick}
                >
                  <TagIcon className="h-2.5 w-2.5" />
                  Add
                </button>

                {/* Tag dropdown menu - IMPROVED POSITIONING */}
                <AnimatePresence>
                  {showTagMenu && (
                    <motion.div
                      ref={tagMenuRef}
                      className="fixed top-1/2 left-1/2 z-50 w-48 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      initial={{ opacity: 0, scale: 0.9 }}
                    >
                      <div className="border-b border-gray-100 px-2 py-1.5 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300">
                        Add Tags
                      </div>
                      <div className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 max-h-48 overflow-y-auto py-1">
                        {tagOptions
                          .filter((tag) => !currentTags.includes(tag.id))
                          .map((tag) => {
                            const TagIcon = tag.icon;

                            return (
                              <div
                                key={tag.id}
                                className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={(e) => addTag(tag.id, e)}
                              >
                                <TagIcon className="h-3.5 w-3.5" />
                                {tag.label}
                              </div>
                            );
                          })}
                        {tagOptions.filter(
                          (tag) => !currentTags.includes(tag.id)
                        ).length === 0 && (
                          <div className="px-3 py-2 text-xs text-gray-500">
                            No more tags available
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Tag indicator if scrolling is needed */}
          {currentTags.length > 3 && (
            <div className="absolute top-0 right-0 bottom-0 flex w-8 items-center justify-end bg-gradient-to-l from-card to-transparent">
              <span className="mr-1 text-[10px] text-muted-foreground">
                scroll
              </span>
            </div>
          )}
        </div>

        {/* More options button - REPOSITIONED */}
        <div className="absolute top-4 right-4">
          <button
            className="rounded-full border border-gray-200 bg-white/80 p-1 text-xs text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-700/50"
            onClick={handleMoreClick}
          >
            <EllipsisHorizontalIcon className="h-4 w-4" />
          </button>

          {/* More options dropdown - IMPROVED POSITIONING */}
          <AnimatePresence>
            {showMoreMenu && (
              <motion.div
                ref={moreMenuRef}
                className="absolute top-full right-0 z-50 mt-1 w-40 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                initial={{ opacity: 0, y: -5 }}
              >
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Document Actions
                  </div>
                  <div>
                    <div className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700">
                      <EyeIcon className="h-3.5 w-3.5" /> View Details
                    </div>
                    <div className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700">
                      <ArrowDownTrayIcon className="h-3.5 w-3.5" /> Download
                    </div>
                    <div className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700">
                      <EnvelopeIcon className="h-3.5 w-3.5" /> Send Reminder
                    </div>
                    {document.status !== 'signed' && (
                      <div className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700">
                        <XCircleIcon className="h-3.5 w-3.5" /> Decline Signing
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4 flex items-center justify-between">
          {/* Recipients info */}
          {document.recipients.length > 1 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <UserGroupIcon className="h-3.5 w-3.5" />
              {document.recipients.length} recipients
            </div>
          )}

          {/* Action button */}
          {getActionButton()}
        </div>
      </div>

      {/* Progress indicator for multi-recipient documents */}
      {document.recipients.length > 1 && (
        <div className="px-4 pb-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
            <motion.div
              className="h-full bg-primary"
              animate={{ width: `${signingProgress}%` }}
              initial={{ width: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {document.recipients.filter((r) => r.status === 'signed').length}{' '}
              of {document.recipients.length} signed
            </span>
            <span className="font-medium">{signingProgress}%</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

import {
  ArrowRightIcon,
  ClockIcon,
  FileTextIcon,
  MessageCircleIcon,
  SettingsIcon,
  StarIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Document, User } from '@/server/types/index';
import React, { useState } from 'react';

import { Link } from '@/components/ui/link';
import { UserAvatar } from '@/components/user-avatar';
import { WithSkeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { routes } from '@/lib/navigation/routes';

/**
 * The status colors for different document states Maps status names to
 * corresponding background and text colors
 */
const STATUS_COLORS = {
  approved: {
    bg: 'bg-green-50 dark:bg-green-900/30',
    text: 'text-green-600 dark:text-green-400',
  },
  draft: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-400',
  },
  pending: {
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    text: 'text-amber-600 dark:text-amber-400',
  },
  rejected: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    text: 'text-red-600 dark:text-red-400',
  },
};

/** List of possible document statuses */
const STATUSES = ['draft', 'pending', 'approved', 'rejected'];

/**
 * Interface defining the properties for the DocumentCard component
 *
 * @property {any} doc - The document object to display
 * @property {boolean} isLoading - Whether the document is currently loading
 * @property {any} currentUser - The current user information for avatar display
 * @property {any} user - The user object for authorization checks
 * @property {any} variants - The animation variants from Framer Motion
 * @property {'grid' | 'list'} [viewMode='grid'] - The current view mode (grid
 *   or list). Default is `'grid'`
 * @interface DocumentCardProps
 */
export interface DocumentCardProps {
  /** Current user information for avatar display */
  currentUser: User;
  /** The document object containing data to display */
  doc: Document | null;
  /** Flag indicating if the document data is still loading */
  isLoading: boolean;
  /** User object for permission checks */
  user: any;
  /** Animation variants from Framer Motion */
  variants: any;
  /** The current display mode, either grid or list */
  viewMode?: 'grid' | 'list';

  // document status
  status?: 'draft' | 'pending' | 'approved' | 'rejected';

  // has comments
  hasComments?: boolean;

  // comment count
  commentCount?: number;

  // tags
  tags?: string[];

  // cover image
  coverImage?: string;

  // progress
  progress?: number;
}

/**
 * DocumentCard component displays a single document in either grid or list
 * view.
 *
 * The component adapts its layout based on the viewMode prop, showing different
 * visual representations and hover animations. It displays document metadata
 * such as title, date, status, and tags.
 *
 * @example
 *   ```tsx
 *   <DocumentCard
 *     doc={document}
 *     isLoading={false}
 *     currentUser={currentUser}
 *     user={user}
 *     variants={animationVariants}
 *     viewMode="grid"
 *   />
 *   ```;
 *
 * @component
 */
export function DocumentCard({
  currentUser,
  doc,
  isLoading,
  user,
  variants,
  viewMode = 'grid',
  status = 'draft',
  hasComments = false,
  commentCount = 0,
  tags = [],
  coverImage,
  progress,
}: DocumentCardProps): React.ReactElement {
  // Track hover state for animations
  const [isHovered, setIsHovered] = useState(false);

  // Render list view
  if (viewMode === 'list') {
    return (
      <WithSkeleton className="h-full w-full" isLoading={isLoading}>
        <motion.div
          onHoverEnd={() => setIsHovered(false)}
          onHoverStart={() => setIsHovered(true)}
          transition={{ duration: 0.2 }}
          variants={variants}
          whileHover={{ y: -2 }}
        >
          <Link href={routes.document({ documentId: doc?.id || '' })}>
            <div className="group flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                  {doc?.icon ? (
                    <div className="text-lg">{doc.icon}</div>
                  ) : (
                    <FileTextIcon className="h-5 w-5 text-primary" />
                  )}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate font-medium text-gray-900 transition-colors group-hover:text-primary dark:text-gray-100">
                  {doc?.title || 'Untitled Document'}
                </h3>
                <div className="mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <ClockIcon className="h-3 w-3" />
                    <span>
                      {new Date(
                        doc?.updatedAt || new Date()
                      ).toLocaleDateString(undefined, {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status].bg} ${STATUS_COLORS[status].text}`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
              </div>

              {user && (
                <div className="flex-shrink-0">
                  <UserAvatar
                    className="size-6"
                    avatarClassName="size-6"
                    user={currentUser}
                  />
                </div>
              )}

              {hasComments && (
                <div className="flex flex-shrink-0 items-center rounded-full bg-gray-50 px-2 py-0.5 dark:bg-gray-800">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {commentCount}
                  </span>
                  <span className="ml-1">
                    <MessageCircleIcon className="h-3 w-3 text-gray-400" />
                  </span>
                </div>
              )}

              <div className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                <ArrowRightIcon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </Link>
        </motion.div>
      </WithSkeleton>
    );
  }

  // Render grid view (default)
  return (
    <WithSkeleton className="h-full w-full" isLoading={isLoading}>
      <motion.div
        onHoverEnd={() => setIsHovered(false)}
        onHoverStart={() => setIsHovered(true)}
        transition={{ duration: 0.2 }}
        variants={variants}
        whileHover={{ y: -4 }}
      >
        <Link href={routes.document({ documentId: doc?.id || '' })}>
          <Card className="group h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:shadow-gray-900/10 dark:hover:shadow-gray-900/20">
            <div
              className="relative h-40 bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-500 dark:from-gray-800 dark:to-gray-900"
              style={
                doc?.coverImage
                  ? {
                      backgroundImage: `url(${doc?.coverImage})`,
                      backgroundPosition: 'center',
                      backgroundSize: 'cover',
                    }
                  : undefined
              }
            >
              {/* Status badge */}
              <div className="absolute top-3 right-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status].bg} ${STATUS_COLORS[status].text}`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>

              <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/5 dark:group-hover:bg-black/20"></div>

              <div className="absolute -bottom-5 left-3 rounded-xl border border-gray-100 bg-white p-2.5 shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110 dark:border-gray-700 dark:bg-gray-800">
                {doc?.icon ? (
                  <div className="text-2xl">{doc?.icon}</div>
                ) : (
                  <FileTextIcon className="h-6 w-6 text-primary" />
                )}
              </div>

              {/* Quick actions on hover */}
              <motion.div
                className="absolute right-3 bottom-3 flex gap-1.5"
                animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
                initial={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <button className="rounded-full bg-white/90 p-1.5 shadow-sm transition-colors hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800">
                  <StarIcon className="h-4 w-4 text-gray-400 hover:text-amber-500" />
                </button>
                <button className="rounded-full bg-white/90 p-1.5 shadow-sm transition-colors hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800">
                  <SettingsIcon className="h-4 w-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
                </button>
              </motion.div>
            </div>

            <CardHeader className="px-4 pt-7 pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base leading-tight font-bold text-gray-900 transition-colors duration-300 group-hover:text-primary dark:text-gray-100">
                  {doc?.title || 'Untitled'}
                </CardTitle>

                {hasComments && (
                  <div className="flex items-center rounded-full bg-gray-50 px-2 py-0.5 dark:bg-gray-800">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {commentCount}
                    </span>
                    <span className="ml-1">
                      <MessageCircleIcon className="h-3 w-3 text-gray-400" />
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="px-4 pb-4">
              {/* Document tags */}
              <div className="mb-3 flex flex-wrap gap-1.5">
                {tags?.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {user && (
                    <UserAvatar
                      className="size-6"
                      avatarClassName="size-6"
                      user={currentUser}
                    />
                  )}
                  <div className="flex items-center gap-1.5">
                    <ClockIcon className="h-3.5 w-3.5 text-gray-400" />
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {new Date(
                        doc?.updatedAt || new Date()
                      ).toLocaleDateString(undefined, {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                </div>

                {/* Progress indicator for demo */}
                {progress && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    {progress}%
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    </WithSkeleton>
  );
}

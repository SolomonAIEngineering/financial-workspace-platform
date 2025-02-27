'use client';

import React from 'react';

import {
  DocumentPlusIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@udecode/cn';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  actionLabel?: string;
  className?: string;
  description?: string;
  title?: string;
  onAction?: () => void;
}

export function EmptyState({
  actionLabel = 'Create Document',
  className,
  description = 'Create your first document to send or start from a template.',
  title = 'No documents yet',
  onAction,
}: EmptyStateProps) {
  return (
    <motion.div
      className={cn(
        'flex h-full flex-col items-center justify-center text-center',
        className
      )}
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <div className="flex flex-col items-center px-6 py-12">
        <div className="relative mb-6">
          <motion.div
            className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"
            animate={{ scale: 1 }}
            initial={{ scale: 0.5 }}
            transition={{
              damping: 10,
              delay: 0.3,
              stiffness: 100,
              type: 'spring',
            }}
          >
            <DocumentPlusIcon className="h-10 w-10 text-primary" />
          </motion.div>
          <motion.div
            className="absolute -right-2 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary shadow-md"
            animate={{ scale: 1, x: 0, y: 0 }}
            initial={{ scale: 0, x: -10, y: 10 }}
            transition={{
              damping: 10,
              delay: 0.5,
              stiffness: 100,
              type: 'spring',
            }}
          >
            <PaperAirplaneIcon className="h-4 w-4 text-primary-foreground" />
          </motion.div>
        </div>

        <motion.h3
          className="mb-2 text-xl font-medium text-foreground"
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          transition={{ delay: 0.4 }}
        >
          {title}
        </motion.h3>

        <motion.p
          className="mb-6 max-w-md text-muted-foreground"
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          transition={{ delay: 0.5 }}
        >
          {description}
        </motion.p>

        {onAction && (
          <motion.button
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
            onClick={onAction}
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <DocumentPlusIcon className="h-4 w-4" />
            {actionLabel}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

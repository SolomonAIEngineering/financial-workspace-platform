'use client';

import { DocumentIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

import type { FilterMode } from './types';

interface EmptyStateProps {
  filterMode: FilterMode;
}

export function EmptyState({ filterMode }: EmptyStateProps) {
  const messages = {
    all: {
      description:
        "You don't have any documents that require your signature right now.",
      title: 'No documents to sign',
    },
    expired: {
      description: "You don't have any expired documents.",
      title: 'No expired documents',
    },
    pending: {
      description: "You don't have any documents waiting for your signature.",
      title: 'No pending documents',
    },
    rejected: {
      description: "You haven't rejected any documents.",
      title: 'No rejected documents',
    },
    signed: {
      description: "You haven't signed any documents yet.",
      title: 'No signed documents',
    },
    viewed: {
      description: "You haven't viewed any documents that need signature.",
      title: 'No viewed documents',
    },
  };

  const message = messages[filterMode] || messages.all;

  return (
    <motion.div
      className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white/50 p-12 text-center dark:border-gray-700 dark:bg-gray-900/30"
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <DocumentIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="mb-2 text-lg font-medium">{message.title}</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        {message.description}
      </p>
    </motion.div>
  );
}

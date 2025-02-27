import {
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';

import type { Document } from './types';

interface DocumentStatsProps {
  documents: Document[];
}

export const DocumentStats = ({ documents }: DocumentStatsProps) => {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <motion.div
        className="rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/40"
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
              {documents.filter((d) => d.status === 'pending').length}
            </p>
          </div>
          <div className="rounded-md bg-gray-100 p-2 dark:bg-gray-800">
            <ClockIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
          Documents awaiting your signature
        </p>
      </motion.div>

      <motion.div
        className="rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/40"
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Signed</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
              {documents.filter((d) => d.status === 'signed').length}
            </p>
          </div>
          <div className="rounded-md bg-gray-100 p-2 dark:bg-gray-800">
            <CheckIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
          Documents completed and signed
        </p>
      </motion.div>

      <motion.div
        className="rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/40"
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              High Priority
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
              {documents.filter((d) => d.priority === 'high').length}
            </p>
          </div>
          <div className="rounded-md bg-gray-100 p-2 dark:bg-gray-800">
            <ExclamationCircleIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
          Documents requiring immediate attention
        </p>
      </motion.div>

      <motion.div
        className="rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/40"
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Expiring Soon
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
              {
                documents.filter((d) => {
                  const expiresDate = new Date(d.expiresAt);

                  return (
                    differenceInDays(expiresDate, new Date()) <= 7 &&
                    d.status !== 'signed'
                  );
                }).length
              }
            </p>
          </div>
          <div className="rounded-md bg-gray-100 p-2 dark:bg-gray-800">
            <CalendarIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
          Documents expiring in the next 7 days
        </p>
      </motion.div>
    </div>
  );
};

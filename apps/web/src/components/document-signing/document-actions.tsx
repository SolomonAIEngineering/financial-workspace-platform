'use client';

import { FunnelIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface DocumentActionsProps {
  onFilter?: () => void;
  onSendForSignature?: () => void;
}

export function DocumentActions({
  onFilter,
  onSendForSignature,
}: DocumentActionsProps) {
  return (
    <div className="flex items-center gap-3">
      <motion.button
        className="flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        onClick={onFilter}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <FunnelIcon className="h-4 w-4" />
        Filter
      </motion.button>
      <motion.button
        className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-primary/90"
        onClick={onSendForSignature}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <PaperAirplaneIcon className="h-4 w-4" />
        Send for Signature
      </motion.button>
    </div>
  );
}

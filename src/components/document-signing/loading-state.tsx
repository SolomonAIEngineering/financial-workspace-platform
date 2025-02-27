import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export const DocumentLoadingState = () => {
  return (
    <motion.div
      key="loading"
      className="py-12"
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
    >
      <div className="flex flex-col items-center justify-center">
        <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <DocumentTextIcon className="h-8 w-8 animate-bounce text-gray-400 opacity-75 dark:text-gray-500" />
        </div>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Loading documents...
        </p>
      </div>
    </motion.div>
  );
};

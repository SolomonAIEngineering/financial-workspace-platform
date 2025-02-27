import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export const HelpInfoSection = () => {
  return (
    <motion.div
      className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/50"
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ delay: 0.5, duration: 0.3 }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 rounded-full bg-gray-100 p-2 dark:bg-gray-800">
          <InformationCircleIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Document Signing Help
          </h4>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Need assistance with document signing? We're here to help. Learn
            more about our secure signing process in our{' '}
            <a
              className="underline transition-colors hover:text-gray-900 dark:hover:text-gray-200"
              href="#"
            >
              documentation
            </a>{' '}
            or{' '}
            <a
              className="underline transition-colors hover:text-gray-900 dark:hover:text-gray-200"
              href="#"
            >
              contact support
            </a>
            .
          </p>
        </div>
      </div>
    </motion.div>
  );
};

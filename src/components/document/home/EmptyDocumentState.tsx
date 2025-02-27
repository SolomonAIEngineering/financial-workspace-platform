import React from 'react';

import { motion } from 'framer-motion';
import { ChevronRightIcon } from 'lucide-react';

import { CreateDocumentButton } from '@/components/document/CreateDocumentButton';
import { Icons } from '@/components/ui/icons';

/**
 * Props for the EmptyDocumentState component
 *
 * @interface EmptyDocumentStateProps
 */
export interface EmptyDocumentStateProps {
  /** Optional className to apply to the component */
  className?: string;
}

/**
 * EmptyDocumentState component displays a friendly UI when no documents exist
 *
 * This component provides a welcoming message and a prominent call-to-action to
 * create a first document. It includes visual elements like background
 * decorations and animations to create an engaging empty state.
 *
 * @example
 *   ```tsx
 *   <EmptyDocumentState />
 *   ```;
 *
 * @component
 */
export function EmptyDocumentState({
  className,
}: EmptyDocumentStateProps): React.ReactElement {
  return (
    <motion.div
      className={`relative flex h-[600px] items-center justify-center ${className}`}
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background pattern elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-primary/5 opacity-70 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-primary/5 opacity-70 blur-3xl"></div>
      </div>

      <div className="relative z-10 flex max-w-lg flex-col items-center gap-8 rounded-2xl border border-gray-100 bg-white px-10 py-12 text-center shadow-xl dark:border-gray-800 dark:bg-gray-900 dark:shadow-gray-900/30">
        <span className="inline-block rounded-full bg-primary/10 p-4 dark:bg-primary/20">
          <Icons.document className="size-16 text-primary" />
        </span>
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            No documents yet
          </h3>
          <p className="text-md max-w-sm text-gray-500 dark:text-gray-400">
            Create your first document to begin organizing your contracts and
            agreements.
          </p>
        </div>
        <motion.div
          transition={{ damping: 17, stiffness: 400, type: 'spring' }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <CreateDocumentButton
            className="group mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground shadow-md transition-all duration-300 hover:bg-primary/90 hover:shadow-lg"
            label="Create New Document"
            icon={true}
          >
            <ChevronRightIcon className="ml-1 size-4 opacity-70 transition-transform duration-300 group-hover:translate-x-1" />
          </CreateDocumentButton>
        </motion.div>
        <div className="mt-2 w-full border-t border-gray-100 pt-6 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help getting started?{' '}
            <a className="text-primary hover:underline" href="#">
              View our guide
            </a>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

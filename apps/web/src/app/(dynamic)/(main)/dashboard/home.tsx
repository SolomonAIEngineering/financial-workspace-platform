'use client';

import React from 'react';

import type { Document, User } from '@/server/types/index';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

import { useAuthUser } from '@/components/auth/useAuthUser';
import { useCurrentUser } from '@/components/auth/useCurrentUser';
import { CreateDocumentButton } from '@/components/document/CreateDocumentButton';
import { HomeDocuments } from '@/components/document/home/HomeDocuments';
import { templateList } from '@/components/editor/utils/useTemplateDocument';
import { Icons } from '@/components/ui/icons';
import { useTRPC } from '@/trpc/react';

export function Home() {
  const user = useAuthUser();
  const trpc = useTRPC();
  const currentUser = useCurrentUser();
  const [isLoaded, setIsLoaded] = React.useState(false);

  const { data, isLoading } = useQuery({
    ...trpc.document.documents.queryOptions({
      parentDocumentId: undefined,
    }),
    enabled: !!user,
  });

  // Animation effect when component mounts
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  let documents = data?.documents;

  if (!user) {
    documents = templateList as any;
  }
  if (isLoading && !documents) {
    documents = Array.from({ length: 9 }, (_, index) => ({
      id: index.toString(),
      coverImage: null,
      icon: null,
      isTemplate: false,
      pinned: false,
      status: 'draft',
      tags: [],
      title: 'Loading...',
      updatedAt: new Date(),
      value: null,
    }));
  }
  if (!documents?.length) {
    return (
      <motion.div
        className="relative flex h-[600px] items-center justify-center"
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
              <Icons.chevronRight className="ml-1 size-4 opacity-70 transition-transform duration-300 group-hover:translate-x-1" />
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

  return (
    <motion.div
      className="relative pt-8 pb-16"
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Background elements for depth */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-40 -right-20 h-96 w-96 rounded-full bg-primary/5 opacity-80 blur-3xl dark:bg-primary/10"></div>
        <div className="absolute top-80 -left-20 h-96 w-96 rounded-full bg-purple-500/5 opacity-80 blur-3xl dark:bg-purple-500/10"></div>
      </div>

      {/* Main container */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <HomeDocuments
          currentUser={currentUser as unknown as User}
          documents={documents as unknown as Document[]}
          isLoading={isLoading}
          user={user as unknown as User}
        />
      </div>

      {/* <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <PinnedDocuments
          documents={documents as unknown as Document[]}
          isLoading={isLoading}
          currentUser={currentUser as unknown as User}
          user={user as unknown as User}
        />
      </div> */}
    </motion.div>
  );
}

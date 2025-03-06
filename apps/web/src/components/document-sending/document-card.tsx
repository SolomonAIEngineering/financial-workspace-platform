'use client';

import React from 'react';

import {
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  EyeIcon,
  PaperAirplaneIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { cn } from '@udecode/cn';
import { motion } from 'framer-motion';

interface DocumentCardProps {
  id: string;
  recipients: {
    id: string;
    email: string;
    name: string;
    status?: 'pending' | 'signed' | 'viewed';
  }[];
  status: DocumentStatus;
  title: string;
  updatedAt: string;
  className?: string;
  onClick?: () => void;
}

type DocumentStatus = 'completed' | 'draft' | 'sent' | 'viewed';

export function DocumentCard({
  id,
  className,
  recipients,
  status,
  title,
  updatedAt,
  onClick,
}: DocumentCardProps) {
  const statusConfig = {
    completed: {
      color: 'text-green-500 bg-green-100 dark:bg-green-500/20',
      icon: CheckCircleIcon,
      label: 'Completed',
    },
    draft: {
      color: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-500/20',
      icon: ClockIcon,
      label: 'Draft',
    },
    sent: {
      color: 'text-blue-500 bg-blue-100 dark:bg-blue-500/20',
      icon: PaperAirplaneIcon,
      label: 'Sent',
    },
    viewed: {
      color: 'text-purple-500 bg-purple-100 dark:bg-purple-500/20',
      icon: EyeIcon,
      label: 'Viewed',
    },
  };

  const StatusIcon = statusConfig[status].icon;

  return (
    <motion.div
      className={cn(
        'group cursor-pointer rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md',
        className
      )}
      onClick={onClick}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <DocumentTextIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="leading-tight font-medium text-foreground">
                {title}
              </h3>
              <p className="text-xs text-muted-foreground">
                Updated {updatedAt}
              </p>
            </div>
          </div>

          <div
            className={cn(
              'flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
              statusConfig[status].color
            )}
          >
            <StatusIcon className="mr-1 h-3 w-3" />
            {statusConfig[status].label}
          </div>
        </div>

        <div className="mt-1">
          <p className="text-xs text-muted-foreground">Recipients:</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {recipients.map((recipient) => (
              <div
                key={recipient.id}
                className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
              >
                <span>{recipient.name}</span>
                {recipient.status && (
                  <span
                    className={cn(
                      'ml-1 flex h-3.5 w-3.5 items-center justify-center rounded-full',
                      recipient.status === 'signed'
                        ? 'bg-green-500 text-white'
                        : recipient.status === 'viewed'
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700'
                    )}
                  >
                    {recipient.status === 'signed' && (
                      <CheckIcon className="h-2 w-2" />
                    )}
                    {recipient.status === 'viewed' && (
                      <EyeIcon className="h-2 w-2" />
                    )}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-2 flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground">
            <PaperAirplaneIcon className="h-4 w-4" />
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

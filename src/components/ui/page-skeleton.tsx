'use client';

import React from 'react';

import { cn } from '@udecode/cn';
import { motion } from 'framer-motion';

interface PageSkeletonProps {
  children: React.ReactNode;
  title: string;
  actions?: React.ReactNode;
  animateEntrance?: boolean;
  breadcrumbs?: { href: string; label: string }[];
  className?: string;
  description?: string;
  headerContent?: React.ReactNode;
  isLoading?: boolean;
  tabs?: {
    id: string;
    isActive: boolean;
    label: string;
    onClick: () => void;
  }[];
}

export function PageSkeleton({
  actions,
  animateEntrance = true,
  breadcrumbs,
  children,
  className,
  description,
  headerContent,
  isLoading = false,
  tabs,
  title,
}: PageSkeletonProps) {
  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      transition: {
        damping: 20,
        stiffness: 260,
        type: 'spring',
      },
      y: 0,
    },
  };

  return (
    <motion.div
      className={cn('flex h-full w-full flex-col bg-background', className)}
      animate="visible"
      initial={animateEntrance ? 'hidden' : 'visible'}
      variants={containerVariants}
    >
      {/* Page Header */}
      <motion.div
        className="border-b bg-card px-6 py-4"
        variants={itemVariants}
      >
        <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center text-sm text-muted-foreground">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.href}>
                  {index > 0 && (
                    <span className="mx-2 text-muted-foreground/50">→</span>
                  )}
                  <a
                    className="hover:text-foreground hover:underline"
                    href={crumb.href}
                  >
                    {crumb.label}
                  </a>
                </React.Fragment>
              ))}
            </nav>
          )}

          {/* Title and Actions Row */}
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <motion.h1
                className="text-2xl font-semibold tracking-tight"
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: {
                    opacity: 1,
                    transition: {
                      damping: 30,
                      delay: 0.2,
                      stiffness: 300,
                      type: 'spring',
                    },
                    x: 0,
                  },
                }}
              >
                {title}
              </motion.h1>
              {description && (
                <motion.p
                  className="mt-1 text-sm text-muted-foreground"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { delay: 0.3 },
                    },
                  }}
                >
                  {description}
                </motion.p>
              )}
            </div>
            {actions && (
              <motion.div
                className="flex flex-wrap items-center gap-2"
                variants={{
                  hidden: { opacity: 0, scale: 0.9 },
                  visible: {
                    opacity: 1,
                    scale: 1,
                    transition: {
                      damping: 20,
                      delay: 0.4,
                      stiffness: 260,
                      type: 'spring',
                    },
                  },
                }}
              >
                {actions}
              </motion.div>
            )}
          </div>

          {/* Tabs if available */}
          {tabs && tabs.length > 0 && (
            <motion.div className="mt-2 border-b" variants={itemVariants}>
              <div className="-mb-px flex space-x-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={cn(
                      'inline-flex items-center border-b-2 px-1 py-3 text-sm font-medium transition-colors',
                      tab.isActive
                        ? 'border-primary text-foreground'
                        : 'border-transparent text-muted-foreground hover:border-muted hover:text-foreground'
                    )}
                    onClick={tab.onClick}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Optional header content */}
          {headerContent && (
            <motion.div className="mt-4" variants={itemVariants}>
              {headerContent}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Page Content */}
      <motion.div
        className="flex-1 overflow-auto px-6 py-6"
        variants={itemVariants}
      >
        <div className="mx-auto h-full w-full max-w-screen-2xl">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

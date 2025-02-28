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
  // Premium animation variants with refined timing
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.03,
        ease: [0.25, 0.1, 0.25, 1], // Custom cubic bezier for premium feel
        staggerChildren: 0.06,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      transition: {
        damping: 22,
        mass: 0.9,
        stiffness: 260,
        type: 'spring',
      },
      y: 0,
    },
  };

  return (
    <motion.div
      className={cn(
        'flex h-full w-full flex-col bg-background/80 backdrop-blur-sm',
        className
      )}
      animate="visible"
      initial={animateEntrance ? 'hidden' : 'visible'}
      variants={containerVariants}
    >
      {/* Premium Page Header with refined elevation and spacing */}
      <motion.div
        className="border-b border-border/60 bg-card/90 px-4 py-3.5 shadow-sm backdrop-blur-sm sm:px-6"
        variants={itemVariants}
      >
        <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-2.5">
          {/* Breadcrumbs with premium styling */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <motion.nav
              className="flex items-center text-xs font-medium tracking-wide text-muted-foreground/80"
              transition={{ delay: 0.1 }}
              variants={itemVariants}
            >
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.href}>
                  {index > 0 && (
                    <span className="mx-1.5 text-muted-foreground/30">
                      <svg
                        className="h-2.5 w-2.5"
                        fill="none"
                        height="16"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        width="16"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </span>
                  )}
                  <a
                    className="transition-all duration-200 hover:text-foreground hover:underline hover:underline-offset-4"
                    href={crumb.href}
                  >
                    {crumb.label}
                  </a>
                </React.Fragment>
              ))}
            </motion.nav>
          )}

          {/* Title and Actions Row with premium spacing and alignment */}
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex-1 space-y-1">
              <motion.h1
                className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-xl font-semibold tracking-tight text-transparent sm:text-2xl"
                variants={itemVariants}
              >
                {title}
              </motion.h1>
              {description && (
                <motion.p
                  className="text-sm leading-relaxed font-medium text-muted-foreground/90"
                  variants={itemVariants}
                >
                  {description}
                </motion.p>
              )}
            </div>
            {actions && (
              <motion.div
                className="flex items-center gap-2"
                transition={{ delay: 0.05 }}
                variants={itemVariants}
              >
                {actions}
              </motion.div>
            )}
          </div>

          {/* Premium Tab Design */}
          {tabs && tabs.length > 0 && (
            <motion.div
              className="mt-2"
              transition={{ delay: 0.1 }}
              variants={itemVariants}
            >
              <div className="flex space-x-5">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={cn(
                      'group relative px-1 py-2.5 text-sm font-medium tracking-wide transition-all duration-200',
                      tab.isActive
                        ? 'text-foreground'
                        : 'text-muted-foreground/70 hover:text-foreground/90'
                    )}
                    onClick={tab.onClick}
                  >
                    {tab.label}
                    <span
                      className={cn(
                        'absolute bottom-0 left-0 h-[2px] w-full transform-gpu transition-all duration-300',
                        tab.isActive
                          ? 'bg-gradient-to-r from-primary to-primary/80 opacity-100'
                          : 'bg-muted/40 opacity-0 group-hover:opacity-40'
                      )}
                    />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Optional header content with premium spacing */}
          {headerContent && (
            <motion.div
              className="mt-4"
              transition={{ delay: 0.15 }}
              variants={itemVariants}
            >
              {headerContent}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Premium Content Area */}
      <motion.div
        className="flex-1 overflow-auto px-4 py-5 sm:px-6 sm:py-6"
        variants={itemVariants}
      >
        <div className="mx-auto h-full w-full max-w-screen-2xl">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="relative h-7 w-7">
                  <div className="absolute h-full w-full animate-ping rounded-full bg-primary/10 opacity-75"></div>
                  <div className="absolute h-full w-full animate-spin rounded-full border-2 border-muted-foreground/20 border-t-primary"></div>
                </div>
                <p className="text-xs font-medium tracking-wide text-muted-foreground/80">
                  Loading your data...
                </p>
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

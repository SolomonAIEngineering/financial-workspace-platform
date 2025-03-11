'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from './breadcrumb';
import React, { useEffect, useState } from 'react';

import { cn } from '@udecode/cn';

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
  // Track scroll position for parallax effects
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Enhanced animation variants with ultra-smooth timing
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.015,
        ease: [0.2, 0.01, 0.21, 1], // Ultra-smooth cubic bezier
        staggerChildren: 0.035,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: {
      opacity: 1,
      transition: {
        damping: 28,
        mass: 0.7,
        stiffness: 300,
        type: 'spring',
      },
      y: 0,
    },
  };

  // Subtle hover animations for interactive elements
  const buttonHoverVariants = {
    hover: { scale: 1.02, transition: { duration: 0.2 } },
    tap: { scale: 0.98, transition: { duration: 0.1 } },
  };

  return (
    <motion.div
      className={cn(
        'flex h-full w-full flex-col bg-gradient-to-b from-background/98 to-background/95 backdrop-blur-[2.5px]',
        className
      )}
      animate="visible"
      initial={animateEntrance ? 'hidden' : 'visible'}
      variants={containerVariants}
      style={{
        backgroundPosition: `center ${scrollY * 0.05}px`, // Subtle parallax effect
      }}
    >
      {/* Exquisite Header with premium glass effect */}
      <motion.div
        className="relative border-b border-border/30 bg-card/75 px-4 py-3.5 backdrop-blur-xl sm:px-6"
        variants={itemVariants}
        style={{
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.02), 0 1px 2px 0 rgba(0, 0, 0, 0.01)',
        }}
      >
        {/* Decorative accent line */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0" />

        <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-2">
          {/* Refined Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <motion.div
              variants={itemVariants}
              transition={{ delay: 0.05 }}
              className="overflow-hidden"
            >
              <Breadcrumb>
                <BreadcrumbList className="text-xs">
                  {breadcrumbs.map((crumb, index) => (
                    <BreadcrumbItem key={crumb.href}>
                      <BreadcrumbLink
                        href={crumb.href}
                        className="text-xs font-medium text-muted-foreground/80 hover:text-foreground transition-colors duration-200"
                      >
                        {crumb.label}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </motion.div>
          )}

          {/* Elegant Title and Actions Row */}
          <div className="flex flex-col items-start justify-between gap-2.5 sm:flex-row sm:items-center">
            <div className="flex-1 space-y-1">
              <motion.h1
                className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-xl font-semibold tracking-tight text-transparent sm:text-2xl"
                variants={itemVariants}
                style={{
                  letterSpacing: '-0.01em',
                  textShadow: '0 0 transparent'
                }}
              >
                {title}
              </motion.h1>
              {description && (
                <motion.p
                  className="text-sm leading-relaxed text-muted-foreground/90 max-w-2xl"
                  variants={itemVariants}
                >
                  {description}
                </motion.p>
              )}
            </div>

            {actions && (
              <motion.div
                className="flex items-center gap-2.5"
                transition={{ delay: 0.03 }}
                variants={itemVariants}
                whileHover="hover"
                whileTap="tap"
              >
                {actions}
              </motion.div>
            )}
          </div>

          {/* Premium Tab Design */}
          {tabs && tabs.length > 0 && (
            <motion.div
              className="mt-4 overflow-hidden"
              transition={{ delay: 0.07 }}
              variants={itemVariants}
            >
              <div className="flex space-x-7 border-b border-border/10 pb-px">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    className={cn(
                      'group relative px-1 pb-2.5 pt-1 text-sm font-medium tracking-wide transition-all duration-200',
                      tab.isActive
                        ? 'text-foreground'
                        : 'text-muted-foreground/70 hover:text-foreground/90'
                    )}
                    onClick={tab.onClick}
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonHoverVariants}
                  >
                    {tab.label}
                    <span
                      className={cn(
                        'absolute bottom-0 left-0 h-[2px] w-full transform-gpu rounded-full transition-all duration-300 ease-out',
                        tab.isActive
                          ? 'bg-gradient-to-r from-primary/90 via-primary to-primary/80 opacity-100'
                          : 'bg-muted/30 opacity-0 group-hover:opacity-30'
                      )}
                    />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Optional header content with improved spacing */}
          {headerContent && (
            <motion.div
              className="mt-4"
              transition={{ delay: 0.1 }}
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
        transition={{ delay: 0.12 }}
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(var(--primary-rgb), 0.01), transparent 700px)'
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isLoading ? 'loading' : 'content'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mx-auto h-full w-full max-w-screen-2xl"
          >
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <motion.div
                  className="flex flex-col items-center gap-3"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative h-10 w-10">
                    {/* Loading spinner with pulsing effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-background to-background/70"></div>
                    <div className="absolute inset-0 animate-pulse rounded-full bg-primary/5 opacity-75"></div>
                    <div className="absolute inset-1 animate-spin rounded-full border border-muted-foreground/5 border-t-primary/60"></div>
                    <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/70 shadow-sm shadow-primary/20"></div>

                    {/* Decorative orbital accent */}
                    <div className="absolute inset-0 rounded-full border border-primary/10 opacity-80"></div>
                  </div>
                  <motion.p
                    className="text-xs font-medium tracking-wide text-muted-foreground/90"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Loading...
                  </motion.p>
                </motion.div>
              </div>
            ) : (
              children
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

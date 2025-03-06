'use client';

import React from 'react';

import {
  BeakerIcon,
  BoltIcon,
  ClockIcon,
  DocumentTextIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@udecode/cn';
import { motion } from 'framer-motion';

interface FeatureDevelopmentProps {
  className?: string;
  description?: string;
  estimatedTime?: string;
  title?: string;
}

export function FeatureDevelopment({
  className,
  description = "We're working hard to bring you the best document sending experience. This feature is currently in development.",
  estimatedTime = 'Expected release: Q2 2025',
  title = 'Document Sending Coming Soon',
}: FeatureDevelopmentProps) {
  return (
    <motion.div
      className={cn(
        'flex h-full flex-col items-center justify-center text-center',
        className
      )}
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex max-w-md flex-col items-center px-6 py-12">
        <div className="relative mb-10">
          <motion.div
            className="flex h-24 w-24 items-center justify-center rounded-full border border-black/10 bg-black/5 backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
            animate={{
              boxShadow: [
                '0 0 0 rgba(0,0,0,0)',
                '0 0 20px rgba(0,0,0,0.1)',
                '0 0 0 rgba(0,0,0,0)',
              ],
              rotate: 0,
              scale: 1,
            }}
            initial={{ rotate: -10, scale: 0.8 }}
            transition={{
              boxShadow: {
                duration: 3,
                repeat: Infinity,
              },
              damping: 12,
              stiffness: 100,
              type: 'spring',
            }}
          >
            <RocketLaunchIcon className="h-12 w-12 text-black dark:text-white" />
          </motion.div>

          <motion.div
            className="absolute -top-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full border border-black/5 bg-zinc-100 shadow-md dark:border-white/5 dark:bg-zinc-800"
            animate={{ scale: 1, x: 0 }}
            initial={{ scale: 0, x: 10 }}
            transition={{
              damping: 10,
              delay: 0.3,
              stiffness: 100,
              type: 'spring',
            }}
          >
            <ClockIcon className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
          </motion.div>

          <motion.div
            className="absolute -bottom-2 -left-3 flex h-12 w-12 items-center justify-center rounded-full border border-black/5 bg-zinc-100 shadow-md dark:border-white/5 dark:bg-zinc-800"
            animate={{ scale: 1, y: 0 }}
            initial={{ scale: 0, y: 10 }}
            transition={{
              damping: 10,
              delay: 0.5,
              stiffness: 100,
              type: 'spring',
            }}
          >
            <BeakerIcon className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
          </motion.div>
        </div>

        <motion.h2
          className="mb-4 bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-2xl font-bold text-transparent dark:from-white dark:to-zinc-400"
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.2 }}
        >
          {title}
        </motion.h2>

        <motion.p
          className="mb-8 text-lg text-muted-foreground"
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          transition={{ delay: 0.4 }}
        >
          {description}
        </motion.p>

        <motion.div
          className="flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-5 py-2.5 text-sm font-medium backdrop-blur-md dark:border-white/10 dark:bg-white/5"
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
        >
          <ClockIcon className="h-4 w-4" />
          {estimatedTime}
        </motion.div>

        <motion.div
          className="mt-12 w-full space-y-4"
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          transition={{ delay: 0.8 }}
        >
          {[
            {
              description: 'End-to-end encryption for all your documents',
              icon: ShieldCheckIcon,
              title: 'Secure',
            },
            {
              description: 'Optimized for quick sending and signing',
              icon: BoltIcon,
              title: 'Fast',
            },
            {
              description: 'Intuitive interface for all users',
              icon: DocumentTextIcon,
              title: 'Simple',
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white/50 p-4 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-black/20"
              animate={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: -20 }}
              transition={{ delay: 0.8 + index * 0.15 }}
              whileHover={{
                borderColor: 'rgba(0, 0, 0, 0.2)',
                boxShadow:
                  '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                y: -2,
              }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black/5 dark:bg-white/5">
                <feature.icon className="h-5 w-5 text-black dark:text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium text-foreground">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-12 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-zinc-300 to-transparent dark:via-zinc-700"
          animate={{ opacity: 1, width: 128 }}
          initial={{ opacity: 0, width: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        />
      </div>
    </motion.div>
  );
}

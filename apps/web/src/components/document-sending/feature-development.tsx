'use client';

import {
  BeakerIcon,
  BoltIcon,
  ClockIcon,
  DocumentTextIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

import React from 'react';
import { cn } from '@udecode/cn';
import { motion } from 'framer-motion';

export interface FeatureCard {
  title: string;
  description: string;
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
}

interface FeatureDevelopmentProps {
  className?: string;
  description?: string;
  estimatedTime?: string;
  title?: string;
  featureCards?: FeatureCard[];
}

export function FeatureDevelopment({
  className,
  description = "We're working hard to bring you the best document sending experience. This feature is currently in development.",
  estimatedTime = 'Expected release: Q2 2025',
  title = 'Document Sending Coming Soon',
  featureCards = [
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
  ],
}: FeatureDevelopmentProps) {
  return (
    <motion.div
      className={cn(
        'flex h-full w-full flex-col items-center justify-center text-center',
        className
      )}
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex max-w-4xl flex-col items-center px-6 py-8 md:py-12">
        {/* Animated Feature Icon with Particles */}
        <div className="relative mb-12">
          <motion.div
            className="flex h-28 w-28 items-center justify-center rounded-2xl border border-border/50 bg-gradient-to-br from-background/90 to-background backdrop-blur-xl"
            animate={{
              boxShadow: [
                '0 0 0 rgba(0,0,0,0)',
                '0 0 25px rgba(var(--primary-rgb), 0.15)',
                '0 0 0 rgba(0,0,0,0)',
              ],
              rotate: 0,
              scale: 1,
            }}
            initial={{ rotate: -5, scale: 0.9 }}
            transition={{
              boxShadow: {
                duration: 4,
                repeat: Infinity,
              },
              damping: 15,
              stiffness: 90,
              type: 'spring',
            }}
          >
            <RocketLaunchIcon className="h-14 w-14 text-primary/90" />

            {/* Decorative particles */}
            <motion.div
              className="absolute -top-2 -right-2 h-3 w-3 rounded-full bg-primary/80"
              animate={{
                opacity: [0.4, 1, 0.4],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className="absolute -top-5 right-8 h-2 w-2 rounded-full bg-primary/50"
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.3, 1],
              }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            />
            <motion.div
              className="absolute top-10 -left-4 h-2.5 w-2.5 rounded-full bg-primary/60"
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.4, 1],
              }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
            />
          </motion.div>

          <motion.div
            className="absolute -top-3 -right-3 flex h-12 w-12 items-center justify-center rounded-full border border-border/20 bg-card/90 shadow-lg backdrop-blur-md"
            animate={{ scale: 1, x: 0 }}
            initial={{ scale: 0, x: 10 }}
            transition={{
              damping: 12,
              delay: 0.3,
              stiffness: 100,
              type: 'spring',
            }}
          >
            <ClockIcon className="h-6 w-6 text-foreground/80" />
          </motion.div>

          <motion.div
            className="absolute -bottom-3 -left-3 flex h-14 w-14 items-center justify-center rounded-full border border-border/20 bg-card/90 shadow-lg backdrop-blur-md"
            animate={{ scale: 1, y: 0 }}
            initial={{ scale: 0, y: 10 }}
            transition={{
              damping: 12,
              delay: 0.5,
              stiffness: 100,
              type: 'spring',
            }}
          >
            <BeakerIcon className="h-7 w-7 text-foreground/80" />
          </motion.div>
        </div>

        {/* Title with gradient text */}
        <motion.h2
          className="mb-4 bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-3xl font-bold tracking-tight text-transparent"
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {title}
        </motion.h2>

        {/* Description with enhanced typography */}
        <motion.p
          className="mb-8 max-w-2xl text-lg leading-relaxed text-muted-foreground"
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          transition={{ delay: 0.4 }}
        >
          {description}
        </motion.p>

        {/* Estimated time badge with hover effect */}
        <motion.div
          className="flex items-center gap-2 rounded-full border border-border/50 bg-background/50 px-5 py-2.5 text-sm font-medium shadow-sm backdrop-blur-xl"
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.6 }}
          whileHover={{
            scale: 1.03,
            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
            borderColor: 'rgba(var(--primary-rgb), 0.2)',
          }}
        >
          <ClockIcon className="h-4 w-4 text-primary/80" />
          <span>{estimatedTime}</span>
        </motion.div>

        {/* Feature cards with enhanced animations */}
        <motion.div
          className="mt-14 grid w-full grid-cols-1 gap-4 sm:grid-cols-3"
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          transition={{ delay: 0.8 }}
        >
          {featureCards.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="flex flex-col items-center gap-4 rounded-xl border border-border/50 bg-card/40 p-5 shadow-sm backdrop-blur-md"
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.8 + index * 0.15 }}
              whileHover={{
                y: -4,
                boxShadow: '0 15px 30px -10px rgba(0, 0, 0, 0.1)',
                borderColor: 'rgba(var(--primary-rgb), 0.2)',
                backgroundColor: 'rgba(var(--card-rgb), 0.6)',
              }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 text-center">
                <h3 className="mb-1 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Decorative divider with pulse effect */}
        <motion.div
          className="relative mt-16 h-0.5 w-24"
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          transition={{ delay: 1.2 }}
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-primary/30 to-transparent"
            animate={{
              opacity: [0.5, 1, 0.5],
              width: ['100%', '120%', '100%'],
              left: ['0%', '-10%', '0%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>

        {/* Coming soon label */}
        <motion.div
          className="mt-6 flex items-center gap-1.5 text-xs tracking-widest text-muted-foreground/70 uppercase"
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          transition={{ delay: 1.4 }}
        >
          <SparklesIcon className="h-3 w-3" />
          <span>Coming soon</span>
          <SparklesIcon className="h-3 w-3" />
        </motion.div>
      </div>
    </motion.div>
  );
}

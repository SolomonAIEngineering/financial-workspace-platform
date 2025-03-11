'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  BanknotesIcon,
  TagIcon,
  MagnifyingGlassIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';

import { FeatureDevelopment, type FeatureCard } from '@/components/document-sending/feature-development';
import { PageSkeleton } from '@/components/ui/page-skeleton';

export default function TransactionsPage() {
  return (
    <PageSkeleton
      description="Monitor, categorize, and analyze all your financial transactions in one unified interface."
      title="Transaction Management"
      breadcrumbs={[
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/transactions', label: 'Transaction Management' },
      ]}
      actions={
        <motion.div
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border/40 bg-background/80 px-3.5 py-2 text-sm font-medium shadow-sm backdrop-blur-md transition-all duration-200"
          whileHover={{ scale: 1.02, borderColor: 'rgba(var(--primary-rgb), 0.3)' }}
          whileTap={{ scale: 0.98 }}
        >
          <BanknotesIcon className="h-4 w-4 text-primary/80" />
          <span>Request Beta</span>
        </motion.div>
      }
    >
      <FeatureDevelopment
        description="We're building a powerful transaction management system with automatic categorization, custom tagging, and detailed analytics. Search, filter, and gain valuable insights from your transaction history to optimize your financial operations."
        title="Smart Transaction System"
        estimatedTime="Expected release: Q2 2024"
        featureCards={[
          {
            description: 'Automatically categorize transactions for easy tracking',
            icon: TagIcon,
            title: 'Smart Categorization',
          },
          {
            description: 'Advanced search and filtering capabilities',
            icon: MagnifyingGlassIcon,
            title: 'Powerful Search',
          },
          {
            description: 'Track money flow between accounts and external parties',
            icon: ArrowsRightLeftIcon,
            title: 'Flow Tracking',
          },
        ]}
      />
    </PageSkeleton>
  );
}

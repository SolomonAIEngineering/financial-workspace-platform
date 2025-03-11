'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  DocumentDuplicateIcon,
  BellIcon,
  CreditCardIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

import { FeatureDevelopment, type FeatureCard } from '@/components/document-sending/feature-development';
import { PageSkeleton } from '@/components/ui/page-skeleton';

export default function InvoicesPage() {
  return (
    <PageSkeleton
      description="Create professional invoices, track payments, and manage your accounts receivable efficiently."
      title="Invoice Management"
      breadcrumbs={[
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/invoices', label: 'Invoice Management' },
      ]}
      actions={
        <motion.div
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border/40 bg-background/80 px-3.5 py-2 text-sm font-medium shadow-sm backdrop-blur-md transition-all duration-200"
          whileHover={{ scale: 1.02, borderColor: 'rgba(var(--primary-rgb), 0.3)' }}
          whileTap={{ scale: 0.98 }}
        >
          <DocumentDuplicateIcon className="h-4 w-4 text-primary/80" />
          <span>Join Waitlist</span>
        </motion.div>
      }
    >
      <FeatureDevelopment
        description="Our invoice management system will streamline your billing workflow with beautiful templates, automated payment reminders, and real-time tracking. Generate detailed reports, integrate with payment processors, and improve your cash flow management."
        title="Intelligent Invoice System"
        estimatedTime="Expected release: Q1 2024"
        featureCards={[
          {
            description: 'Beautiful, professional invoice templates ready to use',
            icon: DocumentDuplicateIcon,
            title: 'Professional Templates',
          },
          {
            description: 'Automated reminders for overdue payments',
            icon: BellIcon,
            title: 'Smart Reminders',
          },
          {
            description: 'Integrate with popular payment processors for faster payments',
            icon: CreditCardIcon,
            title: 'Payment Integration',
          },
        ]}
      />
    </PageSkeleton>
  );
}


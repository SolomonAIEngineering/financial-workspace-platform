'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  UserCircleIcon,
  ChartBarIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

import { FeatureDevelopment, type FeatureCard } from '@/components/document-sending/feature-development';
import { PageSkeleton } from '@/components/ui/page-skeleton';

export default function CustomersPage() {
  return (
    <PageSkeleton
      description="Manage your customer relationships and gain actionable insights into customer behavior."
      title="Merchant Management"
      breadcrumbs={[
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/customers', label: 'Merchant Management' },
      ]}
      actions={
        <motion.div
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border/40 bg-background/80 px-3.5 py-2 text-sm font-medium shadow-sm backdrop-blur-md transition-all duration-200"
          whileHover={{ scale: 1.02, borderColor: 'rgba(var(--primary-rgb), 0.3)' }}
          whileTap={{ scale: 0.98 }}
        >
          <UserGroupIcon className="h-4 w-4 text-primary/80" />
          <span>Join Waitlist</span>
        </motion.div>
      }
    >
      <FeatureDevelopment
        description="Our merchant management platform helps you build stronger relationships with comprehensive customer profiles, advanced segmentation, and behavior analytics. Understand your customers better and create targeted strategies to improve retention and growth."
        title="Customer Intelligence Platform"
        estimatedTime="Expected release: Q3 2024"
        featureCards={[
          {
            description: 'Comprehensive customer profiles with interaction history',
            icon: UserCircleIcon,
            title: 'Customer 360°',
          },
          {
            description: 'Create custom segments based on behavior and preferences',
            icon: FunnelIcon,
            title: 'Smart Segmentation',
          },
          {
            description: 'Track key customer metrics and identify growth opportunities',
            icon: ChartBarIcon,
            title: 'Behavioral Analytics',
          },
        ]}
      />
    </PageSkeleton>
  );
}

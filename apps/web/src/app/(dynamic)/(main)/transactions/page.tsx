'use client';

import {
  ArrowsRightLeftIcon,
  BanknotesIcon,
  MagnifyingGlassIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

import {
  FeatureDevelopment
} from '@/components/document-sending/feature-development';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { WaitlistFeature } from '@/components/waitlist/waitlist-feature';

export default function TransactionsPage() {
  const featureName = 'Transaction Management';

  return (
    <PageSkeleton
      description="Monitor, categorize, and analyze all your financial transactions in one unified interface."
      title="Transaction Management"
      breadcrumbs={[
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/transactions', label: 'Transaction Management' },
      ]}
      actions={
        <WaitlistFeature featureName={featureName} buttonIcon={BanknotesIcon} />
      }
    >
      <FeatureDevelopment
        description="We're building a powerful transaction management system with automatic categorization, custom tagging, and detailed analytics. Search, filter, and gain valuable insights from your transaction history to optimize your financial operations."
        title="Smart Transaction System"
        estimatedTime="Expected release: Q2 2025"
        featureCards={[
          {
            description:
              'Automatically categorize transactions for easy tracking',
            icon: TagIcon,
            title: 'Smart Categorization',
          },
          {
            description: 'Advanced search and filtering capabilities',
            icon: MagnifyingGlassIcon,
            title: 'Powerful Search',
          },
          {
            description:
              'Track money flow between accounts and external parties',
            icon: ArrowsRightLeftIcon,
            title: 'Flow Tracking',
          },
        ]}
      />
    </PageSkeleton>
  );
}

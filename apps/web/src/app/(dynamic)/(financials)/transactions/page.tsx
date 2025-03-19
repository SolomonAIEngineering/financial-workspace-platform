'use client';

import {
  ArrowsRightLeftIcon,
  MagnifyingGlassIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { ForwardRefExoticComponent, SVGProps } from 'react';

import { FeatureDevelopment } from '@/components/document-sending/feature-development';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { WaitlistFeature } from '@/components/waitlist/waitlist-feature';
import { routes } from '@/lib/navigation/routes';

export default function TransactionsPage() {
  const featureName = 'Transaction Management';

  return (
    <PageSkeleton
      description="Monitor, categorize, and analyze all your financial transactions in one unified interface."
      title="Transaction Management"
      breadcrumbs={[
        { href: routes.dashboard(), label: 'Dashboard' },
        { href: routes.transactions(), label: 'Transaction Management' },
      ]}
      actions={<WaitlistFeature featureName={featureName} />}
    >
      <FeatureDevelopment
        description="We're building a powerful transaction management system with automatic categorization, custom tagging, and detailed analytics. Search, filter, and gain valuable insights from your transaction history to optimize your financial operations."
        title="Smart Transaction System"
        estimatedTime="Expected release: Q2 2025"
        featureCards={[
          {
            description:
              'Automatically categorize transactions for easy tracking',
            icon: TagIcon as ForwardRefExoticComponent<SVGProps<SVGSVGElement>>,
            title: 'Smart Categorization',
          },
          {
            description: 'Advanced search and filtering capabilities',
            icon: MagnifyingGlassIcon as ForwardRefExoticComponent<
              SVGProps<SVGSVGElement>
            >,
            title: 'Powerful Search',
          },
          {
            description:
              'Track money flow between accounts and external parties',
            icon: ArrowsRightLeftIcon as ForwardRefExoticComponent<
              SVGProps<SVGSVGElement>
            >,
            title: 'Flow Tracking',
          },
        ]}
      />
    </PageSkeleton>
  );
}

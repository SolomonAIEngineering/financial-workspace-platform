'use client';

import {
  ChartBarIcon,
  FunnelIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

import { FeatureDevelopment } from '@/components/document-sending/feature-development';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { WaitlistFeature } from '@/components/waitlist/waitlist-feature';
import { routes } from '@/lib/navigation/routes';

export default function CustomersPage() {
  const featureName = 'Customer Intelligence Platform';

  return (
    <PageSkeleton
      description="Manage your customer relationships and gain actionable insights into customer behavior."
      title="Merchant Management"
      breadcrumbs={[
        { href: routes.dashboard(), label: 'Dashboard' },
        { href: routes.customers(), label: 'Merchant Management' },
      ]}
      actions={
        <WaitlistFeature featureName={featureName} />
      }
    >
      <FeatureDevelopment
        description="Our merchant management platform helps you build stronger relationships with comprehensive customer profiles, advanced segmentation, and behavior analytics. Understand your customers better and create targeted strategies to improve retention and growth."
        title={featureName}
        estimatedTime="Expected release: Q3 2025"
        featureCards={[
          {
            description:
              'Comprehensive customer profiles with interaction history',
            icon: UserCircleIcon,
            title: 'Customer 360°',
          },
          {
            description:
              'Create custom segments based on behavior and preferences',
            icon: FunnelIcon,
            title: 'Smart Segmentation',
          },
          {
            description:
              'Track key customer metrics and identify growth opportunities',
            icon: ChartBarIcon,
            title: 'Behavioral Analytics',
          },
        ]}
      />
    </PageSkeleton>
  );
}

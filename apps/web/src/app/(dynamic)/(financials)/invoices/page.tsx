'use client';

import {
  BellIcon,
  ChartBarIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import { ForwardRefExoticComponent, SVGProps } from 'react';

import { FeatureDevelopment } from '@/components/document-sending/feature-development';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { WaitlistFeature } from '@/components/waitlist/waitlist-feature';
import { routes } from '@/lib/navigation/routes';

export default function InvoicesPage() {
  const featureName = 'Invoice Management';

  return (
    <PageSkeleton
      description="Create professional invoices, track payments, and manage your accounts receivable efficiently."
      title="Invoice Management"
      breadcrumbs={[
        { href: routes.dashboard(), label: 'Dashboard' },
        { href: routes.invoices(), label: 'Invoice Management' },
      ]}
      actions={<WaitlistFeature featureName={featureName} />}
    >
      <FeatureDevelopment
        description="Our invoice management system streamlines your billing process with automated payment reminders, customizable templates, and real-time payment tracking. Create professional invoices in seconds and get paid faster with integrated payment processing."
        title="Invoice Management System"
        estimatedTime="Expected release: Q4 2025"
        featureCards={[
          {
            description:
              'Automated reminders for upcoming and overdue payments',
            icon: BellIcon as ForwardRefExoticComponent<
              SVGProps<SVGSVGElement>
            >,
            title: 'Payment Reminders',
          },
          {
            description: 'Accept payments directly through invoice links',
            icon: CreditCardIcon as ForwardRefExoticComponent<
              SVGProps<SVGSVGElement>
            >,
            title: 'Integrated Payments',
          },
          {
            description: 'Track revenue trends and payment analytics',
            icon: ChartBarIcon as ForwardRefExoticComponent<
              SVGProps<SVGSVGElement>
            >,
            title: 'Invoice Analytics',
          },
        ]}
      />
    </PageSkeleton>
  );
}

import { FeatureDevelopment } from '@/components/document-sending/feature-development';
import { PageSkeleton } from '@/components/ui/page-skeleton';

export default function TransactionsPage() {
  return (
    <PageSkeleton
      description="Monitor, analyze, and manage your transactions with comprehensive analytics and real-time payment insights."
      title="Transaction History"
      breadcrumbs={[
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/transactions', label: 'Transaction History' },
      ]}
    >
      <FeatureDevelopment
        description="We're developing an advanced transaction management system that will provide detailed analytics, transaction tracking, and customizable reporting. This powerful tool will help you gain visibility into your payment flows and make informed business decisions."
        title="Transaction History Coming Soon"
        estimatedTime="Expected release: Q3 2025"
      />
    </PageSkeleton>
  );
}

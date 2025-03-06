import { FeatureDevelopment } from '@/components/document-sending/feature-development';
import { PageSkeleton } from '@/components/ui/page-skeleton';

export default function InvoicesPage() {
  return (
    <PageSkeleton
      description="Create, track, and manage your invoices with comprehensive analytics and real-time payment insights."
      title="Invoice Management"
      breadcrumbs={[
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/invoices', label: 'Invoice Management' },
      ]}
    >
      <FeatureDevelopment
        description="We're developing an advanced invoice management system that will provide detailed analytics, payment tracking, and automated reminders. This powerful tool will help you streamline your financial operations and improve cash flow management."
        title="Invoice Management Coming Soon"
        estimatedTime="Expected release: Q3 2025"
      />
    </PageSkeleton>
  );
}

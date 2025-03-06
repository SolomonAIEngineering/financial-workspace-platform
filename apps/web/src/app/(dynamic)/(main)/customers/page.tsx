import { FeatureDevelopment } from '@/components/document-sending/feature-development';
import { PageSkeleton } from '@/components/ui/page-skeleton';

export default function DocumentSigningPage() {
  return (
    <PageSkeleton
      description="Analyze your customers and gain valuable insights."
      title="Merchant Management"
      breadcrumbs={[
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/customers', label: 'Merchant Management' },
      ]}
    >
      <FeatureDevelopment
        description="We're building a comprehensive customers dashboard to help you make data-driven decisions. Stay tuned for updates on this feature."
        title="Merchant Management Coming Soon"
        estimatedTime="Expected release: Q3 2025"
      />
    </PageSkeleton>
  );
}

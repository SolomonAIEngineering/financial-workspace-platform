import { AssignmentSection } from './assignment-section';
import { CategorizationSection } from './categorization-section';
import { EditModeControls } from './edit-mode-controls';
import { MerchantSection } from './merchant-section';
import { PaymentDetailsSection } from './payment-details-section';
import { TagsSection } from './tags-section';
import { TaxFinancialSection } from './tax-financial-section';
import { Transaction as TransactionData } from '@solomonai/prisma/client';
import { TransactionInfoSection } from './transaction-info-section';
import { TransactionProvider } from './transaction-context';

/** Interface for the TransactionDetails component props. */
interface TransactionDetailsProps {
  transaction: TransactionData;
  onUpdate?: (updatedData: any) => void;
  onDelete?: () => void;
}

/**
 * TransactionDetails component - Main container for all transaction details
 * sections.
 *
 * This component serves as the root wrapper that provides transaction data to
 * all child sections through the TransactionProvider context. Each logical
 * section of transaction data is rendered as a separate component to improve
 * maintainability.
 *
 * The refactoring approach:
 *
 * 1. Created a context (TransactionContext) to share state and functions across
 *    components
 * 2. Divided the large component into smaller section components
 * 3. Created reusable components for rendering fields (FieldRenderer)
 * 4. Added specialized renderers for complex fields (TagsField)
 * 5. Extracted the edit mode controls to its own component
 *
 * This approach significantly improves:
 *
 * - Code organization and readability
 * - Component reusability
 * - Maintainability (changes to one section don't affect others)
 * - Testing (each component can be tested independently)
 *
 * @param {TransactionDetailsProps} props - Component props
 * @returns {JSX.Element} The complete transaction details view
 */
export function TransactionDetails({
  transaction,
  onUpdate,
  onDelete,
}: TransactionDetailsProps) {
  return (
    <TransactionProvider transaction={transaction} onUpdate={onUpdate}>
      <div className="space-y-1">
        <EditModeControls onDelete={onDelete} />
        <AssignmentSection />
        <TransactionInfoSection />
        <MerchantSection />
        <CategorizationSection />
        <TagsSection />
        <PaymentDetailsSection />
        <TaxFinancialSection />
        {/* 
          Additional sections can be created following the same pattern:
          - LocationSection (when geographic data is present)
          - RecurringInfoSection (for recurring transactions)
          - SplitTransactionSection (for split transactions)
          - AnalyticsSection (for analytics and insights)
          - StatusSection (for transaction status details)
          - SystemInfoSection (for system metadata)
          - CustomFieldsSection (for custom fields) 
        */}
      </div>
    </TransactionProvider>
  );
}

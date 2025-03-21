import * as React from 'react';

import {
  BarChart4,
  Calendar,
  CreditCard,
  FileClock,
  Flag,
  Globe,
  Hash,
  HelpCircle,
  Info,
  Lock,
  MapPin,
  Receipt,
  Tag,
  User,
  Wallet,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/registry/default/potion-ui/tooltip';

import { DetailRow } from './detail-row';
import { PropertiesGrid } from './properties-grid';
import { TransactionCategory } from '@/server/types/prisma';
import { TransactionSection } from './transaction-section';
import { fieldDescriptions } from './field-descriptions';
import { formatDate } from './utils';
import { sectionDescriptions } from './section-descriptions';

/**
 * Interface for the TransactionDetails component props.
 *
 * @property {Object} transaction - The transaction object containing all
 *   transaction data
 * @interface TransactionDetailsProps
 */
interface TransactionDetailsProps {
  transaction: {
    id: string;
    userId: string;
    bankAccountId: string;
    plaidTransactionId: string | null;
    amount: number;
    isoCurrencyCode: string | null;
    date: Date | string;
    name: string;
    merchantName: string | null;
    description: string | null;
    pending: boolean;
    category: TransactionCategory | null;
    subCategory: string | null;
    customCategory: string | null;
    merchantId: string | null;
    merchantLogoUrl: string | null;
    merchantCategory: string | null;
    merchantWebsite: string | null;
    merchantPhone: string | null;
    merchantAddress: string | null;
    merchantCity: string | null;
    merchantState: string | null;
    merchantZip: string | null;
    merchantCountry: string | null;
    location?: Record<string, unknown> | null;
    latitude: number | null;
    longitude: number | null;
    paymentChannel: string | null;
    paymentMethod: string | null;
    paymentProcessor: string | null;
    paymentGateway: string | null;
    transactionReference: string | null;
    authorizationCode: string | null;
    checkNumber: string | null;
    wireReference: string | null;
    accountNumber: string | null;
    cardType: string | null;
    cardNetwork: string | null;
    cardLastFour: string | null;
    originalDescription: string | null;
    originalCategory: string | null;
    originalMerchantName: string | null;
    fiscalYear: number | null;
    fiscalMonth: number | null;
    fiscalQuarter: number | null;
    vatAmount: number | null;
    vatRate: number | null;
    taxAmount: number | null;
    taxRate: number | null;
    taxDeductible: boolean;
    taxExempt: boolean;
    taxCategory: string | null;
    status: string | null;
    transactionType: string | null;
    transactionMethod: string | null;
    transactionChannel: string | null;
    budgetCategory: string | null;
    budgetSubcategory: string | null;
    budgetId: string | null;
    plannedExpense: boolean;
    discretionary: boolean;
    needsWantsCategory: string | null;
    spendingGoalId: string | null;
    investmentCategory: string | null;
    businessPurpose: string | null;
    costCenter: string | null;
    projectCode: string | null;
    reimbursable: boolean;
    clientId: string | null;
    invoiceId: string | null;
    excludeFromBudget: boolean;
    isRecurring: boolean;
    recurrenceId: string | null;
    recurringFrequency: string | null;
    recurringDay: number | null;
    estimatedNextDate: Date | string | null;
    similarTransactions: number | null;
    cashFlowCategory: string | null;
    cashFlowType: string | null;
    inflationCategory: string | null;
    confidenceScore: number | null;
    anomalyScore: number | null;
    insightTags: string[];
    isManual: boolean;
    isModified: boolean;
    isVerified: boolean;
    isFlagged: boolean;
    isHidden: boolean;
    isLocked: boolean;
    isReconciled: boolean;
    needsAttention: boolean;
    reviewStatus: string | null;
    userNotes: string | null;
    tags: string[];
    notes: string | null;
    customFields: Record<string, unknown> | null;
    labels: string[];
    parentTransactionId: string | null;
    isSplit: boolean;
    splitTotal: number | null;
    splitCount: number | null;
    searchableText: string | null;
    dateYear: number | null;
    dateMonth: number | null;
    dateDay: number | null;
    dateDayOfWeek: number | null;
    dateWeekOfYear: number | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    importedAt: Date | string | null;
    lastReviewedAt: Date | string | null;
    lastModifiedAt: Date | string | null;
    lastCategorizedAt: Date | string | null;
    categorySlug: string | null;
    frequency: string | null;
    internal: boolean | null;
    notified: boolean | null;
    baseAmount: number | null;
    baseCurrency: string | null;
    recurringTransactionId: string | null;
  };
}

/**
 * SubheadingWithTooltip component - Renders a subheading with optional tooltip.
 *
 * This internal helper component displays a subheading label with an optional
 * tooltip that provides additional context. When a tooltip is provided, it also
 * displays a help icon that users can hover over to see the tooltip content.
 *
 * @param {Object} props - Component props
 * @param {string} props.label - The text to display as the subheading
 * @param {string} [props.tooltip] - Optional tooltip text to display on hover
 * @returns {JSX.Element} The rendered subheading component
 * @component
 */
function SubheadingWithTooltip({
  label,
  tooltip,
}: {
  label: string;
  tooltip?: string;
}) {
  if (!tooltip) {
    return <p className="mb-2 text-xs text-muted-foreground">{label}</p>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="mb-2 flex cursor-help items-center gap-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <HelpCircle className="h-3 w-3 text-muted-foreground/70" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * TransactionDetails component - Comprehensive display of all transaction
 * information.
 *
 * This component is the primary container for displaying detailed transaction
 * information. It organizes transaction data into logical sections using
 * TransactionSection components, and provides tooltips for both section headers
 * and individual fields to help users understand the data.
 *
 * The component handles various data types and formats, including:
 *
 * - Basic transaction information (amount, date, type)
 * - Merchant details with contact information
 * - Categorization information for budgeting and financial analysis
 * - Payment details including card information
 * - Tax and financial classification
 * - Geographic location data
 * - Recurring transaction patterns
 * - Transaction properties and flags
 *
 * Each section and field includes appropriate tooltips using the
 * fieldDescriptions and sectionDescriptions constants to provide consistent,
 * helpful context.
 *
 * @example
 *   ```tsx
 *   <TransactionDetails transaction={selectedTransaction} />
 *   ```;
 *
 * @param {TransactionDetailsProps} props - Component props
 * @param {Object} props.transaction - The transaction object containing all
 *   transaction data
 * @returns {JSX.Element} The rendered transaction details component
 * @component
 */
export function TransactionDetails({ transaction }: TransactionDetailsProps) {
  /**
   * Formats a monetary amount with the appropriate currency symbol.
   *
   * @param {number} amount - The amount to format
   * @param {string | null} [currency] - Optional currency code (defaults to
   *   USD)
   * @returns {string} The formatted amount string
   */
  const formatAmount = (amount: number, currency?: string | null) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  /**
   * Formats a date or datetime value consistently.
   *
   * @param {Date | string | null} date - The date to format
   * @returns {string} The formatted date string or '-' if null
   */
  const formatDateTime = (date: Date | string | null) => {
    if (!date) return '-';
    return formatDate(date);
  };

  return (
    <div className="space-y-1">
      {/* Basic Transaction Information */}
      <TransactionSection
        title="Transaction Information"
        icon={<Info className="h-4 w-4" />}
        defaultOpen={true}
        tooltip={sectionDescriptions.transactionInformation}
      >
        <div className="space-y-1">
          <DetailRow
            label="ID"
            value={transaction.id}
            tooltip={fieldDescriptions.id}
            monospace
          />
          <DetailRow
            label="Name"
            value={transaction.name}
            tooltip={fieldDescriptions.name}
          />
          <DetailRow
            label="Amount"
            value={formatAmount(
              transaction.amount,
              transaction.isoCurrencyCode
            )}
            tooltip={fieldDescriptions.amount}
            isAmount
            amountType={transaction.amount > 0 ? 'positive' : 'negative'}
          />
          <DetailRow
            label="Date"
            value={formatDateTime(transaction.date)}
            tooltip={fieldDescriptions.date}
          />
          <DetailRow
            label="Status"
            value={transaction.pending ? 'Pending' : 'Completed'}
            tooltip={fieldDescriptions.status}
            isBadge
            badgeType={transaction.pending ? 'warning' : 'success'}
          />
          <DetailRow
            label="Description"
            value={transaction.description || '-'}
            tooltip={fieldDescriptions.description}
          />
          {transaction.notes && (
            <DetailRow
              label="Notes"
              value={transaction.notes}
              tooltip={fieldDescriptions.notes}
            />
          )}
        </div>
      </TransactionSection>

      {/* Merchant Information */}
      <TransactionSection
        title="Merchant Details"
        icon={<User className="h-4 w-4" />}
        defaultOpen={!!transaction.merchantName}
        tooltip={sectionDescriptions.merchantDetails}
      >
        <div className="space-y-1">
          <DetailRow
            label="Merchant Name"
            value={transaction.merchantName || '-'}
            tooltip={fieldDescriptions.merchantName}
          />
          <DetailRow
            label="Merchant ID"
            value={transaction.merchantId || '-'}
            tooltip={fieldDescriptions.merchantId}
            monospace
          />
          <DetailRow
            label="Merchant Category"
            value={transaction.merchantCategory || '-'}
            tooltip={fieldDescriptions.merchantCategory}
          />
          {transaction.merchantWebsite && (
            <DetailRow
              label="Website"
              value={transaction.merchantWebsite}
              tooltip={fieldDescriptions.merchantWebsite}
              href={
                transaction.merchantWebsite.startsWith('http')
                  ? transaction.merchantWebsite
                  : `https://${transaction.merchantWebsite}`
              }
            />
          )}
          <DetailRow
            label="Phone"
            value={transaction.merchantPhone || '-'}
            tooltip={fieldDescriptions.merchantPhone}
          />

          {/* Address information */}
          {(transaction.merchantAddress ||
            transaction.merchantCity ||
            transaction.merchantState ||
            transaction.merchantZip ||
            transaction.merchantCountry) && (
              <div className="mt-2 border-t border-border/20 pt-2">
                <SubheadingWithTooltip
                  label="Merchant Address"
                  tooltip="Physical address of the merchant or business"
                />
                {transaction.merchantAddress && (
                  <DetailRow
                    label="Street"
                    value={transaction.merchantAddress}
                    tooltip={fieldDescriptions.merchantAddress}
                  />
                )}
                {transaction.merchantCity && (
                  <DetailRow
                    label="City"
                    value={transaction.merchantCity}
                    tooltip={fieldDescriptions.merchantCity}
                  />
                )}
                {transaction.merchantState && (
                  <DetailRow
                    label="State"
                    value={transaction.merchantState}
                    tooltip={fieldDescriptions.merchantState}
                  />
                )}
                {transaction.merchantZip && (
                  <DetailRow
                    label="ZIP"
                    value={transaction.merchantZip}
                    tooltip={fieldDescriptions.merchantZip}
                  />
                )}
                {transaction.merchantCountry && (
                  <DetailRow
                    label="Country"
                    value={transaction.merchantCountry}
                    tooltip={fieldDescriptions.merchantCountry}
                  />
                )}
              </div>
            )}
        </div>
      </TransactionSection>

      {/* Categorization */}
      <TransactionSection
        title="Categorization"
        icon={<Tag className="h-4 w-4" />}
        defaultOpen={!!transaction.category || !!transaction.customCategory}
        tooltip={sectionDescriptions.categorization}
      >
        <div className="space-y-1">
          <DetailRow
            label="Category"
            value={transaction.category || 'Uncategorized'}
            tooltip={fieldDescriptions.category}
            isBadge={!!transaction.category}
          />
          {transaction.subCategory && (
            <DetailRow
              label="Subcategory"
              value={transaction.subCategory}
              tooltip={fieldDescriptions.subCategory}
            />
          )}
          {transaction.customCategory && (
            <DetailRow
              label="Custom Category"
              value={transaction.customCategory}
              tooltip={fieldDescriptions.customCategory}
              isBadge
              badgeType="info"
            />
          )}

          {/* Budget related */}
          {transaction.budgetCategory && (
            <DetailRow
              label="Budget Category"
              value={transaction.budgetCategory}
              tooltip={fieldDescriptions.budgetCategory}
            />
          )}
          {transaction.budgetSubcategory && (
            <DetailRow
              label="Budget Subcategory"
              value={transaction.budgetSubcategory}
              tooltip={fieldDescriptions.budgetSubcategory}
            />
          )}
          {transaction.needsWantsCategory && (
            <DetailRow
              label="Needs/Wants"
              value={transaction.needsWantsCategory}
              tooltip={fieldDescriptions.needsWantsCategory}
            />
          )}

          {/* Fiscal information */}
          {(transaction.fiscalYear ||
            transaction.fiscalMonth ||
            transaction.fiscalQuarter) && (
              <div className="mt-2 border-t border-border/20 pt-2">
                <SubheadingWithTooltip
                  label="Fiscal Period"
                  tooltip="Financial period to which this transaction belongs"
                />
                {transaction.fiscalYear && (
                  <DetailRow
                    label="Fiscal Year"
                    value={transaction.fiscalYear}
                    tooltip={fieldDescriptions.fiscalYear}
                  />
                )}
                {transaction.fiscalMonth && (
                  <DetailRow
                    label="Fiscal Month"
                    value={transaction.fiscalMonth}
                    tooltip={fieldDescriptions.fiscalMonth}
                  />
                )}
                {transaction.fiscalQuarter && (
                  <DetailRow
                    label="Fiscal Quarter"
                    value={transaction.fiscalQuarter}
                    tooltip={fieldDescriptions.fiscalQuarter}
                  />
                )}
              </div>
            )}

          {/* Tags */}
          {transaction.tags && transaction.tags.length > 0 && (
            <div className="mt-2 border-t border-border/20 pt-2">
              <DetailRow
                label="Tags"
                value={transaction.tags.join(', ')}
                tooltip={fieldDescriptions.tags}
              />
            </div>
          )}

          {/* Insight tags */}
          {transaction.insightTags && transaction.insightTags.length > 0 && (
            <DetailRow
              label="Insight Tags"
              value={transaction.insightTags.join(', ')}
              tooltip={fieldDescriptions.insightTags}
            />
          )}

          {/* Labels */}
          {transaction.labels && transaction.labels.length > 0 && (
            <DetailRow
              label="Labels"
              value={transaction.labels.join(', ')}
              tooltip={fieldDescriptions.labels}
            />
          )}
        </div>
      </TransactionSection>

      {/* Payment Details */}
      <TransactionSection
        title="Payment Details"
        icon={<CreditCard className="h-4 w-4" />}
        defaultOpen={
          !!(
            transaction.paymentMethod ||
            transaction.paymentChannel ||
            transaction.cardType
          )
        }
        tooltip={sectionDescriptions.paymentDetails}
      >
        <div className="space-y-1">
          <DetailRow
            label="Payment Method"
            value={transaction.paymentMethod || '-'}
            tooltip={fieldDescriptions.paymentMethod}
          />
          <DetailRow
            label="Payment Channel"
            value={transaction.paymentChannel || '-'}
            tooltip={fieldDescriptions.paymentChannel}
          />
          {transaction.paymentProcessor && (
            <DetailRow
              label="Payment Processor"
              value={transaction.paymentProcessor}
              tooltip={fieldDescriptions.paymentProcessor}
            />
          )}
          {transaction.paymentGateway && (
            <DetailRow
              label="Payment Gateway"
              value={transaction.paymentGateway}
              tooltip={fieldDescriptions.paymentGateway}
            />
          )}

          {/* Card details */}
          {(transaction.cardType ||
            transaction.cardNetwork ||
            transaction.cardLastFour) && (
              <div className="mt-2 border-t border-border/20 pt-2">
                <SubheadingWithTooltip
                  label="Card Information"
                  tooltip="Details about the card used for this transaction"
                />
                {transaction.cardType && (
                  <DetailRow
                    label="Card Type"
                    value={transaction.cardType}
                    tooltip={fieldDescriptions.cardType}
                  />
                )}
                {transaction.cardNetwork && (
                  <DetailRow
                    label="Card Network"
                    value={transaction.cardNetwork}
                    tooltip={fieldDescriptions.cardNetwork}
                  />
                )}
                {transaction.cardLastFour && (
                  <DetailRow
                    label="Last Four"
                    value={transaction.cardLastFour}
                    tooltip={fieldDescriptions.cardLastFour}
                  />
                )}
              </div>
            )}

          {/* Reference numbers */}
          {(transaction.transactionReference ||
            transaction.authorizationCode ||
            transaction.checkNumber ||
            transaction.wireReference ||
            transaction.accountNumber) && (
              <div className="mt-2 border-t border-border/20 pt-2">
                <SubheadingWithTooltip
                  label="Reference Information"
                  tooltip="Reference numbers and identifiers associated with this transaction"
                />
                {transaction.transactionReference && (
                  <DetailRow
                    label="Transaction Reference"
                    value={transaction.transactionReference}
                    tooltip={fieldDescriptions.transactionReference}
                    monospace
                  />
                )}
                {transaction.authorizationCode && (
                  <DetailRow
                    label="Authorization Code"
                    value={transaction.authorizationCode}
                    tooltip={fieldDescriptions.authorizationCode}
                    monospace
                  />
                )}
                {transaction.checkNumber && (
                  <DetailRow
                    label="Check Number"
                    value={transaction.checkNumber}
                    tooltip={fieldDescriptions.checkNumber}
                    monospace
                  />
                )}
                {transaction.wireReference && (
                  <DetailRow
                    label="Wire Reference"
                    value={transaction.wireReference}
                    tooltip={fieldDescriptions.wireReference}
                    monospace
                  />
                )}
                {transaction.accountNumber && (
                  <DetailRow
                    label="Account Number"
                    value={transaction.accountNumber}
                    tooltip={fieldDescriptions.accountNumber}
                    monospace
                  />
                )}
              </div>
            )}
        </div>
      </TransactionSection>

      {/* Tax & Financial Information */}
      <TransactionSection
        title="Tax & Financial"
        icon={<Receipt className="h-4 w-4" />}
        defaultOpen={
          !!(
            transaction.taxDeductible ||
            transaction.vatAmount ||
            transaction.taxAmount
          )
        }
        tooltip={sectionDescriptions.taxFinancial}
      >
        <div className="space-y-1">
          {/* Tax information */}
          <PropertiesGrid
            taxDeductible={transaction.taxDeductible}
            taxExempt={transaction.taxExempt}
            reimbursable={transaction.reimbursable}
            excludeFromBudget={transaction.excludeFromBudget}
            plannedExpense={transaction.plannedExpense}
            discretionary={transaction.discretionary}
          />

          <div className="mt-2 border-t border-border/20 pt-2">
            {transaction.vatAmount && (
              <DetailRow
                label="VAT Amount"
                value={formatAmount(
                  transaction.vatAmount,
                  transaction.isoCurrencyCode
                )}
                tooltip={fieldDescriptions.vatAmount}
                isAmount
              />
            )}
            {transaction.vatRate && (
              <DetailRow
                label="VAT Rate"
                value={`${transaction.vatRate}%`}
                tooltip={fieldDescriptions.vatRate}
              />
            )}
            {transaction.taxAmount && (
              <DetailRow
                label="Tax Amount"
                value={formatAmount(
                  transaction.taxAmount,
                  transaction.isoCurrencyCode
                )}
                tooltip={fieldDescriptions.taxAmount}
                isAmount
              />
            )}
            {transaction.taxRate && (
              <DetailRow
                label="Tax Rate"
                value={`${transaction.taxRate}%`}
                tooltip={fieldDescriptions.taxRate}
              />
            )}
            {transaction.taxCategory && (
              <DetailRow
                label="Tax Category"
                value={transaction.taxCategory}
                tooltip={fieldDescriptions.taxCategory}
              />
            )}
            {transaction.businessPurpose && (
              <DetailRow
                label="Business Purpose"
                value={transaction.businessPurpose}
                tooltip={fieldDescriptions.businessPurpose}
              />
            )}
            {transaction.costCenter && (
              <DetailRow
                label="Cost Center"
                value={transaction.costCenter}
                tooltip={fieldDescriptions.costCenter}
              />
            )}
            {transaction.projectCode && (
              <DetailRow
                label="Project Code"
                value={transaction.projectCode}
                tooltip={fieldDescriptions.projectCode}
              />
            )}
          </div>

          {/* Cash flow */}
          {(transaction.cashFlowCategory || transaction.cashFlowType) && (
            <div className="mt-2 border-t border-border/20 pt-2">
              <SubheadingWithTooltip
                label="Cash Flow"
                tooltip="Cash flow information and classification"
              />
              {transaction.cashFlowCategory && (
                <DetailRow
                  label="Cash Flow Category"
                  value={transaction.cashFlowCategory}
                  tooltip={fieldDescriptions.cashFlowCategory}
                />
              )}
              {transaction.cashFlowType && (
                <DetailRow
                  label="Cash Flow Type"
                  value={transaction.cashFlowType}
                  tooltip={fieldDescriptions.cashFlowType}
                />
              )}
            </div>
          )}

          {/* Currency conversion if applicable */}
          {transaction.baseAmount &&
            transaction.baseCurrency &&
            transaction.baseCurrency !== transaction.isoCurrencyCode && (
              <div className="mt-2 border-t border-border/20 pt-2">
                <SubheadingWithTooltip
                  label="Currency Conversion"
                  tooltip="Information about currency conversion for this transaction"
                />
                <DetailRow
                  label="Base Amount"
                  value={formatAmount(
                    transaction.baseAmount,
                    transaction.baseCurrency
                  )}
                  tooltip={fieldDescriptions.baseAmount}
                  isAmount
                />
                <DetailRow
                  label="Base Currency"
                  value={transaction.baseCurrency}
                  tooltip={fieldDescriptions.baseCurrency}
                />
              </div>
            )}
        </div>
      </TransactionSection>

      {/* Location Information */}
      {(transaction.latitude || transaction.longitude) && (
        <TransactionSection
          title="Location"
          icon={<MapPin className="h-4 w-4" />}
          tooltip={sectionDescriptions.location}
        >
          <div className="space-y-1">
            <DetailRow
              label="Latitude"
              value={transaction.latitude || '-'}
              tooltip={fieldDescriptions.latitude}
            />
            <DetailRow
              label="Longitude"
              value={transaction.longitude || '-'}
              tooltip={fieldDescriptions.longitude}
            />

            {/* Map link if we have coordinates */}
            {transaction.latitude && transaction.longitude && (
              <div className="mt-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={`https://maps.google.com/?q=${transaction.latitude},${transaction.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex cursor-help items-center gap-1 text-sm text-blue-600 hover:underline"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        View on Google Maps
                      </a>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">Open location in Google Maps</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        </TransactionSection>
      )}

      {/* Recurring Information */}
      {transaction.isRecurring && (
        <TransactionSection
          title="Recurring Information"
          icon={<FileClock className="h-4 w-4" />}
          defaultOpen={transaction.isRecurring}
          tooltip={sectionDescriptions.recurringInformation}
        >
          <div className="space-y-1">
            <DetailRow
              label="Recurring"
              value="Yes"
              tooltip={fieldDescriptions.isRecurring}
              isBadge
              badgeType="info"
            />
            {transaction.recurringFrequency && (
              <DetailRow
                label="Frequency"
                value={transaction.recurringFrequency}
                tooltip={fieldDescriptions.recurringFrequency}
              />
            )}
            {transaction.recurringDay !== null && (
              <DetailRow
                label="Day"
                value={transaction.recurringDay.toString()}
                tooltip={fieldDescriptions.recurringDay}
              />
            )}
            {transaction.estimatedNextDate && (
              <DetailRow
                label="Next Date"
                value={formatDateTime(transaction.estimatedNextDate)}
                tooltip={fieldDescriptions.estimatedNextDate}
              />
            )}
            {transaction.recurringTransactionId && (
              <DetailRow
                label="Recurring ID"
                value={transaction.recurringTransactionId}
                tooltip={fieldDescriptions.recurringTransactionId}
                monospace
              />
            )}
            {transaction.similarTransactions && (
              <DetailRow
                label="Similar Transactions"
                value={transaction.similarTransactions.toString()}
                tooltip={fieldDescriptions.similarTransactions}
              />
            )}
          </div>
        </TransactionSection>
      )}

      {/* Split Transaction Details */}
      {transaction.isSplit && (
        <TransactionSection
          title="Split Transaction"
          icon={<Hash className="h-4 w-4" />}
          tooltip={sectionDescriptions.splitTransaction}
        >
          <div className="space-y-1">
            <DetailRow
              label="Split Transaction"
              value="Yes"
              tooltip={fieldDescriptions.isSplit}
              isBadge
              badgeType="info"
            />
            {transaction.splitTotal !== null && (
              <DetailRow
                label="Split Total"
                value={formatAmount(
                  transaction.splitTotal,
                  transaction.isoCurrencyCode
                )}
                tooltip={fieldDescriptions.splitTotal}
                isAmount
              />
            )}
            {transaction.splitCount !== null && (
              <DetailRow
                label="Split Count"
                value={transaction.splitCount.toString()}
                tooltip={fieldDescriptions.splitCount}
              />
            )}
            {transaction.parentTransactionId && (
              <DetailRow
                label="Parent Transaction"
                value={transaction.parentTransactionId}
                tooltip={fieldDescriptions.parentTransactionId}
                monospace
              />
            )}
          </div>
        </TransactionSection>
      )}

      {/* Analytics and Insights */}
      {(transaction.confidenceScore !== null ||
        transaction.anomalyScore !== null) && (
          <TransactionSection
            title="Analytics"
            icon={<BarChart4 className="h-4 w-4" />}
            tooltip={sectionDescriptions.analytics}
          >
            <div className="space-y-1">
              {transaction.confidenceScore !== null && (
                <DetailRow
                  label="Confidence Score"
                  value={`${(transaction.confidenceScore * 100).toFixed(1)}%`}
                  tooltip={fieldDescriptions.confidenceScore}
                />
              )}
              {transaction.anomalyScore !== null && (
                <DetailRow
                  label="Anomaly Score"
                  value={`${(transaction.anomalyScore * 100).toFixed(1)}%`}
                  tooltip={fieldDescriptions.anomalyScore}
                />
              )}
              {transaction.inflationCategory && (
                <DetailRow
                  label="Inflation Category"
                  value={transaction.inflationCategory}
                  tooltip={fieldDescriptions.inflationCategory}
                />
              )}
            </div>
          </TransactionSection>
        )}

      {/* Status Information */}
      <TransactionSection
        title="Status Information"
        icon={<Flag className="h-4 w-4" />}
        tooltip={sectionDescriptions.statusInformation}
      >
        <div className="space-y-2">
          <PropertiesGrid
            isRecurring={transaction.isRecurring}
            isManual={transaction.isManual}
            isVerified={transaction.isVerified}
            isModified={transaction.isModified}
            isFlagged={transaction.isFlagged}
            isHidden={transaction.isHidden}
            isLocked={transaction.isLocked}
            isReconciled={transaction.isReconciled}
            isSplit={transaction.isSplit}
            internal={transaction.internal || false}
            notified={transaction.notified || false}
            needsAttention={transaction.needsAttention}
          />

          {transaction.needsAttention && (
            <div className="mt-2">
              <DetailRow
                label="Needs Attention"
                value="Yes"
                tooltip={fieldDescriptions.needsAttention}
                isBadge
                badgeType="warning"
              />
            </div>
          )}

          {transaction.reviewStatus && (
            <DetailRow
              label="Review Status"
              value={transaction.reviewStatus}
              tooltip={fieldDescriptions.reviewStatus}
            />
          )}
        </div>
      </TransactionSection>

      {/* System Information */}
      <TransactionSection
        title="System Information"
        icon={<Lock className="h-4 w-4" />}
        tooltip={sectionDescriptions.systemInformation}
      >
        <div className="space-y-1">
          <DetailRow
            label="Bank Account ID"
            value={transaction.bankAccountId}
            tooltip={fieldDescriptions.bankAccountId}
            monospace
          />
          {transaction.plaidTransactionId && (
            <DetailRow
              label="Plaid Transaction ID"
              value={transaction.plaidTransactionId}
              tooltip={fieldDescriptions.plaidTransactionId}
              monospace
            />
          )}
          <DetailRow
            label="Created At"
            value={formatDateTime(transaction.createdAt)}
            tooltip={fieldDescriptions.createdAt}
          />
          <DetailRow
            label="Updated At"
            value={formatDateTime(transaction.updatedAt)}
            tooltip={fieldDescriptions.updatedAt}
          />
          {transaction.importedAt && (
            <DetailRow
              label="Imported At"
              value={formatDateTime(transaction.importedAt)}
              tooltip={fieldDescriptions.importedAt}
            />
          )}
          {transaction.lastModifiedAt && (
            <DetailRow
              label="Last Modified At"
              value={formatDateTime(transaction.lastModifiedAt)}
              tooltip={fieldDescriptions.lastModifiedAt}
            />
          )}
          {transaction.lastReviewedAt && (
            <DetailRow
              label="Last Reviewed At"
              value={formatDateTime(transaction.lastReviewedAt)}
              tooltip={fieldDescriptions.lastReviewedAt}
            />
          )}
          {transaction.lastCategorizedAt && (
            <DetailRow
              label="Last Categorized At"
              value={formatDateTime(transaction.lastCategorizedAt)}
              tooltip={fieldDescriptions.lastCategorizedAt}
            />
          )}
        </div>
      </TransactionSection>

      {/* Custom Fields */}
      {transaction.customFields &&
        Object.keys(transaction.customFields).length > 0 && (
          <TransactionSection
            title="Custom Fields"
            icon={<HelpCircle className="h-4 w-4" />}
            tooltip={sectionDescriptions.customFields}
          >
            <div className="space-y-1">
              {Object.entries(transaction.customFields).map(([key, value]) => (
                <DetailRow
                  key={key}
                  label={key}
                  value={
                    typeof value === 'object'
                      ? JSON.stringify(value)
                      : String(value)
                  }
                  tooltip={fieldDescriptions.customFields}
                />
              ))}
            </div>
          </TransactionSection>
        )}
    </div>
  );
}

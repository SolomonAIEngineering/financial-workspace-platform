'use client';

import {
  DetailRow,
  TransactionSection,
  formatAmount,
  formatFrequency,
  formatTruncatedId,
  getImportanceBadgeType
} from './components';

import { AlertCircle } from 'lucide-react';
import { EnhancedTransactionTimeline } from './components/enhanced-transaction-timeline';
import type { RecurringTransactionSchema } from './schema';
import { TransactionHeader } from './components/transaction-header';
import { format } from 'date-fns';
import { useDataTable } from '@/components/data-table/data-table-provider';

/**
 * A beautiful, modern component that displays detailed information about a
 * recurring transaction. Organizes information into collapsible sections for
 * better readability and user experience.
 */
export function RecurringTransactionSheetDetails() {
  const { rowSelection, table } = useDataTable();

  // Get the selected row and recurring transaction
  const selectedRowKey = Object.keys(rowSelection)[0];
  const selectedRow = selectedRowKey ? table.getRow(selectedRowKey) : null;
  const transaction =
    (selectedRow?.original as RecurringTransactionSchema) ||
    ({} as RecurringTransactionSchema);

  // Show an error state if no transaction is selected
  if (!selectedRow || !transaction.id) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="mb-4 h-10 w-10 text-muted-foreground" />
        <h3 className="text-lg font-medium">
          No Recurring Transaction Selected
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Select a recurring transaction from the table to view its details.
        </p>
      </div>
    );
  }

  // Format dates for display
  const formatDate = (dateObj?: Date | string | null) => {
    if (!dateObj) return 'Not available';
    try {
      const date = dateObj instanceof Date ? dateObj : new Date(dateObj);
      return format(date, 'PPP');
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-1">
      {/* Check if we have a transaction */}
      {!transaction ? (
        <div className="flex h-64 w-full items-center justify-center">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="h-10 w-10 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-600">
              No transaction selected
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Please select a transaction to view details
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Transaction Header */}
          <TransactionHeader
            id={transaction.id}
            amount={transaction.amount}
            currency={transaction.currency || 'USD'}
            status={transaction.status}
            type={transaction.transactionType || 'Unknown'}
            merchantName={transaction.merchantName || transaction.title}
            description={transaction.description || ''}
            nextExecutionDate={transaction.nextScheduledDate}
            importance={transaction.importanceLevel}
            frequency={transaction.frequency}
          />

          {/* Transaction Timeline */}
          <TransactionSection
            title="Transaction Timeline"
            iconType="activity"
            defaultOpen={true}
          >
            <EnhancedTransactionTimeline
              transaction={transaction}
              historyCount={3}
              forecastCount={3}
            />
          </TransactionSection>

          {/* Basic Information */}
          <TransactionSection
            title="Basic Information"
            iconType="info"
            defaultOpen={true}
          >
            <DetailRow
              label="Status"
              value={transaction.status}
              isBadge={true}
              badgeType={
                transaction.status === 'active'
                  ? 'success'
                  : transaction.status === 'paused'
                    ? 'warning'
                    : transaction.status === 'cancelled'
                      ? 'error'
                      : 'default'
              }
            />
            <DetailRow
              label="Transaction Type"
              value={transaction.transactionType || 'Unknown'}
            />
            <DetailRow
              label="Transaction ID"
              value={formatTruncatedId(transaction.id)}
              monospace={true}
              tooltip="Unique identifier for this recurring transaction"
            />
            <DetailRow
              label="Created"
              value={formatDate(transaction.createdAt)}
            />
            <DetailRow
              label="Last Updated"
              value={formatDate(transaction.updatedAt)}
            />
          </TransactionSection>

          {/* Transaction Details */}
          <TransactionSection
            title="Transaction Details"
            iconType="dollar-sign"
          >
            <DetailRow
              label="Amount"
              value={formatAmount(
                transaction.amount,
                transaction.currency || 'USD'
              )}
              isAmount={true}
              amountType={transaction.amount < 0 ? 'negative' : 'positive'}
            />
            <DetailRow
              label="Currency"
              value={transaction.currency || 'USD'}
              monospace={true}
            />
            <DetailRow
              label="Merchant Name"
              value={transaction.merchantName || 'Not specified'}
            />
            <DetailRow
              label="Description"
              value={transaction.description || 'No description available'}
            />
            <DetailRow
              label="Title"
              value={transaction.title || 'No title available'}
            />
          </TransactionSection>

          {/* Schedule Information */}
          <TransactionSection title="Schedule Information" iconType="calendar">
            <DetailRow
              label="Frequency"
              value={formatFrequency(
                transaction.frequency || '',
                transaction.dayOfMonth !== null
                  ? transaction.dayOfMonth
                  : undefined,
                transaction.dayOfWeek !== null
                  ? transaction.dayOfWeek
                  : undefined
              )}
            />
            <DetailRow
              label="Interval"
              value={
                transaction.interval ? transaction.interval.toString() : '1'
              }
              tooltip="How many units (weeks, months, etc.) between executions"
            />
            <DetailRow
              label="Start Date"
              value={formatDate(transaction.startDate)}
            />
            <DetailRow
              label="End Date"
              value={formatDate(transaction.endDate) || 'Ongoing'}
            />
            <DetailRow
              label="Next Execution"
              value={formatDate(transaction.nextScheduledDate)}
              tooltip="When the next transaction will occur"
            />
            {transaction.dayOfMonth !== null &&
              transaction.dayOfMonth !== undefined && (
                <DetailRow
                  label="Day of Month"
                  value={transaction.dayOfMonth.toString()}
                />
              )}
            {transaction.dayOfWeek !== null &&
              transaction.dayOfWeek !== undefined && (
                <DetailRow
                  label="Day of Week"
                  value={transaction.dayOfWeek.toString()}
                />
              )}
          </TransactionSection>

          {/* Account Information */}
          <TransactionSection title="Account Information" iconType="bank">
            <DetailRow
              label="Account ID"
              value={formatTruncatedId(transaction.bankAccountId || '')}
              monospace={true}
            />
            <DetailRow
              label="Bank Account Name"
              value={transaction.bankAccountName || 'Not available'}
            />
            {transaction.minBalanceRequired !== null &&
              transaction.minBalanceRequired !== undefined && (
                <DetailRow
                  label="Minimum Balance"
                  value={formatAmount(
                    transaction.minBalanceRequired,
                    transaction.currency || 'USD'
                  )}
                  isAmount={true}
                  amountType="neutral"
                  tooltip="The minimum balance required in the account"
                />
              )}
          </TransactionSection>

          {/* Categorization & Configuration */}
          <TransactionSection
            title="Categorization & Configuration"
            iconType="tag"
          >
            <DetailRow
              label="Importance"
              value={transaction.importanceLevel || 'medium'}
              isBadge={true}
              badgeType={getImportanceBadgeType(transaction.importanceLevel)}
              tooltip="How important this recurring transaction is considered to be"
            />
            <DetailRow
              label="Automated"
              value={transaction.isAutomated ? 'Yes' : 'No'}
              tooltip="Whether this transaction is processed automatically"
            />
            <DetailRow
              label="Requires Approval"
              value={transaction.requiresApproval ? 'Yes' : 'No'}
              tooltip="Whether this transaction requires approval before execution"
            />
            <DetailRow
              label="Variable Amount"
              value={transaction.isVariable ? 'Yes' : 'No'}
              tooltip="Whether the amount can vary between executions"
            />
            {transaction.isVariable &&
              transaction.allowedVariance !== undefined && (
                <DetailRow
                  label="Allowed Variance"
                  value={`${transaction.allowedVariance}%`}
                  tooltip="Maximum percentage the amount can vary"
                />
              )}
            <DetailRow
              label="Affects Available Balance"
              value={transaction.affectAvailableBalance ? 'Yes' : 'No'}
              tooltip="Whether this transaction affects the available balance calculation"
            />
          </TransactionSection>

          {/* Execution Information */}
          <TransactionSection
            title="Execution Information"
            iconType="repeat"
            badgeCount={transaction.executionCount || 0}
          >
            <DetailRow
              label="Execution Count"
              value={transaction.executionCount?.toString() || '0'}
              tooltip="Number of times this transaction has executed"
            />
            <DetailRow
              label="Total Executed"
              value={transaction.totalExecuted?.toString() || '0'}
              tooltip="Total number of successful executions"
            />
            <DetailRow
              label="Last Execution Status"
              value={transaction.lastExecutionStatus || 'Not executed'}
              isBadge={true}
              badgeType={
                transaction.lastExecutionStatus
                  ?.toLowerCase()
                  ?.includes('success')
                  ? 'success'
                  : transaction.lastExecutionStatus
                    ?.toLowerCase()
                    ?.includes('fail')
                    ? 'error'
                    : 'info'
              }
            />
            <DetailRow
              label="Last Execution Date"
              value={formatDate(transaction.lastExecutedAt)}
            />
          </TransactionSection>
        </div>
      )}
    </div>
  );
}

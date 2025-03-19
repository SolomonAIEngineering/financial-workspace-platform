'use client';

import type { DataTableFilterField } from '@/components/data-table/types';
import type { RecurringTransactionSchema } from './schema';
import { addBusinessDays } from 'date-fns';

/**
 * Contains constant values, sample data, and filter configurations for
 * recurring transactions. This file is the central repository for all filter
 * definitions, default values, and sample data used throughout the recurring
 * transaction UI components.
 *
 * @file Constants.tsx
 */

/**
 * Sample recurring transaction data for testing and development. Each record
 * represents a recurring financial transaction with properties matching the
 * RecurringTransactionSchema.
 *
 * @example
 *   ```tsx
 *   // Use the sample data in a component
 *   const { data } = useQuery({
 *     queryFn: async () => sampleRecurringTransactions,
 *     queryKey: ['recurringTransactions']
 *   });
 *   ```;
 */
export const sampleRecurringTransactions: RecurringTransactionSchema[] = [
  {
    id: 'rt_1',
    bankAccountId: 'acct_1',
    amount: 9.99,
    currency: 'USD',
    frequency: 'MONTHLY',
    interval: 1,
    title: 'Netflix Subscription',
    description: 'Monthly Netflix subscription',
    nextScheduledDate: addBusinessDays(new Date(), 5),
    lastExecutedAt: addBusinessDays(new Date(), -25),
    startDate: addBusinessDays(new Date(), -55),
    endDate: null,
    status: 'active',
    transactionType: 'subscription',
    importanceLevel: 'medium',
    merchantId: 'merch_1',
    merchantName: 'Netflix',
    requiresApproval: false,
    executionCount: 12,
    totalExecuted: 119.88,
    affectAvailableBalance: true,
    isAutomated: true,
    isVariable: false,
  },
  {
    id: 'rt_2',
    bankAccountId: 'acct_1',
    amount: 49.99,
    currency: 'USD',
    frequency: 'MONTHLY',
    interval: 1,
    title: 'Gym Membership',
    description: 'Monthly gym membership fee',
    nextScheduledDate: addBusinessDays(new Date(), 12),
    lastExecutedAt: addBusinessDays(new Date(), -18),
    startDate: addBusinessDays(new Date(), -48),
    endDate: null,
    status: 'active',
    transactionType: 'subscription',
    importanceLevel: 'low',
    merchantId: 'merch_2',
    merchantName: "Gold's Gym",
    requiresApproval: false,
    executionCount: 10,
    totalExecuted: 499.9,
    affectAvailableBalance: true,
    isAutomated: true,
    isVariable: false,
  },
  {
    id: 'rt_3',
    bankAccountId: 'acct_2',
    amount: 1200,
    currency: 'USD',
    frequency: 'MONTHLY',
    interval: 1,
    title: 'Office Rent',
    description: 'Monthly office space rent',
    nextScheduledDate: addBusinessDays(new Date(), 1),
    lastExecutedAt: addBusinessDays(new Date(), -29),
    startDate: addBusinessDays(new Date(), -59),
    endDate: null,
    status: 'active',
    transactionType: 'bill',
    importanceLevel: 'critical',
    merchantId: 'merch_3',
    merchantName: 'Skyview Properties',
    requiresApproval: true,
    executionCount: 12,
    totalExecuted: 14400,
    affectAvailableBalance: true,
    isAutomated: true,
    isVariable: false,
  },
  {
    id: 'rt_4',
    bankAccountId: 'acct_2',
    amount: 89.99,
    currency: 'USD',
    frequency: 'BIWEEKLY',
    interval: 2,
    title: 'Cleaning Service',
    description: 'Bi-weekly office cleaning',
    nextScheduledDate: addBusinessDays(new Date(), 3),
    lastExecutedAt: addBusinessDays(new Date(), -11),
    startDate: addBusinessDays(new Date(), -25),
    endDate: null,
    status: 'active',
    transactionType: 'other',
    importanceLevel: 'medium',
    merchantId: 'merch_4',
    merchantName: 'CleanPro Services',
    requiresApproval: false,
    executionCount: 6,
    totalExecuted: 539.94,
    affectAvailableBalance: true,
    isAutomated: true,
    isVariable: true,
  },
  {
    id: 'rt_5',
    bankAccountId: 'acct_3',
    amount: 3500,
    currency: 'USD',
    frequency: 'MONTHLY',
    interval: 1,
    title: 'Employee Salary',
    description: 'Monthly salary for admin assistant',
    nextScheduledDate: addBusinessDays(new Date(), 15),
    lastExecutedAt: addBusinessDays(new Date(), -15),
    startDate: addBusinessDays(new Date(), -45),
    endDate: null,
    status: 'active',
    transactionType: 'income',
    importanceLevel: 'critical',
    merchantId: 'merch_5',
    merchantName: 'Payroll',
    requiresApproval: true,
    executionCount: 8,
    totalExecuted: 28000,
    affectAvailableBalance: true,
    isAutomated: true,
    isVariable: false,
  },
  {
    id: 'rt_6',
    bankAccountId: 'acct_1',
    amount: 15.99,
    currency: 'USD',
    frequency: 'MONTHLY',
    interval: 1,
    title: 'Website Hosting',
    description: 'Monthly website hosting fee',
    nextScheduledDate: addBusinessDays(new Date(), 7),
    lastExecutedAt: addBusinessDays(new Date(), -23),
    startDate: addBusinessDays(new Date(), -53),
    endDate: null,
    status: 'paused',
    transactionType: 'subscription',
    importanceLevel: 'high',
    merchantId: 'merch_6',
    merchantName: 'HostGator',
    requiresApproval: false,
    executionCount: 11,
    totalExecuted: 175.89,
    affectAvailableBalance: true,
    isAutomated: true,
    isVariable: false,
  },
  {
    id: 'rt_7',
    bankAccountId: 'acct_3',
    amount: 800,
    currency: 'USD',
    frequency: 'WEEKLY',
    interval: 1,
    title: 'Inventory Restock',
    description: 'Weekly inventory procurement',
    nextScheduledDate: addBusinessDays(new Date(), 2),
    lastExecutedAt: addBusinessDays(new Date(), -5),
    startDate: addBusinessDays(new Date(), -12),
    endDate: null,
    status: 'active',
    transactionType: 'bill',
    importanceLevel: 'high',
    merchantId: 'merch_7',
    merchantName: 'Wholesale Supplies',
    requiresApproval: true,
    executionCount: 4,
    totalExecuted: 3200,
    affectAvailableBalance: true,
    isAutomated: true,
    isVariable: true,
  },
  {
    id: 'rt_8',
    bankAccountId: 'acct_2',
    amount: 125,
    currency: 'USD',
    frequency: 'ANNUALLY',
    interval: 1,
    title: 'Domain Renewal',
    description: 'Quarterly domain name renewal fee',
    nextScheduledDate: addBusinessDays(new Date(), 45),
    lastExecutedAt: addBusinessDays(new Date(), -45),
    startDate: addBusinessDays(new Date(), -135),
    endDate: null,
    status: 'active',
    transactionType: 'subscription',
    importanceLevel: 'medium',
    merchantId: 'merch_8',
    merchantName: 'GoDaddy',
    requiresApproval: false,
    executionCount: 2,
    totalExecuted: 250,
    affectAvailableBalance: true,
    isAutomated: true,
    isVariable: false,
  },
  {
    id: 'rt_9',
    bankAccountId: 'acct_1',
    amount: 75,
    currency: 'USD',
    frequency: 'MONTHLY',
    interval: 1,
    title: 'Internet Service',
    description: 'Monthly high-speed internet service',
    nextScheduledDate: addBusinessDays(new Date(), 20),
    lastExecutedAt: addBusinessDays(new Date(), -10),
    startDate: addBusinessDays(new Date(), -40),
    endDate: null,
    status: 'active',
    transactionType: 'bill',
    importanceLevel: 'high',
    merchantId: 'merch_9',
    merchantName: 'Comcast Business',
    requiresApproval: false,
    executionCount: 9,
    totalExecuted: 675,
    affectAvailableBalance: true,
    isAutomated: true,
    isVariable: false,
  },
  {
    id: 'rt_10',
    bankAccountId: 'acct_3',
    amount: 250,
    currency: 'USD',
    frequency: 'MONTHLY',
    interval: 1,
    title: 'Accounting Services',
    description: 'Monthly accounting and bookkeeping',
    nextScheduledDate: addBusinessDays(new Date(), 8),
    lastExecutedAt: addBusinessDays(new Date(), -22),
    startDate: addBusinessDays(new Date(), -52),
    endDate: null,
    status: 'active',
    transactionType: 'other',
    importanceLevel: 'medium',
    merchantId: 'merch_10',
    merchantName: 'Johnson Accounting',
    requiresApproval: true,
    executionCount: 7,
    totalExecuted: 1750,
    affectAvailableBalance: true,
    isAutomated: true,
    isVariable: false,
  },
];

/**
 * Filter field definitions for the recurring transactions data table. Each
 * filter object defines a UI control that users can interact with to filter
 * transaction data.
 *
 * The filters include:
 *
 * - Checkbox filters for status, type, frequency, importance, etc.
 * - Input fields for text search on merchant name and title
 * - Slider controls for numeric values like amount and interval
 * - Date range filters for time-based filtering
 *
 * @example
 *   ```tsx
 *   // Use these filters in a DataTable component
 *   <DataTable
 *     columns={columns}
 *     data={data}
 *     filterFields={filterFields}
 *   />
 *   ```;
 *
 * @type {DataTableFilterField<RecurringTransactionSchema>[]}
 */
export const filterFields: DataTableFilterField<RecurringTransactionSchema>[] =
  [
    {
      type: 'checkbox',
      value: 'status',
      label: 'Status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'paused', label: 'Paused' },
        { value: 'failed', label: 'Failed' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
    {
      type: 'checkbox',
      value: 'transactionType',
      label: 'Type',
      options: [
        { value: 'subscription', label: 'Subscription' },
        { value: 'bill', label: 'Bill' },
        { value: 'income', label: 'Income' },
        { value: 'transfer', label: 'Transfer' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      type: 'checkbox',
      value: 'frequency',
      label: 'Frequency',
      options: [
        { value: 'WEEKLY', label: 'Weekly' },
        { value: 'BIWEEKLY', label: 'Biweekly' },
        { value: 'MONTHLY', label: 'Monthly' },
        { value: 'SEMI_MONTHLY', label: 'Semi-Monthly' },
        { value: 'ANNUALLY', label: 'Annually' },
        { value: 'IRREGULAR', label: 'Irregular' },
        { value: 'UNKNOWN', label: 'Unknown' },
      ],
    },
    {
      type: 'checkbox',
      value: 'importanceLevel',
      label: 'Importance',
      options: [
        { value: 'critical', label: 'Critical' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' },
      ],
    },
    {
      type: 'checkbox',
      value: 'affectAvailableBalance',
      label: 'Affects Balance',
      options: [
        { value: 'true', label: 'Affects Balance' },
        { value: 'false', label: 'Does Not Affect Balance' },
      ],
    },
    {
      type: 'checkbox',
      value: 'isAutomated',
      label: 'Automation',
      options: [
        { value: 'true', label: 'Automated' },
        { value: 'false', label: 'Manual' },
      ],
    },
    {
      type: 'checkbox',
      value: 'requiresApproval',
      label: 'Approval Required',
      options: [
        { value: 'true', label: 'Required' },
        { value: 'false', label: 'Not Required' },
      ],
    },
    {
      type: 'checkbox',
      value: 'isVariable',
      label: 'Amount Type',
      options: [
        { value: 'true', label: 'Variable' },
        { value: 'false', label: 'Fixed' },
      ],
    },
    {
      type: 'checkbox',
      value: 'currency',
      label: 'Currency',
      options: [
        { value: 'USD', label: 'USD ($)' },
        { value: 'EUR', label: 'EUR (€)' },
        { value: 'GBP', label: 'GBP (£)' },
        { value: 'CAD', label: 'CAD ($)' },
        { value: 'AUD', label: 'AUD ($)' },
        { value: 'JPY', label: 'JPY (¥)' },
      ],
    },
    {
      type: 'checkbox',
      value: 'dayOfMonth',
      label: 'Day of Month',
      options: [
        { value: '1', label: '1st' },
        { value: '15', label: '15th' },
        { value: '30', label: '30th' },
        { value: 'last', label: 'Last Day' },
      ],
    },
    {
      type: 'checkbox',
      value: 'dayOfWeek',
      label: 'Day of Week',
      options: [
        { value: '0', label: 'Sunday' },
        { value: '1', label: 'Monday' },
        { value: '2', label: 'Tuesday' },
        { value: '3', label: 'Wednesday' },
        { value: '4', label: 'Thursday' },
        { value: '5', label: 'Friday' },
        { value: '6', label: 'Saturday' },
      ],
    },
    {
      type: 'input',
      value: 'merchantName',
      label: 'Merchant',
    },
    {
      type: 'input',
      value: 'title',
      label: 'Title',
    },
    {
      type: 'slider',
      value: 'amount',
      label: 'Amount',
      min: 0,
      max: 5000,
    },
    {
      type: 'slider',
      value: 'interval',
      label: 'Interval',
      min: 1,
      max: 12,
    },
    {
      type: 'slider',
      value: 'executionCount',
      label: 'Execution Count',
      min: 0,
      max: 100,
    },
    {
      type: 'slider',
      value: 'totalExecuted',
      label: 'Total Executed Amount',
      min: 0,
      max: 10000,
    },
    {
      type: 'slider',
      value: 'minBalanceRequired',
      label: 'Min. Balance Required',
      min: 0,
      max: 2000,
    },
    {
      type: 'timerange',
      value: 'nextScheduledDate',
      label: 'Next Execution Date',
    },
    {
      type: 'timerange',
      value: 'lastExecutedAt',
      label: 'Last Execution Time',
    },
    {
      type: 'timerange',
      value: 'startDate',
      label: 'Start Date',
    },
    {
      type: 'timerange',
      value: 'endDate',
      label: 'End Date',
    },
    {
      type: 'timerange',
      value: 'createdAt',
      label: 'Created Date',
    },
    {
      type: 'timerange',
      value: 'updatedAt',
      label: 'Last Updated',
    },
  ];

/**
 * Groups filter fields into logical categories for the filter sidebar. This
 * function organizes filters into meaningful sections to improve usability.
 *
 * Categories include:
 *
 * - Status - Transaction status filters
 * - Types & Categories - Classification-related filters
 * - Configuration - Settings-related filters
 * - Schedule - Time-based recurrence filters
 * - Text Search - Free-form search filters
 * - Numeric Ranges - Value-based sliders
 * - Date Ranges - Time period filters
 *
 * @example
 *   ```tsx
 *   // Use the grouping in a filter sidebar component
 *   const groupedFilters = groupFilters(filterFields);
 *
 *   return (
 *     <FilterSidebar>
 *       {groupedFilters.map(group => (
 *         <FilterGroup key={group.title} title={group.title}>
 *           {group.fields.map(field => (
 *             <FilterControl key={field.value} field={field} />
 *           ))}
 *         </FilterGroup>
 *       ))}
 *     </FilterSidebar>
 *   );
 *   ```;
 *
 * @param {DataTableFilterField<RecurringTransactionSchema>[]} fields - The
 *   filter fields to organize
 * @returns {{
 *   title: string;
 *   fields: DataTableFilterField<RecurringTransactionSchema>[];
 * }[]}
 *   Grouped filter fields
 */
export const groupFilters = (
  fields: DataTableFilterField<RecurringTransactionSchema>[]
) => {
  // Group filters by their type
  const statusFilters = fields.filter((field) => field.value === 'status');

  const typeFilters = fields.filter(
    (field) =>
      field.value === 'transactionType' ||
      field.value === 'frequency' ||
      field.value === 'importanceLevel' ||
      field.value === 'currency'
  );

  const configFilters = fields.filter(
    (field) =>
      field.value === 'isAutomated' ||
      field.value === 'requiresApproval' ||
      field.value === 'isVariable' ||
      field.value === 'affectAvailableBalance'
  );

  const scheduleFilters = fields.filter(
    (field) => field.value === 'dayOfMonth' || field.value === 'dayOfWeek'
  );

  const textFilters = fields.filter((field) => field.type === 'input');

  const rangeFilters = fields.filter((field) => field.type === 'slider');

  const dateFilters = fields.filter((field) => field.type === 'timerange');

  return [
    {
      title: 'Status',
      fields: statusFilters,
    },
    {
      title: 'Types & Categories',
      fields: typeFilters,
    },
    {
      title: 'Configuration',
      fields: configFilters,
    },
    {
      title: 'Schedule',
      fields: scheduleFilters,
    },
    {
      title: 'Text Search',
      fields: textFilters,
    },
    {
      title: 'Numeric Ranges',
      fields: rangeFilters,
    },
    {
      title: 'Date Ranges',
      fields: dateFilters,
    },
  ];
};

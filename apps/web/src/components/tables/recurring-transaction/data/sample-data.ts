/**
 * Sample transaction data for testing and demonstration. In a production
 * environment, this would be replaced with real transaction data.
 *
 * This data represents transactions related to a recurring payment.
 */
export const SAMPLE_RELATED_TRANSACTIONS = [
  {
    id: 'tx_1',
    date: new Date('2023-10-15'),
    name: 'Netflix Subscription',
    amount: -15.99,
    currency: 'USD',
    status: 'completed',
  },
  {
    id: 'tx_2',
    date: new Date('2023-09-15'),
    name: 'Netflix Subscription',
    amount: -15.99,
    currency: 'USD',
    status: 'completed',
  },
  {
    id: 'tx_3',
    date: new Date('2023-08-15'),
    name: 'Netflix Subscription',
    amount: -15.99,
    currency: 'USD',
    status: 'completed',
  },
];

/**
 * Sample transaction history data for the timeline visualization. Provides
 * historical data for the transaction timeline view.
 *
 * Each entry contains:
 *
 * - An ID
 * - Transaction date
 * - Transaction name
 * - Amount and currency
 * - Status
 * - Optional note
 */
export const SAMPLE_TRANSACTION_HISTORY = [
  {
    id: 'tx_1',
    date: new Date('2023-10-15'),
    name: 'Netflix Subscription',
    amount: -15.99,
    currency: 'USD',
    status: 'completed',
    note: 'Monthly subscription payment',
  },
  {
    id: 'tx_2',
    date: new Date('2023-09-15'),
    name: 'Netflix Subscription',
    amount: -15.99,
    currency: 'USD',
    status: 'completed',
    note: null,
  },
  {
    id: 'tx_3',
    date: new Date('2023-08-15'),
    name: 'Netflix Subscription',
    amount: -15.99,
    currency: 'USD',
    status: 'completed',
    note: null,
  },
  {
    id: 'tx_4',
    date: new Date('2023-07-15'),
    name: 'Netflix Subscription',
    amount: -14.99,
    currency: 'USD',
    status: 'completed',
    note: 'Price increased from previous month',
  },
  {
    id: 'tx_5',
    date: new Date('2023-06-15'),
    name: 'Netflix Subscription',
    amount: -14.99,
    currency: 'USD',
    status: 'completed',
    note: null,
  },
  {
    id: 'tx_6',
    date: new Date('2023-05-15'),
    name: 'Netflix Subscription',
    amount: -14.99,
    currency: 'USD',
    status: 'completed',
    note: null,
  },
];

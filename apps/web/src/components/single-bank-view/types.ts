import { BankAccount } from '@solomonai/prisma';

/**
 * Transaction interface represents a financial transaction with its details
 * 
 * @interface Transaction
 * @property {string} id - Unique identifier for the transaction
 * @property {Date} date - Date when the transaction occurred
 * @property {string} description - Description or name of the transaction
 * @property {number} amount - Monetary amount of the transaction
 * @property {string} category - Category the transaction belongs to
 * @property {'pending' | 'completed' | 'failed'} status - Current status of the transaction
 */
export interface Transaction {
    id: string;
    date: Date;
    description: string;
    amount: number;
    category: string;
    status: 'pending' | 'completed' | 'failed';
}

/**
 * Interface for props needed to render a single bank account view
 * 
 * @interface SingleBankAccountProps
 * @property {BankAccount} bankAccount - Bank account data from the database
 */
export interface SingleBankAccountProps {
    bankAccount: BankAccount;
}

/**
 * MonthlyStats interface contains pre-formatted financial summary data
 * 
 * @interface MonthlyStats
 * @property {string} spending - Formatted total spending amount
 * @property {string} income - Formatted total income amount
 * @property {string} netChange - Formatted net change in account balance
 * @property {number} percentChange - Percentage change in account balance
 */
export interface MonthlyStats {
    spending: string;
    income: string;
    netChange: string;
    percentChange: number;
}

/**
 * ChartData interface for data to be used in visualizations
 * 
 * @interface ChartData
 * @property {string[]} labels - Array of labels for data points on x-axis
 * @property {number[]} values - Array of corresponding values for each label
 */
export interface ChartData {
    labels: string[];
    values: number[];
}

/**
 * Chart visualization types available in the application
 * 
 * @type {ChartType}
 */
export type ChartType = 'bar' | 'line' | 'sphere';

/**
 * Date range options for filtering financial data
 * 
 * @type {DateRangeType}
 */
export type DateRangeType = '7d' | '30d' | '90d' | 'ytd'; 
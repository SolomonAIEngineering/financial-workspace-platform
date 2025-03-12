/**
 * Type definitions for expense-related data structures.
 * 
 * This module contains interfaces that represent expense data organized by date,
 * which are used for financial reporting, data visualization, and analytics features.
 * 
 * @module ExpenseTypes
 */

/**
 * Represents the count of expense transactions grouped by date and category.
 * 
 * This interface is typically used for visualizing transaction frequency over time,
 * such as in histograms or time-series charts that show transaction volume by category.
 * 
 * @property date - The date string for the grouped transactions
 * @property [category] - Dynamic property where keys are expense categories and values are transaction counts or other metadata
 */
export interface ExpenseTransactionCountByDate {
  date: string
  [category: string]: number | string
}

/**
 * Represents expense amounts grouped by date and category.
 * 
 * This interface is typically used for financial reporting and data visualization
 * where expense amounts need to be aggregated by date and category.
 * 
 * @property date - The date string for the grouped expenses
 * @property [category] - Dynamic property where keys are expense categories and values are monetary amounts or other metadata
 */
export interface ExpenseByDate {
  date: string
  [category: string]: number | string
}

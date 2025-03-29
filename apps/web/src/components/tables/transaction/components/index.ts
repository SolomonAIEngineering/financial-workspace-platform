/**
 * Transaction Components Module
 *
 * This module exports all the components, utilities, and configuration related
 * to transaction details display in the application. The components work
 * together to create a comprehensive transaction details view with consistent
 * styling, tooltips, and accessibility features.
 *
 * Components:
 *
 * - TransactionSection: Collapsible sections for grouping related transaction
 *   details
 * - TransactionDetails: The primary component for displaying all transaction
 *   information
 * - TransactionHeader: Header component with transaction summary information
 * - TransactionMetadata: Additional metadata about the transaction
 * - DetailRow: Row component for displaying labeled transaction values
 * - PropertyItem: Component for displaying boolean properties/flags
 * - PropertiesGrid: Grid layout for multiple property items
 * - CategoriesContent: Component for displaying categorization information
 * - DescriptionContent: Component for displaying transaction descriptions and
 *   notes
 * - RelatedTransactionsList: List of related transactions
 * - RelatedTransactionItem: Individual related transaction item
 * - ProcessingStep: Component showing a step in transaction processing
 * - TransactionTimeline: Visual timeline of transaction processing
 * - TransactionActions: Action buttons for transaction operations
 * - TransactionNoteModal: Modal for editing transaction notes with templates
 *
 * Utilities and Data:
 *
 * - Utils: Helper functions for formatting and displaying transaction data
 * - FieldDescriptions: Descriptions for transaction fields used in tooltips
 * - SectionDescriptions: Descriptions for transaction sections used in tooltips
 */

export * from './transaction-section';
export * from './transaction-details';
export * from './transaction-header';
export * from './transaction-metadata';
export * from './detail-row';
export * from './property-item';
export * from './properties-grid';
export * from './categories-content';
export * from './description-content';
export * from './related-transactions-list';
export * from './related-transaction-item';
export * from './transaction-actions';
export * from './utils';
export * from './field-descriptions';
export * from './section-descriptions';
export * from './transaction-note-modal';

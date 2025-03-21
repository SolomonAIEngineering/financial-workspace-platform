/**
 * Descriptions for transaction detail sections used in tooltips.
 * 
 * This module exports a record mapping section keys to detailed descriptions that explain
 * the purpose and content of each transaction detail section. These descriptions are displayed
 * in tooltips when users hover over section headers in the transaction details view, providing
 * contextual information to help users understand the data.
 * 
 * Each description is carefully written to be concise yet informative, explaining what kind of
 * data appears in each section and why it might be relevant to the user.
 * 
 * @example
 * ```tsx
 * import { sectionDescriptions } from './section-descriptions';
 * 
 * <TransactionSection 
 *   title="Payment Details" 
 *   tooltip={sectionDescriptions.paymentDetails}
 * >
 *   // Section content
 * </TransactionSection>
 * ```
 */
export const sectionDescriptions: Record<string, string> = {
    // Section descriptions
    transactionInformation: "Basic details about the transaction including amount, date, and description",
    merchantDetails: "Information about the merchant involved in the transaction including contact and address details",
    categorization: "Shows how this transaction is categorized, including budget categories and custom categorizations",
    paymentDetails: "Payment method and related information such as card details and reference numbers",
    taxFinancial: "Tax-related information, financial details, and cash flow categorization",
    location: "Geographic location information where the transaction occurred",
    recurringInformation: "Details about recurring patterns for this transaction if it repeats regularly",
    splitTransaction: "Information about how this transaction is split into multiple parts",
    analytics: "Analysis metrics and statistics about this transaction",
    statusInformation: "Current status flags and indicators for this transaction",
    systemInformation: "System-related details and metadata about this transaction record",
    customFields: "User-defined custom fields added to this transaction"
}; 
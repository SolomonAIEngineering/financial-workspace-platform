import assetTransactionTemplate from './asset-transaction-template'
import bankTransferTemplate from './bank-transfer-template'
// Export all financial document templates
import clientPaymentTemplate from './client-payment-template'
import expenseReportTemplate from './expense-report-template'
import invoiceCreationTemplate from './invoice-creation-template'
import payrollProcessingTemplate from './payroll-processing-template'
import refundProcessedTemplate from './refund-processed-template'
import subscriptionRenewalTemplate from './subscription-renewal-template'
import taxPaymentTemplate from './tax-payment-template'
import vendorPaymentTemplate from './vendor-payment-template'

export {
  assetTransactionTemplate,
  bankTransferTemplate,
  clientPaymentTemplate,
  expenseReportTemplate,
  invoiceCreationTemplate,
  payrollProcessingTemplate,
  refundProcessedTemplate,
  subscriptionRenewalTemplate,
  taxPaymentTemplate,
  vendorPaymentTemplate,
}

// For convenience, also export a mapping of template names to templates
export const financialDocumentTemplates = {
  'Client Payment': clientPaymentTemplate,
  'Vendor Payment': vendorPaymentTemplate,
  'Expense Report': expenseReportTemplate,
  'Invoice Creation': invoiceCreationTemplate,
  'Bank Transfer': bankTransferTemplate,
  'Refund Processed': refundProcessedTemplate,
  'Subscription Renewal': subscriptionRenewalTemplate,
  'Tax Payment': taxPaymentTemplate,
  'Payroll Processing': payrollProcessingTemplate,
  'Asset Transaction': assetTransactionTemplate,
}

export default financialDocumentTemplates

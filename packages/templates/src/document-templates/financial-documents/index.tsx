// New templates
import annualFinancialReviewTemplate from './annual-financial-review-template'
import assetTransactionTemplate from './asset-transaction-template'
import bankTransferTemplate from './bank-transfer-template'
import budgetPlanningTemplate from './budget-planning-template'
import businessAcquisitionTemplate from './business-acquisition-template'
import businessValuationTemplate from './business-valuation-template'
import cashFlowProjectionTemplate from './cash-flow-projection-template'
// Export all financial document templates
import clientPaymentTemplate from './client-payment-template'
import expenseReportTemplate from './expense-report-template'
import financialAuditPreparationTemplate from './financial-audit-preparation-template'
import financialStatementTemplate from './financial-statement-template'
import inventoryManagementTemplate from './inventory-management-template'
import invoiceCreationTemplate from './invoice-creation-template'
import loanApplicationTemplate from './loan-application-template'
import payrollProcessingTemplate from './payroll-processing-template'
import profitLossAnalysisTemplate from './profit-loss-analysis-template'
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
  // New templates
  annualFinancialReviewTemplate,
  budgetPlanningTemplate,
  businessAcquisitionTemplate,
  businessValuationTemplate,
  cashFlowProjectionTemplate,
  financialAuditPreparationTemplate,
  financialStatementTemplate,
  inventoryManagementTemplate,
  loanApplicationTemplate,
  profitLossAnalysisTemplate,
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
  // New templates
  'Annual Financial Review': annualFinancialReviewTemplate,
  'Budget Planning': budgetPlanningTemplate,
  'Business Acquisition': businessAcquisitionTemplate,
  'Business Valuation': businessValuationTemplate,
  'Cash Flow Projection': cashFlowProjectionTemplate,
  'Financial Audit Preparation': financialAuditPreparationTemplate,
  'Financial Statement': financialStatementTemplate,
  'Inventory Management': inventoryManagementTemplate,
  'Loan Application': loanApplicationTemplate,
  'Profit & Loss Analysis': profitLossAnalysisTemplate,
}

export default financialDocumentTemplates

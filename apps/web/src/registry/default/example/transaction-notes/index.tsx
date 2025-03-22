import { basicNoteTemplate } from './basic-note';
import { businessExpenseTemplate } from './business-expense';
import { clientTransactionTemplate } from './client-transaction';
import { disputeDocumentationTemplate } from './dispute-documentation';
import { financialReviewTemplate } from './financial-review';
import { recurringTransactionTemplate } from './recurring-transaction';
import { vendorPaymentTemplate } from './vendor-payment';

// Template options for the dropdown
export const NOTE_TEMPLATES = [
    { label: 'Basic Note', value: 'basic', template: basicNoteTemplate },
    { label: 'Business Expense', value: 'business', template: businessExpenseTemplate },
    { label: 'Client Transaction', value: 'client', template: clientTransactionTemplate },
    { label: 'Recurring Transaction', value: 'recurring', template: recurringTransactionTemplate },
    { label: 'Dispute Documentation', value: 'dispute', template: disputeDocumentationTemplate },
    { label: 'Financial Review & Audit', value: 'financial-review', template: financialReviewTemplate },
    { label: 'Vendor Payment', value: 'vendor-payment', template: vendorPaymentTemplate },
];

export {
    basicNoteTemplate,
    businessExpenseTemplate,
    clientTransactionTemplate,
    disputeDocumentationTemplate,
    financialReviewTemplate,
    recurringTransactionTemplate,
    vendorPaymentTemplate
}; 
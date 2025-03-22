import type { Value } from '@udecode/plate';

// Business Expense Note Template
export const businessExpenseTemplate: Value = [
    {
        type: 'h2',
        children: [
            { text: 'Business Expense Documentation' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Comprehensive documentation for business expense tracking, tax compliance, budget allocation, and reimbursement management.' },
        ],
    },
    {
        type: 'h3',
        children: [
            { text: 'Expense Classification' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Business Purpose: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Expense Type: ', bold: true },
            { text: '☐ Travel  ☐ Meals & Entertainment  ☐ Office Supplies  ☐ Software  ☐ Equipment  ☐ Professional Services  ☐ Other' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Budget Category: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Cost Center/Department: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'h3',
        children: [
            { text: 'Expense Details' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Date Incurred: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Vendor/Merchant: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Payment Method: ', bold: true },
            { text: '☐ Corporate Card  ☐ Personal Card  ☐ Cash  ☐ ACH/Wire  ☐ Check #_______' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Currency: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'h3',
        children: [
            { text: 'Authorization & Compliance' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Pre-Approved: ', bold: true },
            { text: '☐ Yes  ☐ No  ☐ N/A (under threshold)' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Approved By: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Approval Date: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Policy Compliant: ', bold: true },
            { text: '☐ Yes  ☐ No (explain below)' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        children: [
            { text: 'Explanation if non-compliant: ' },
        ],
    },
    {
        type: 'h3',
        children: [
            { text: 'Participants & Business Context' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Attendees/Participants: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Client/Project Association: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Business Outcome: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'h3',
        children: [
            { text: 'Tax & Accounting Information' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        listStyleType: 'disc',
        children: [
            { text: 'Tax Deductible: ', bold: true },
            { text: '☐ Yes - 100%  ☐ Yes - Partial  ☐ No' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        listStyleType: 'disc',
        children: [
            { text: 'Tax Category: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        listStyleType: 'disc',
        children: [
            { text: 'Percentage Deductible: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        listStyleType: 'disc',
        children: [
            { text: 'GL Account Number: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        listStyleType: 'disc',
        children: [
            { text: 'Billable to Client: ', bold: true },
            { text: '☐ Yes  ☐ No' },
        ],
    },
    {
        type: 'h3',
        children: [
            { text: 'Documentation & Receipts' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        listStyleType: 'decimal',
        children: [
            { text: 'Receipt Status: ', bold: true },
            { text: '☐ Attached  ☐ Pending  ☐ Lost (explanation required)' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        listStart: 2,
        listStyleType: 'decimal',
        children: [
            { text: 'Receipt/Invoice #: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        listStart: 3,
        listStyleType: 'decimal',
        children: [
            { text: 'Supporting Files: ', bold: true },
            { text: '☐ Original Receipt  ☐ Invoice  ☐ Itinerary  ☐ Agenda  ☐ Attendee List' },
        ],
    },
    {
        type: 'h3',
        children: [
            { text: 'Reimbursement Details' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        listStyleType: 'disc',
        children: [
            { text: 'Reimbursable: ', bold: true },
            { text: '☐ Yes  ☐ No' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        listStyleType: 'disc',
        children: [
            { text: 'Submitted in Expense System: ', bold: true },
            { text: '☐ Yes (Report #_____)  ☐ No' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        listStyleType: 'disc',
        children: [
            { text: 'Payment Status: ', bold: true },
            { text: '☐ Pending  ☐ Approved  ☐ Paid  ☐ Rejected' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        listStyleType: 'disc',
        children: [
            { text: 'Reimbursement Date: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        listStyleType: 'disc',
        children: [
            { text: 'Reimbursement Method: ', bold: true },
            { text: '☐ Direct Deposit  ☐ Check  ☐ Payroll  ☐ Other' },
        ],
    },
    {
        type: 'callout',
        variant: 'warning',
        icon: '⚠️',
        children: [
            {
                type: 'p',
                children: [
                    { text: 'Important: Per company policy and IRS requirements, all business expenses must be submitted within 60 days of incurring the expense. Maintain all original receipts for expenses over $25 for at least 7 years. Expenses over $75 require itemized receipts for IRS compliance.' },
                ],
            },
        ],
    },
    {
        type: 'h3',
        children: [
            { text: 'Processing (Finance Team Use)' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Processed By: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Processing Date: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Notes: ', bold: true },
            { text: '' },
        ],
    },
]; 
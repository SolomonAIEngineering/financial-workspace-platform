import type { Value } from '@udecode/plate';

// Basic Transaction Note Template
export const basicNoteTemplate: Value = [
    {
        type: 'h2',
        children: [
            { text: 'Transaction Overview' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Comprehensive record of transaction details for financial tracking, reporting, and compliance.' },
        ],
    },
    {
        type: 'h3',
        children: [
            { text: 'Essential Information' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Transaction Purpose: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Date Recorded: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Payment Method: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Transaction Category: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Associated Department: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'h3',
        children: [
            { text: 'Financial Details' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        listStyleType: 'disc',
        children: [
            { text: 'Budget Code: ' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        listStyleType: 'disc',
        children: [
            { text: 'Account Number: ' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        listStyleType: 'disc',
        children: [
            { text: 'GL Category: ' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        listStyleType: 'disc',
        children: [
            { text: 'Tax Status: ' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        listStyleType: 'disc',
        children: [
            { text: 'Invoice/Reference #: ' },
        ],
    },
    {
        type: 'h3',
        children: [
            { text: 'Approvals & Verification' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Authorized By: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Verification Status: ', bold: true },
            { text: '☐ Pending  ☐ Verified  ☐ Requires Additional Review' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Verified By: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'h3',
        children: [
            { text: 'Required Actions' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        listStyleType: 'decimal',
        children: [
            { text: '' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        listStart: 2,
        listStyleType: 'decimal',
        children: [
            { text: '' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        listStart: 3,
        listStyleType: 'decimal',
        children: [
            { text: '' },
        ],
    },
    {
        type: 'h3',
        children: [
            { text: 'Record Keeping' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Document Links: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Supporting Files: ', bold: true },
            { text: '☐ Receipt  ☐ Invoice  ☐ Contract  ☐ Email Approval' },
        ],
    },
    {
        type: 'callout',
        variant: 'info',
        icon: '📊',
        children: [
            {
                type: 'p',
                children: [
                    { text: 'Finance Tip: Ensure all transaction details align with the company\'s chart of accounts and financial policies. Include all supporting documentation for audit purposes.' },
                ],
            },
        ],
    },
]; 
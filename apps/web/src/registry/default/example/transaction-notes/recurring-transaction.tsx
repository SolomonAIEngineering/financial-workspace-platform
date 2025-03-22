import type { Value } from '@udecode/plate';

// Recurring Transaction Note Template
export const recurringTransactionTemplate: Value = [
    {
        type: 'h2',
        children: [
            { text: 'Recurring Transaction Management' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Track and manage subscription services, recurring payments, and scheduled transactions. Use this template for better forecasting and budget planning.' },
        ],
    },
    {
        type: 'h3',
        children: [
            { text: 'Subscription Information' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Service Provider/Vendor: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Subscription/Service Name: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'Account Number/ID: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'h3',
        children: [
            { text: 'Payment Schedule' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        listStyleType: 'disc',
        children: [
            { text: 'Recurring Frequency: ', bold: true },
            { text: 'Daily/Weekly/Monthly/Quarterly/Annual' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        listStyleType: 'disc',
        children: [
            { text: 'Payment Amount: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        listStyleType: 'disc',
        children: [
            { text: 'Next Payment Date: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        listStyleType: 'disc',
        children: [
            { text: 'Payment Method: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'h3',
        children: [
            { text: 'Subscription Status' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        listStyleType: 'decimal',
        children: [
            { text: 'Current Status: ', bold: true },
            { text: 'Active/On Hold/Canceled' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        listStart: 2,
        listStyleType: 'decimal',
        children: [
            { text: 'Auto-Renewal: ', bold: true },
            { text: 'Enabled/Disabled' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        listStart: 3,
        listStyleType: 'decimal',
        children: [
            { text: 'Contract End Date: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        listStart: 4,
        listStyleType: 'decimal',
        children: [
            { text: 'Notice Period Required: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'h3',
        children: [
            { text: 'Budget & Accounting' },
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
            { text: 'Tax Deductible: ', bold: true },
            { text: 'Yes/No/Partial' },
        ],
    },
    {
        type: 'p',
        children: [
            { text: 'GL Account: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'h3',
        children: [
            { text: 'Notes & Reminders' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        listStyleType: 'disc',
        children: [
            { text: 'Renewal Notes: ', bold: true },
            { text: '' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        listStyleType: 'disc',
        children: [
            { text: 'Price Change History: ' },
        ],
    },
    {
        type: 'p',
        indent: 1,
        listStyleType: 'disc',
        children: [
            { text: 'Cancellation Instructions: ' },
        ],
    },
    {
        type: 'callout',
        variant: 'info',
        icon: '📆',
        children: [
            {
                type: 'p',
                children: [
                    { text: 'Set Calendar Reminder: Add reminders for important dates like renewal deadlines, price changes, or contract review periods to avoid unexpected charges.' },
                ],
            },
        ],
    },
]; 
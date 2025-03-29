import type { Value } from '@udecode/plate';

// Client/Customer Transaction Note Template
export const clientTransactionTemplate: Value = [
  {
    type: 'h2',
    children: [{ text: 'Client Transaction Record' }],
  },
  {
    type: 'p',
    children: [
      {
        text: 'Detailed record of client/customer transactions for billing, invoicing, and relationship management.',
      },
    ],
  },
  {
    type: 'h3',
    children: [{ text: 'Client Information' }],
  },
  {
    type: 'p',
    children: [{ text: 'Client/Customer Name: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Contact Person: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Account ID: ', bold: true }, { text: '' }],
  },
  {
    type: 'h3',
    children: [{ text: 'Transaction Details' }],
  },
  {
    type: 'p',
    children: [{ text: 'Project/Service: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [
      { text: 'Transaction Type: ', bold: true },
      { text: 'Invoice/Payment/Refund/Credit' },
    ],
  },
  {
    type: 'p',
    children: [{ text: 'Transaction Date: ', bold: true }, { text: '' }],
  },
  {
    type: 'h3',
    children: [{ text: 'Billing Information' }],
  },
  {
    type: 'p',
    indent: 1,
    listStyleType: 'disc',
    children: [{ text: 'Invoice #: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    indent: 1,
    listStyleType: 'disc',
    children: [{ text: 'Amount: ' }],
  },
  {
    type: 'p',
    indent: 1,
    listStyleType: 'disc',
    children: [{ text: 'Payment Method: ' }],
  },
  {
    type: 'p',
    indent: 1,
    listStyleType: 'disc',
    children: [{ text: 'Payment Terms: ' }],
  },
  {
    type: 'h3',
    children: [{ text: 'Payment Status' }],
  },
  {
    type: 'p',
    indent: 1,
    listStyleType: 'decimal',
    children: [
      { text: 'Current Status: ', bold: true },
      { text: 'Paid/Partial/Pending/Overdue' },
    ],
  },
  {
    type: 'p',
    indent: 1,
    listStart: 2,
    listStyleType: 'decimal',
    children: [{ text: 'Payment Due Date: ' }],
  },
  {
    type: 'p',
    indent: 1,
    listStart: 3,
    listStyleType: 'decimal',
    children: [{ text: 'Days Outstanding: ' }],
  },
  {
    type: 'h3',
    children: [{ text: 'Additional Notes' }],
  },
  {
    type: 'p',
    children: [{ text: 'Special Instructions: ' }],
  },
  {
    type: 'p',
    children: [{ text: 'Follow-up Required: ' }],
  },
  {
    type: 'callout',
    variant: 'info',
    icon: '📊',
    children: [
      {
        type: 'p',
        children: [
          {
            text: 'Client Insights: Use this section to note any client feedback, preferences, or relationship details that could help with future transactions.',
          },
        ],
      },
    ],
  },
];

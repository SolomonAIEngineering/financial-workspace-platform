import type { Value } from '@udecode/plate';

// Dispute or Issue Documentation Template
export const disputeDocumentationTemplate: Value = [
  {
    type: 'h2',
    children: [{ text: 'Transaction Dispute Documentation' }],
  },
  {
    type: 'p',
    children: [
      {
        text: 'Comprehensive documentation for transaction disputes, fraud claims, or billing issues. Use this template to track all communications and resolution steps.',
      },
    ],
  },
  {
    type: 'h3',
    children: [{ text: 'Dispute Information' }],
  },
  {
    type: 'p',
    children: [
      { text: 'Issue Type: ', bold: true },
      {
        text: 'Unauthorized Charge/Double Billing/Wrong Amount/Fraud/Service Not Received/Other',
      },
    ],
  },
  {
    type: 'p',
    children: [{ text: 'Transaction Date: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Amount in Dispute: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Merchant/Counterparty: ', bold: true }, { text: '' }],
  },
  {
    type: 'h3',
    children: [{ text: 'Reporting Information' }],
  },
  {
    type: 'p',
    indent: 1,
    listStyleType: 'decimal',
    children: [{ text: 'Date Reported: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    indent: 1,
    listStart: 2,
    listStyleType: 'decimal',
    children: [{ text: 'Reported To: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    indent: 1,
    listStart: 3,
    listStyleType: 'decimal',
    children: [{ text: 'Contact Person: ' }],
  },
  {
    type: 'p',
    indent: 1,
    listStart: 4,
    listStyleType: 'decimal',
    children: [{ text: 'Case/Reference Number: ', bold: true }, { text: '' }],
  },
  {
    type: 'h3',
    children: [{ text: 'Issue Details' }],
  },
  {
    type: 'p',
    children: [{ text: 'Issue Description: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Supporting Evidence: ' }],
  },
  {
    type: 'h3',
    children: [{ text: 'Resolution Timeline' }],
  },
  {
    type: 'p',
    indent: 1,
    listStyleType: 'disc',
    children: [{ text: 'Initial Contact Date: ' }],
  },
  {
    type: 'p',
    indent: 1,
    listStyleType: 'disc',
    children: [{ text: 'Follow-up Dates: ' }],
  },
  {
    type: 'p',
    indent: 1,
    listStyleType: 'disc',
    children: [
      { text: 'Expected Resolution Date: ', bold: true },
      { text: '' },
    ],
  },
  {
    type: 'h3',
    children: [{ text: 'Resolution Steps' }],
  },
  {
    type: 'p',
    indent: 1,
    listStyleType: 'decimal',
    children: [{ text: 'Steps Taken: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    indent: 1,
    listStart: 2,
    listStyleType: 'decimal',
    children: [{ text: 'Next Actions Required: ' }],
  },
  {
    type: 'p',
    indent: 1,
    listStart: 3,
    listStyleType: 'decimal',
    children: [
      { text: 'Resolution Status: ', bold: true },
      { text: 'Pending/In Review/Resolved/Rejected' },
    ],
  },
  {
    type: 'p',
    indent: 1,
    listStart: 4,
    listStyleType: 'decimal',
    children: [{ text: 'Outcome Details: ' }],
  },
  {
    type: 'h3',
    children: [{ text: 'Financial Impact' }],
  },
  {
    type: 'p',
    indent: 1,
    listStyleType: 'disc',
    children: [{ text: 'Provisional Credit Received: Yes/No' }],
  },
  {
    type: 'p',
    indent: 1,
    listStyleType: 'disc',
    children: [{ text: 'Date of Provisional Credit: ' }],
  },
  {
    type: 'p',
    indent: 1,
    listStyleType: 'disc',
    children: [{ text: 'Final Resolution Amount: ' }],
  },
  {
    type: 'callout',
    variant: 'warning',
    icon: '⏱️',
    children: [
      {
        type: 'p',
        children: [
          {
            text: 'Time-Sensitive: Most financial institutions have strict timeframes for dispute resolution. Credit card disputes typically must be filed within 60 days of the statement date on which the error appeared.',
          },
        ],
      },
    ],
  },
];

import type { Value } from '@udecode/plate';

// Financial Review and Audit Template
export const financialReviewTemplate: Value = [
  {
    type: 'h2',
    children: [{ text: 'Financial Review & Audit Documentation' }],
  },
  {
    type: 'p',
    children: [
      {
        text: 'Comprehensive documentation for financial reviews, audits, and compliance verification of transactions.',
      },
    ],
  },
  {
    type: 'h3',
    children: [{ text: 'Review Information' }],
  },
  {
    type: 'p',
    children: [
      { text: 'Review Type: ', bold: true },
      {
        text: '☐ Monthly Reconciliation  ☐ Quarterly Review  ☐ Annual Audit  ☐ Special Investigation  ☐ Compliance Check',
      },
    ],
  },
  {
    type: 'p',
    children: [{ text: 'Reviewer: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Review Date: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Review Period: ', bold: true }, { text: '' }],
  },
  {
    type: 'h3',
    children: [{ text: 'Transaction Assessment' }],
  },
  {
    type: 'p',
    children: [
      { text: 'Verification Status: ', bold: true },
      {
        text: '☐ Verified  ☐ Flagged  ☐ Requires Correction  ☐ Under Investigation',
      },
    ],
  },
  {
    type: 'p',
    children: [
      { text: 'Documentation Complete: ', bold: true },
      { text: '☐ Yes  ☐ No - Missing Items Listed Below' },
    ],
  },
  {
    type: 'p',
    children: [
      { text: 'Policy Compliant: ', bold: true },
      { text: '☐ Yes  ☐ No (see issues below)' },
    ],
  },
  {
    type: 'p',
    children: [
      { text: 'Authorization Verified: ', bold: true },
      { text: '☐ Yes  ☐ No  ☐ N/A' },
    ],
  },
  {
    type: 'h3',
    children: [{ text: 'Accounting Verification' }],
  },
  {
    type: 'p',
    indent: 1,
    listStyleType: 'disc',
    children: [
      { text: 'GL Account Correct: ', bold: true },
      { text: '☐ Yes  ☐ No - Correction Required' },
    ],
  },
  {
    type: 'p',
    indent: 1,
    listStyleType: 'disc',
    children: [
      { text: 'Tax Classification Correct: ', bold: true },
      { text: '☐ Yes  ☐ No - Correction Required' },
    ],
  },
  {
    type: 'p',
    indent: 1,
    listStyleType: 'disc',
    children: [
      { text: 'Supporting Documents Sufficient: ', bold: true },
      { text: '☐ Yes  ☐ No - Additional Documentation Required' },
    ],
  },
  {
    type: 'p',
    indent: 1,
    listStyleType: 'disc',
    children: [
      { text: 'Budget Impact Assessment: ', bold: true },
      { text: '☐ Within Budget  ☐ Over Budget  ☐ Requires Reallocation' },
    ],
  },
  {
    type: 'h3',
    children: [{ text: 'Audit Findings' }],
  },
  {
    type: 'p',
    children: [{ text: 'Issues Identified: ', bold: true }],
  },
  {
    type: 'p',
    indent: 1,
    listStyleType: 'decimal',
    children: [{ text: '' }],
  },
  {
    type: 'p',
    indent: 1,
    listStart: 2,
    listStyleType: 'decimal',
    children: [{ text: '' }],
  },
  {
    type: 'p',
    indent: 1,
    listStart: 3,
    listStyleType: 'decimal',
    children: [{ text: '' }],
  },
  {
    type: 'h3',
    children: [{ text: 'Required Actions' }],
  },
  {
    type: 'p',
    children: [{ text: 'Corrective Actions Needed: ', bold: true }],
  },
  {
    type: 'p',
    indent: 1,
    listStyleType: 'decimal',
    children: [{ text: '' }],
  },
  {
    type: 'p',
    indent: 1,
    listStart: 2,
    listStyleType: 'decimal',
    children: [{ text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Action Assignee: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Due Date: ', bold: true }, { text: '' }],
  },
  {
    type: 'h3',
    children: [{ text: 'Compliance Notes' }],
  },
  {
    type: 'p',
    children: [
      { text: 'Regulatory Considerations: ', bold: true },
      { text: '' },
    ],
  },
  {
    type: 'p',
    children: [
      { text: 'Risk Assessment: ', bold: true },
      { text: '☐ Low  ☐ Medium  ☐ High' },
    ],
  },
  {
    type: 'p',
    children: [{ text: 'Policy Recommendations: ', bold: true }, { text: '' }],
  },
  {
    type: 'h3',
    children: [{ text: 'Resolution Tracking' }],
  },
  {
    type: 'p',
    children: [
      { text: 'Resolution Status: ', bold: true },
      { text: '☐ Open  ☐ In Progress  ☐ Resolved  ☐ Verified' },
    ],
  },
  {
    type: 'p',
    children: [{ text: 'Resolution Date: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Verified By: ', bold: true }, { text: '' }],
  },
  {
    type: 'callout',
    variant: 'info',
    icon: '📋',
    children: [
      {
        type: 'p',
        children: [
          {
            text: 'Review Notes: This review follows standard accounting practices and company financial policies. All findings must be addressed according to the resolution timeline and verified by finance leadership. Documentation is subject to regulatory retention requirements.',
          },
        ],
      },
    ],
  },
];

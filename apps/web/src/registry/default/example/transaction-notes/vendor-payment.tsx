import type { Value } from '@udecode/plate';

// Vendor Payment Documentation Template
export const vendorPaymentTemplate: Value = [
  {
    type: 'h2',
    children: [{ text: 'Vendor Payment Documentation' }],
  },
  {
    type: 'p',
    children: [
      {
        text: 'Comprehensive documentation for vendor payments, supplier management, and accounts payable tracking.',
      },
    ],
  },
  {
    type: 'h3',
    children: [{ text: 'Vendor Information' }],
  },
  {
    type: 'p',
    children: [{ text: 'Vendor Name: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Vendor ID: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [
      { text: 'Vendor Category: ', bold: true },
      {
        text: '☐ Preferred Supplier  ☐ Strategic Partner  ☐ Contract Vendor  ☐ One-time Vendor  ☐ Small Business',
      },
    ],
  },
  {
    type: 'p',
    children: [{ text: 'Vendor Contact: ', bold: true }, { text: '' }],
  },
  {
    type: 'h3',
    children: [{ text: 'Payment Details' }],
  },
  {
    type: 'p',
    children: [{ text: 'Invoice Number: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Invoice Date: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Due Date: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [
      { text: 'Payment Terms: ', bold: true },
      {
        text: '☐ Net 15  ☐ Net 30  ☐ Net 45  ☐ Net 60  ☐ Upon Receipt  ☐ Other: ______',
      },
    ],
  },
  {
    type: 'p',
    children: [
      { text: 'Payment Status: ', bold: true },
      { text: '☐ Scheduled  ☐ Processing  ☐ Completed  ☐ On Hold  ☐ Disputed' },
    ],
  },
  {
    type: 'h3',
    children: [{ text: 'Payment Method & Processing' }],
  },
  {
    type: 'p',
    indent: 1,
    listStyleType: 'disc',
    children: [
      { text: 'Payment Method: ', bold: true },
      {
        text: '☐ ACH/Direct Deposit  ☐ Wire Transfer  ☐ Check  ☐ Credit Card  ☐ Other',
      },
    ],
  },
  {
    type: 'p',
    indent: 1,
    listStyleType: 'disc',
    children: [{ text: 'Payment Reference #: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    indent: 1,
    listStyleType: 'disc',
    children: [{ text: 'Transaction Date: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    indent: 1,
    listStyleType: 'disc',
    children: [{ text: 'Processing Batch: ', bold: true }, { text: '' }],
  },
  {
    type: 'h3',
    children: [{ text: 'Invoice & Order Details' }],
  },
  {
    type: 'p',
    children: [{ text: 'Purchase Order #: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Contract Reference: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Products/Services: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Department/Cost Center: ', bold: true }, { text: '' }],
  },
  {
    type: 'h3',
    children: [{ text: 'Accounting Classification' }],
  },
  {
    type: 'p',
    indent: 1,
    listStyleType: 'disc',
    children: [{ text: 'GL Account(s): ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    indent: 1,
    listStyleType: 'disc',
    children: [
      { text: 'Tax Classification: ', bold: true },
      { text: '☐ Taxable  ☐ Non-Taxable  ☐ Exempt  ☐ Tax Included' },
    ],
  },
  {
    type: 'p',
    indent: 1,
    listStyleType: 'disc',
    children: [{ text: 'Budget Line Item: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    indent: 1,
    listStyleType: 'disc',
    children: [
      { text: 'Project Code (if applicable): ', bold: true },
      { text: '' },
    ],
  },
  {
    type: 'h3',
    children: [{ text: 'Approval Information' }],
  },
  {
    type: 'p',
    children: [{ text: 'Approver(s): ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Approval Date: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [
      { text: 'Approval Level: ', bold: true },
      {
        text: '☐ Department  ☐ Manager  ☐ Director  ☐ Executive  ☐ Multiple Approvals Required',
      },
    ],
  },
  {
    type: 'p',
    children: [
      { text: 'Special Authorization: ', bold: true },
      { text: '☐ Not Required  ☐ Required & Obtained  ☐ Exception Granted' },
    ],
  },
  {
    type: 'h3',
    children: [{ text: 'Receipt & Verification' }],
  },
  {
    type: 'p',
    indent: 1,
    listStyleType: 'decimal',
    children: [
      { text: 'Items/Services Received: ', bold: true },
      { text: '☐ Yes - Complete  ☐ Yes - Partial  ☐ No' },
    ],
  },
  {
    type: 'p',
    indent: 1,
    listStart: 2,
    listStyleType: 'decimal',
    children: [{ text: 'Receipt Date: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    indent: 1,
    listStart: 3,
    listStyleType: 'decimal',
    children: [{ text: 'Receipt Verified By: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    indent: 1,
    listStart: 4,
    listStyleType: 'decimal',
    children: [
      { text: 'Quality/Condition: ', bold: true },
      { text: '☐ Satisfactory  ☐ Issues Noted (detail below)' },
    ],
  },
  {
    type: 'h3',
    children: [{ text: 'Documentation Attached' }],
  },
  {
    type: 'p',
    children: [
      {
        text: '☐ Original Invoice  ☐ Purchase Order  ☐ Packing Slip  ☐ Contract  ☐ Receiving Documents  ☐ W-9  ☐ Insurance Certificate',
      },
    ],
  },
  {
    type: 'h3',
    children: [{ text: 'Notes & Follow-up Items' }],
  },
  {
    type: 'p',
    children: [{ text: 'Special Instructions: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Issues/Discrepancies: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Required Actions: ', bold: true }, { text: '' }],
  },
  {
    type: 'callout',
    variant: 'info',
    icon: '📝',
    children: [
      {
        type: 'p',
        children: [
          {
            text: 'AP Processing Notes: Ensure all vendor payments follow company payment policies and approval matrix. Three-way match verification (PO, receipt, invoice) is required for purchases over $1,000. Maintain complete documentation for audit purposes.',
          },
        ],
      },
    ],
  },
  {
    type: 'p',
    children: [{ text: 'Processed By: ', bold: true }, { text: '' }],
  },
  {
    type: 'p',
    children: [{ text: 'Processing Date: ', bold: true }, { text: '' }],
  },
];

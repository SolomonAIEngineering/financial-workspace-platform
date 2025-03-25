/** @jsxRuntime classic */
/** @jsx jsx */
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react'
import { jsx } from '@udecode/plate-test-utils'

jsx

// Template 1: Client Payment Received
export const clientPaymentTemplate: any = (
  <fragment>
    <hh2>Client Payment</hh2>
    <hp>
      Document payment details from clients, including method, amount, and
      applicable invoice numbers.
    </hp>
    <hp> Payment information to include: </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Client name: [Client Name] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment amount: $[Amount] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment method: [Method] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Invoice number: [Invoice #] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Date received: [Date] </htext>
    </hp>
    <element type={HorizontalRulePlugin.key}>
      <htext />
    </element>
    <hp>
      <htext>Additional notes: [Notes] </htext>
    </hp>
  </fragment>
)

// Template 2: Vendor Payment Sent
export const vendorPaymentTemplate: any = (
  <fragment>
    <hh2>Vendor Payment</hh2>
    <hp>
      Track outgoing payments to vendors, contractors, and service providers.
    </hp>
    <hp> Payment details: </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Vendor name: [Vendor Name] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment amount: $[Amount] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment method: [Method] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Purchase order: [PO #] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Date sent: [Date] </htext>
    </hp>
    <element type={HorizontalRulePlugin.key}>
      <htext />
    </element>
    <hp>
      <htext>Payment notes: [Notes] </htext>
    </hp>
  </fragment>
)

// Template 3: Expense Report
export const expenseReportTemplate: any = (
  <fragment>
    <hh2>Expense Report</hh2>
    <hp>
      Document business expenses for accounting, reimbursement, and tax
      purposes.
    </hp>
    <hp> Expense details: </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Employee name: [Name] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Expense category: [Category] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Amount: $[Amount] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Date incurred: [Date] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Receipt attached: [Yes / No] </htext>
    </hp>
    <element type={HorizontalRulePlugin.key}>
      <htext />
    </element>
    <hp>
      <htext>Expense justification: [Notes] </htext>
    </hp>
  </fragment>
)

// Template 4: Invoice Creation
export const invoiceCreationTemplate: any = (
  <fragment>
    <hh2>Invoice Creation</hh2>
    <hp>
      Track new invoices sent to clients for products or services rendered.
    </hp>
    <hp> Invoice information: </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Client name: [Client Name] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Invoice number: [Invoice #] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Amount: $[Amount] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Issue date: [Date] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Due date: [Date] </htext>
    </hp>
    <element type={HorizontalRulePlugin.key}>
      <htext />
    </element>
    <hp>
      <htext>Services / products included: [Description] </htext>
    </hp>
  </fragment>
)

// Template 5: Bank Transfer
export const bankTransferTemplate: any = (
  <fragment>
    <hh2>Bank Transfer</hh2>
    <hp>
      Document transfers between accounts for record - keeping and
      reconciliation.
    </hp>
    <hp> Transfer details: </hp>
    <hp indent={1} listStyleType="disc">
      <htext>From account: [Account # / Name] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>To account: [Account # / Name] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Transfer amount: $[Amount] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Date of transfer: [Date] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Reference number: [Ref #] </htext>
    </hp>
    <element type={HorizontalRulePlugin.key}>
      <htext />
    </element>
    <hp>
      <htext>Transfer purpose: [Purpose] </htext>
    </hp>
  </fragment>
)

// Template 6: Refund Processed
export const refundProcessedTemplate: any = (
  <fragment>
    <hh2>Refund Processed</hh2>
    <hp>
      Document customer refunds for returns, cancellations, or adjustments.
    </hp>
    <hp> Refund details: </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Customer name: [Name] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Original sale date: [Date] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Refund amount: $[Amount] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Refund method: [Method] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Date processed: [Date] </htext>
    </hp>
    <element type={HorizontalRulePlugin.key}>
      <htext />
    </element>
    <hp>
      <htext>Reason for refund: [Reason] </htext>
    </hp>
  </fragment>
)

// Template 7: Subscription Renewal
export const subscriptionRenewalTemplate: any = (
  <fragment>
    <hh2>Subscription Renewal</hh2>
    <hp>Track recurring payments and subscription renewals for services.</hp>
    <hp> Subscription information: </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Customer / account: [Name] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Subscription type: [Type] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Renewal amount: $[Amount] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Billing cycle: [Monthly / Quarterly / Annual] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Next renewal date: [Date] </htext>
    </hp>
    <element type={HorizontalRulePlugin.key}>
      <htext />
    </element>
    <hp>
      <htext>Change in service: [Note any changes] </htext>
    </hp>
  </fragment>
)

// Template 8: Tax Payment
export const taxPaymentTemplate: any = (
  <fragment>
    <hh2>Tax Payment</hh2>
    <hp>
      Document tax payments to government agencies for compliance and record -
      keeping.
    </hp>
    <hp> Tax payment details: </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Tax type: [Income / Sales / Property] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Period covered: [Quarter / Year] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Amount paid: $[Amount] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment method: [Method] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Confirmation number: [Conf #] </htext>
    </hp>
    <element type={HorizontalRulePlugin.key}>
      <htext />
    </element>
    <hp>
      <htext>Notes for tax filing: [Notes] </htext>
    </hp>
  </fragment>
)

// Template 9: Payroll Processing
export const payrollProcessingTemplate: any = (
  <fragment>
    <hh2>Payroll Processing</hh2>
    <hp>Document employee compensation, deductions, and tax withholdings.</hp>
    <hp> Payroll information: </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Pay period: [Start Date - End Date] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Total gross wages: $[Amount] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Total deductions: $[Amount] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Total net pay: $[Amount] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment date: [Date] </htext>
    </hp>
    <element type={HorizontalRulePlugin.key}>
      <htext />
    </element>
    <hp>
      <htext>Special adjustments: [Notes] </htext>
    </hp>
  </fragment>
)

// Template 10: Asset Purchase/Sale
export const assetTransactionTemplate: any = (
  <fragment>
    <hh2>Asset Transaction</hh2>
    <hp>
      Document acquisition or disposal of business assets for accounting and tax
      purposes.
    </hp>
    <hp> Asset information: </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Asset description: [Description] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Transaction type: [Purchase / Sale] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Transaction amount: $[Amount] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Counterparty: [Name] </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Transaction date: [Date] </htext>
    </hp>
    <element type={HorizontalRulePlugin.key}>
      <htext />
    </element>
    <hp>
      <htext>Asset depreciation / appreciation notes: [Notes] </htext>
    </hp>
  </fragment>
)

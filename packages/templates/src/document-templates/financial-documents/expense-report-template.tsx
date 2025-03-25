/** @jsxRuntime classic */
/** @jsx jsx */
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react'
import { jsx } from '@udecode/plate-test-utils'

jsx

// Expense Report Template with enhanced details
export const expenseReportTemplate: any = (
  <fragment>
    <hh1>Expense Report</hh1>
    <hp>
      Comprehensive documentation of business expenses for proper accounting,
      reimbursement processing, budgeting, and tax compliance purposes.
    </hp>

    <hh3>Employee/Submitter Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Employee name: [Full Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Employee ID: [ID Number]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Department: [Department]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Manager/Supervisor: [Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Email address: [Email]</htext>
    </hp>

    <hh3>Expense Details</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Expense date: [Date Incurred]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>
        Expense category: [Travel/Meals/Office
        Supplies/Equipment/Software/Other]
      </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Subcategory (if applicable): [Subcategory]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Vendor/Merchant: [Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Amount: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Currency: [USD/EUR/GBP/Other]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Exchange rate (if applicable): [Rate]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Tax amount (if tracked separately): $[Amount]</htext>
    </hp>

    <hh3>Documentation</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Receipt attached: [Yes/No]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Receipt image filename: [Filename]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Invoice number (if applicable): [Invoice #]</htext>
    </hp>

    <hh3>Business Purpose</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Project code/Client: [Code/Client Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Business purpose: [Brief Description]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Attendees (for meals/entertainment): [Names]</htext>
    </hp>

    <hh3>Reimbursement Details</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Reimbursement method: [Direct Deposit/Check/Cash/Other]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment account: [Last 4 digits]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Expense report submission date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Approval status: [Pending/Approved/Rejected]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Approver name: [Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Date of approval/rejection: [Date]</htext>
    </hp>

    <element type={HorizontalRulePlugin.key}>
      <htext />
    </element>

    <hh3>Accounting Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>GL account/Cost center: [Account/Center]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Budget line item: [Line Item]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Tax deductible: [Yes/No/Partially]</htext>
    </hp>
    <hp>
      <htext>
        Expense justification: [Detailed explanation of business necessity,
        unusual circumstances, etc.]
      </htext>
    </hp>
  </fragment>
)

export default expenseReportTemplate

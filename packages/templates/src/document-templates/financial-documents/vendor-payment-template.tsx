/** @jsxRuntime classic */
/** @jsx jsx */
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react'
import { jsx } from '@udecode/plate-test-utils'

jsx

// Vendor Payment Template with enhanced details
export const vendorPaymentTemplate: any = (
  <fragment>
    <hh1>Vendor Payment Record</hh1>
    <hp>
      Detailed documentation of outgoing payments to vendors, contractors, and
      service providers for comprehensive expense tracking and vendor
      relationship management.
    </hp>

    <hh3>Vendor Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Vendor name: [Vendor Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Vendor ID/Account number: [ID/Number]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Vendor contact person: [Contact Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Contact email/phone: [Email/Phone]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Vendor tax ID/EIN: [Tax ID/EIN]</htext>
    </hp>

    <hh3>Payment Details</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Payment amount: $[Amount]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment method: [ACH/Wire Transfer/Check/Credit Card/Other]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Transaction ID/Check number: [ID/Number]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Currency: [USD/EUR/GBP/Other]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Exchange rate (if applicable): [Rate]</htext>
    </hp>

    <hh3>Order Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Purchase order number: [PO #]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Invoice number: [Invoice #]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Invoice date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Invoice due date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment status: [Paid in Full/Partial Payment]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Remaining balance (if any): $[Amount]</htext>
    </hp>

    <hh3>Transaction Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Date sent: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Expected delivery date: [Date]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Authorized by: [Employee Name]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Expense category/GL account: [Category/Account]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Tax deductible: [Yes/No]</htext>
    </hp>

    <element type={HorizontalRulePlugin.key}>
      <htext />
    </element>

    <hh3>Additional Information</hh3>
    <hp indent={1} listStyleType="disc">
      <htext>Goods/Services purchased: [Description]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Associated project/department: [Project/Department]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Payment terms: [Net 30/Upon Receipt/etc.]</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Early payment discount applied: [Yes/No - Details]</htext>
    </hp>
    <hp>
      <htext>
        Payment notes: [Special conditions, issues, future considerations, etc.]
      </htext>
    </hp>
  </fragment>
)

export default vendorPaymentTemplate
